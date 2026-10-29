# セキュリティ検証の共通手順

## 実施条件と順序

言語別の既存ゲートを維持した上で、通常テストが通った対象を Sanitizer 付きで再実行し、CodeQL と依存監査も完了してから最終判定する。既存 CI の順序があれば優先する。CI の追加や有料契約、外部サービスへのソース送信をこのスキルだけで許可されたとみなさない。

1. `AGENTS.md`、CI、対象ソース・マニフェスト・ロックファイルを確認する。既存の監査ツール、クエリ、対象範囲、除外、重大度の合否規約を優先する。
2. 各検証の担当をローカルまたは既存 CI に割り当てる。OS / アーキテクチャ、SDK、ビルド権限、依存取得先・脆弱性 DB への接続、ツール利用条件を確認する。
3. 以下と言語別手順に従い実行する。例中のパス・スキーム・対象言語を実プロジェクトに置き換え、成果物は実行ごとの別ディレクトリに保存する。終了コードをログ整形のパイプや `|| true` で隠さない。
4. 検出を調査・修正し、影響する通常テストとセキュリティ検証を再実行する。対象コミットが変わったら、古い CI 成果物を変更後の証拠として使わない。

## CodeQL

### 利用条件と実行方法

- CLI bundle とクエリパックの採用バージョンを固定し、公式の対応表・リリースノートで言語、SDK、コンパイラとの組み合わせを確認する。`codeql version` とパック / suite 名・バージョンを保存する。
- CodeQL CLI の利用規約と GitHub code scanning の利用条件を確認する。公開リポジトリでの利用と、非公開リポジトリで必要な GitHub Code Security 等の契約・利用権を区別し、ローカル実行なら無条件に無料と仮定しない。未契約なら自動契約せず、未確認として必要条件を示す。
- ローカル CLI は対象ソース・依存・ビルド環境へのアクセスが必要。既存 Actions を利用する場合は workflow の言語、クエリ、ビルド対象、ランナー、ジョブ権限を確認する。SARIF のアップロードには `security-events: write` 等の権限が必要になる。アップロードは既存の運用・許可に従う。
- Swift は macOS 上でビルドを抽出する。具体的なコマンドは [ios.md](ios.md) を参照する。他言語の例は以下。`<language>` は C#=`csharp`、TypeScript=`javascript-typescript`、Go=`go`。F# は C# の解析に含めない。

```sh
# TypeScript の例。C# / Go のビルド方針は言語別手順を参照
mkdir -p reports
codeql database create reports/codeql-db --language=javascript-typescript --source-root=.
codeql database analyze reports/codeql-db \
  codeql/javascript-queries:codeql-suites/javascript-security-extended.qls \
  --format=sarif-latest --output=reports/codeql.sarif
```

`security-extended` は新規に選定する場合の例で、既存の承認済み suite を優先する。対象を抽出できたか DB 作成ログ・診断・解析対象ファイル情報を確認する。キャッシュでコンパイルされなかったソースや、非対応言語を解析済みにしない。

### 結果の確認と合否

- `database analyze` の終了コード 0 は解析処理の成功であり、検出 0 件を意味しない。SARIF の `runs[].results`、ルールの重大度、診断・実行通知、抑制を確認する。空の DB、抽出失敗、一部解析不能を検出なしとして合格にしない。
- 既存 CI は `gh run view <run-id> --repo <owner/repo> --json headSha,status,conclusion,jobs,url` 等で対象 SHA と完了を確認し、SARIF artifact または同じ解析の code scanning alerts・tool status まで読む。ジョブの緑表示だけで脆弱性未検出と報告しない。
- 検出時は rule ID、箇所、データフロー、重大度、再現条件を調べて修正する。誤検出・既存の承認済み例外は根拠と対象を記録し、単なる除外追加で合格にしない。

## Sanitizer / 実行時検査

| 対象 | 適用方法と条件 |
| :--- | :--- |
| iOS / Swift | [ios.md](ios.md) の ASan と TSan を別実行する。iOS の TSan は対応する 64-bit Simulator で実行し、実機では対象外。 |
| Go | [go.md](go.md) の `go test -race` を使う。ASan / MSan は cgo 等の対応条件が必要なため、既存のネイティブ検査がある場合に限定して選ぶ。 |
| .NET / TypeScript | 通常の managed / JS コードに Xcode の ASan / TSan を適用しない。ネイティブ依存・相互運用を自前ビルドしている場合はそのビルド系の対応手順を別途確認し、未整備なら未確認とする。 |

