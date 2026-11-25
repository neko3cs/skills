# Go のテスト手順

## ツールの方針

Go 標準ツールを優先する。Format は `go fmt`、静的解析は `go vet`、テストは `go test`、カバレッジは `go tool cover`、PBT は `testing/quick`、入力探索は標準 Fuzzing を使う。golangci-lint・Rapid・Gobco は新規の必須依存にしない。プロジェクトがすでに外部ツールを品質ゲートに採用している場合は、その検証も維持する。

ミューテーションテストには標準ツールがないため、Go 向けの既存ツールである Gremlins を使う。公開された実利用率の統計を確認できていないため、「業界で最も使われている」とは断定しない。すでに別のミューテーションツールを採用しているプロジェクトでは既存設定を優先する。

## 対象の確認

- `go.mod`、`go.work`、CI、Makefile 等から Go バージョン、対象モジュール、build tags、テストコマンドを確認する。
- 以下の `./...` は対象モジュール内の例。複数モジュールがある場合は、変更したモジュールと影響先ごとに実行する。ワークスペースのルートからの `./...` だけで全モジュールを検証したと扱わない。
- 各工程で対象パッケージ・build tags・環境を揃える。生成コード等の既存の除外方針を確認し、スコアを上げるための除外は追加しない。

## 実行順序と合格ライン

### 1. Format

```sh
go fmt ./...
```

差分を確認し、書式以外の機能変更を混ぜない。

### 2. 静的解析

```sh
go vet ./...
```

指摘を解消する。`go vet` は不審なコードを検出する静的解析であり、あらゆるスタイル違反を検査する Lint ではない。`go test` に組み込まれた一部の vet チェックだけで、この工程を実施したと扱わない。

### 3. Unit Test とデータ競合検出

```sh
go test -count=1 ./...
go test -race -count=1 ./...
```

標準の `testing` と既存のテストを使い、すべて成功させる。`-race` は対応 OS/アーキテクチャ、cgo、C コンパイラ等の要件を確認する。環境不足で実行できなければデータ競合検出は「未確認」とし、通常のテスト結果と区別する。

### 4. Integration / E2E Test

既存の統合・E2E コマンドを優先する。HTTP ハンドラーやサーバーの統合テストには標準の `net/http/httptest`、CLI の実行検証には `os/exec` を利用できる。

ハンドラー単体のテストを E2E と呼ばない。E2E が必要なサービスや CLI では実際の起動・入出力・終了まで検証する。ライブラリなど該当するシナリオがなければ理由付きで対象外とする。外部サービスやテストデータの不足で実行できない場合は未確認とする。

### 5. PBT と Fuzzing

- PBT は `testing/quick.Check` 等で仕様の不変条件、往復変換、境界条件などを検証する。通常の `TestXxx` に含め、`go test -count=1 ./...` で実行する。
- `testing/quick` は新機能追加が凍結されているが、標準ライブラリとして利用できる。複雑な入力は `quick.Generator` 等で対象仕様に合う値を生成する。
- 入力探索が有効な対象には `testing.F` による Fuzzing を追加する。Fuzzing と PBT は実行方法が異なるため、通常の `go test` で seed corpus を再実行しただけの結果を、新しい入力を探索した結果と扱わない。

```sh
go test -fuzz=^FuzzRoundTrip$ -fuzztime=30s ./internal/codec
```

上記は対象を指定する例。実際のパッケージと fuzz target に置き換え、対象ごとに時間または回数を制限して実行する。失敗入力を再現し、修正後の回帰テストに残す。

### 6. 文カバレッジ