通常テストと別のログ・結果を保存し、実際に instrument された対象と実行テスト数を確認する。テスト成功に加え、Sanitizer / race の診断がないことが合格条件。検出時はスタック・入力・並行実行条件を記録して修正・再検証する。対象は実行された経路に限られ、未実行経路・未計装バイナリの安全性は示さない。

## 依存ライブラリの既知脆弱性検査

- マニフェストだけでなく、解決済みのロックファイルと実際のビルド対象を照合する。ワークスペース・ネストしたプロジェクト・推移的依存・開発時依存を確認し、対象外のものを記録する。iOS は [ios.md](ios.md) の SwiftPM 手順を使う。
- 監査ツールの対応形式・バージョン、データソースと取得日時（オフラインなら DB 更新日時）、名前・バージョン / revision の照合方法を確認する。送信されるパッケージ名などの情報はプロジェクトの外部通信規約に従う。
- 終了コードとレポートを両方読む。監査失敗、未対応ロック形式、依存の抽出 0 件、DB 接続失敗、照合不能な private / local / revision-only 依存を「脆弱性なし」にしない。外部依存が本当にない場合だけ、調べた根拠付きで対象外とする。
- 検出時は advisory / CVE / GHSA ID、重大度、依存経路、影響バージョン、修正版、到達可能性を調べる。更新後はロック差分・通常テスト・再監査を確認する。`outdated` や更新通知は既知脆弱性検査の代わりにならない。
- DB に登録された範囲の既知脆弱性を照合する検査であり、未検出でも未知の欠陥や DB 非収録の依存の安全性は保証しない。

## 判定と報告

既存の重大度ポリシーがなければ、未解決の検出を残したまま合格にせず調査する。承認済み例外がある場合も、検出数・理由・承認根拠を残し「検出 0」と書かない。重大度の不明な検出も無視しない。

| 状態 | 報告とゲート判定 |
| :--- | :--- |
| 処理成功・検出あり | 「確認済み・検出あり」。未解決の基準違反は失敗。修正後の再実行証跡、または承認済み例外の根拠を記録する。 |
| 処理成功・検出なし | 対象抽出・検査完了・診断も確認できた範囲のみ「確認済み・未検出」。他の工程を含む全体合格とは分ける。 |
| 処理失敗 / 環境不足 | 「未確認」。エラー、残る対象、必要な権限・ライセンス・環境と再開条件を記録し、合格にしない。 |
| 非対応 / 対象なし | 「対象外」。言語・プラットフォームの非対応、または依存がない根拠を記録する。利用可能な代替検査は別項目として報告する。 |

報告には次を含める。CI の実施結果も同じ形式で扱う。

| 項目 | 記録する内容 |
| :--- | :--- |
| 再現情報 | 対象 SHA と未コミット差分、日時、OS / SDK / コンパイラ、ツール・パックのバージョン、コマンド、ローカル / CI の担当 |
| 範囲 | 言語、スキーム / ターゲット、依存・ロック、推移的依存、検査テストと除外・未対応箇所 |
| 実行結果 | 終了コード、処理成否、検出数・ID・重大度・調査対応、適用した合否ポリシー |
| 証跡 | ログ、SARIF、xcresult、監査 JSON、CI run / artifact URL、再検証結果 |
| 残課題 | 未確認理由、対象外理由、再開条件、既知の制限 |

形式例: `CodeQL: 処理成功 / 検出あり（rule ID …）/ ゲート失敗 / SHA … / suite … / reports/codeql.sarif`。Lint 成功、通常テスト成功、解析処理成功、脆弱性未検出は独立した項目にする。

## 公式資料

- [CodeQL 対応言語・コンパイラ](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/)
- [CodeQL CLI の準備・利用条件](https://docs.github.com/en/code-security/how-tos/scan-code-for-vulnerabilities/scan-from-the-command-line/setting-up-the-codeql-cli)
- [CodeQL DB の作成](https://docs.github.com/en/code-security/tutorials/customize-code-scanning/prepare-code-for-analysis)
- [CodeQL 解析と SARIF](https://docs.github.com/en/code-security/tutorials/customize-code-scanning/analyze-code)
- [CodeQL Action](https://github.com/github/codeql-action)
- [OSV-Scanner の出力と終了コード](https://google.github.io/osv-scanner/output/)