```sh
go test -count=1 -coverpkg=./... -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

- **合格ラインは文カバレッジ 90% 以上。** `-func` の `total` と対象パッケージ、HTML レポートの場所を記録する。各パッケージの割合を単純平均しない。
- Go 標準は文カバレッジであり、ブランチカバレッジではない。`&&` / `||` の内部も完全に追跡しない。ブランチカバレッジの達成として報告しない。
- `-coverpkg` の対象にはテスト対象の自前パッケージを含め、テストのないコードを分母から安易に外さない。テスト追加後の結果で最終判定する。
- 別プロセスで起動するアプリケーションのカバレッジは上記だけで集計したと扱わない。必要な場合は標準の `go build -cover`、`GOCOVERDIR`、`go tool covdata` を用い、Unit Test の結果とは収集範囲を区別する。

### 7. ミューテーションテスト

Gremlins のプロジェクト採用バージョンを使う。未導入の場合は、対象の Go バージョンと OS に対応するリリースを選び、バージョンを固定して導入する。0.x 系ではフラグ・設定が変わり得るため、採用版の `--help` と公式ドキュメントを確認する。

モジュールのルートで、通常のテストが成功してから実行する。

```sh
gremlins unleash --threshold-efficacy 90 --threshold-mcover 90 --output=mutation.json
```

- 変異対象、除外、build tags を確認する。別パッケージの統合テストも変異の検出に使う必要がある場合は、`--integration` を検討する。
- Gremlins の Test efficacy は `KILLED / (KILLED + LIVED)`、Mutant coverage は `(KILLED + LIVED) / (KILLED + LIVED + NOT_COVERED)`。両方が 90% でも未カバーを含む全体の検出率は 81% になり得る。
- **この手順の合格ラインは、未カバーを含む検出率 `KILLED / (KILLED + LIVED + NOT_COVERED) × 100` が 90% 以上。** 上記のフラグだけで合格とせず、JSON の件数からこの値も確認する。ツール固有の指標とは別名・別の計算式として報告する。
- `NOT VIABLE` はビルド不能な変異として別記し、分母から除外する。タイムアウト・実行エラーは検出成功に数えず、内容を確認できないものが残る場合は合格を確定しない。
- 変異数が 0 なら 100% と扱わず、対象・設定を確認する。変異可能な箇所がない場合は理由付きで対象外とする。
- 実行コストが大きい場合は対象や計測範囲を明示する。変更部分だけの結果をプロジェクト全体のスコアとして報告しない。

## セキュリティ検証

通常ゲートに以下を追加する。判定・報告は `SKILL.md` の共通方針に従う。標準ツール優先の方針を維持しつつ、標準にはない CodeQL・既知脆弱性検査は目的を分ける。

- **CodeQL**: 対応 Go バージョン、対象モジュール・build tags を確認する。ローカルで明示ビルドする例は次のとおり。複数モジュールは対象ごとに新しい DB を作る。

  ```sh
  codeql database create reports/codeql-go-db --language=go --source-root=. \
    --command='go build -a ./...'
  codeql database analyze reports/codeql-go-db \
    codeql/go-queries:codeql-suites/go-security-extended.qls \
    --format=sarif-latest --output=reports/codeql-go.sarif
  ```

- **実行時検査**: 手順3の `go test -race -count=1 ./...` を使う。ASan / MSan は対応 OS / cgo / コンパイラ等を必要とするため、既存のネイティブ検査が対象として採用している場合に使い、純粋な Go に Swift の ASan / TSan を当てはめない。
- **依存監査**: Go 公式の `govulncheck` の採用バージョンを固定し、各モジュールで実行する。`go.mod` / `go.sum` / `go.work`、`replace`、vendor、Go 標準ライブラリの版、CI と同じ build tags / GOOS / GOARCH を確認する。

  ```sh
  govulncheck -version
  govulncheck -test ./... > reports/govulncheck.txt 2>&1
  ```

  Go Vulnerability Database との照合結果について、脆弱な関数への到達経路とモジュール単位の検出を区別する。ソース解析は選択したビルド構成が対象で、reflect / unsafe 等による限界も記録する。標準テキスト出力の終了コードと診断を確認する。JSON / SARIF モードは検出があっても終了コード 0 になるため、使う場合は finding を読んで判定する。

- [govulncheck の使い方・終了コード・制限](https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck)

## 参考資料

- [Go コマンド](https://pkg.go.dev/cmd/go)
- [go vet](https://pkg.go.dev/cmd/vet)
- [データ競合検出](https://go.dev/doc/articles/race_detector)
- [testing/quick](https://pkg.go.dev/testing/quick)
- [Go Fuzzing](https://go.dev/doc/security/fuzz/)
- [カバレッジ収集とレポート](https://go.dev/doc/build-cover)
- [標準 cover の計測上の制約](https://pkg.go.dev/cmd/cover)
- [Gremlins のコマンドとスコア定義](https://gremlins.dev/latest/usage/commands/unleash/)
