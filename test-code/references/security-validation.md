# セキュリティ手順の検証証跡

Issue #2 の手順追加時に、2026-10-29（JST）に実施した確認。実アプリのセキュリティ検証結果ではなく、監査コマンドと結果の判定方法の検証である。

## 実行環境と対象

- Windows x64 / PowerShell。開始時のリポジトリ SHA は `c3ac6a2da31465512be0779675a5c9a395c8d62f`、本手順の変更は未コミット状態。
- [公式リリース v2.7.0](https://github.com/google/osv-scanner/releases/tag/v2.7.0) の `osv-scanner_windows_amd64.exe` を一時フォルダーに取得し、同リリースの `osv-scanner_SHA256SUMS` と照合した。
- SHA256: `9964ed64ec9a387391eb4cc006ad5c531154821aef29b793e02c448de4686438`。
- `--version`: OSV-Scanner `2.7.0`、OSV-Scalibr `0.5.3`、commit `bfe2f84abd2f09fe0b83ba7f6dad40d296762f40`。
- OSV のオンライン DB への実問い合わせ。DB の取得時点の結果であり、後日の件数は変わり得る。ソースは送信していない。

公開パッケージの名前とバージョンを入れた人工ロックファイルを使用した。revision はテスト用の値で、ビルドや checkout はしていない。Swift のパッケージ解決や Xcode 実行が成功した証拠にはならない。

## 入力と再実行コマンド

一時フォルダー `%TEMP%/skills-issue-2` に `vulnerable` / `clean` / `legacy` ディレクトリを作り、それぞれ `Package.resolved` を保存した。`vulnerable` の入力は次の形。

```json
{"version":2,"pins":[{"identity":"swift-nio","kind":"remoteSourceControl","location":"https://github.com/apple/swift-nio.git","state":{"version":"2.0.0","revision":"c73cead"}}]}
```

`clean` は同じ形式で identity を `swift-log`、location を `https://github.com/apple/swift-log.git`、version を `1.6.4`、revision を `test-fixture` にした。`legacy` は次の v1 形式。

```json
{"version":1,"object":{"pins":[{"package":"swift-nio","repositoryURL":"https://github.com/apple/swift-nio.git","state":{"version":"2.0.0","revision":"test-fixture"}}]}}
```

PowerShell で実行したコマンド（各ケースで同じ引数）。パスは実行環境の一時フォルダーを使い、終了コードを直後に取得した。

```powershell
$taskDir = Join-Path $env:TEMP 'skills-issue-2'
foreach ($taskCase in @('vulnerable', 'clean', 'legacy')) {
    $taskCaseDir = Join-Path $taskDir $taskCase
    $taskArgs = @(
        'scan', 'source', '--x-plugins=swift/packageresolved',
        '--all-packages', '--format=json',
        '--output-file', (Join-Path $taskCaseDir 'report.json'),
        '--lockfile', (Join-Path $taskCaseDir 'Package.resolved')
    )
    & (Join-Path $taskDir 'osv-scanner_windows_amd64.exe') @taskArgs 2> (Join-Path $taskCaseDir 'scan.log')
    $taskExit = $LASTEXITCODE
    Write-Output "CASE=$taskCase EXIT=$taskExit"
}
```

## 実測結果と判定

| ケース | 終了コード / 抽出数 | 実際の結果 | 共通手順による判定 |
| :--- | :--- | :--- | :--- |
| vulnerable | 1 / 1 | `SwiftURL` / `github.com/apple/swift-nio` / `2.0.0`、5 advisory | 処理成功・検出あり。未解決のためゲート失敗。 |
| clean | 0 / 1 | `SwiftURL` / `github.com/apple/swift-log` / `1.6.4`、0 advisory | 処理成功・未検出。この1パッケージと DB の範囲だけ確認済み。 |
| legacy | 128 / 0 | `object.pins` の依存を抽出できず、JSON report は生成されなかった | 未確認。既知の依存が存在するため対象外・検出なしにしない。v1 対応ツールの用意が再開条件。 |

検出された ID と DB 内の重大度は以下。意図的に脆弱な版を選んだ検証入力なので、依存更新は行っていない。

| ID | 重大度（database_specific.severity） |
| :--- | :--- |
| GHSA-7fj7-39wj-c64f | MODERATE |
| GHSA-cq87-8r7h-962v | MODERATE |
| GHSA-mgc4-wqv7-4pxm | CRITICAL |
| GHSA-r3rc-9hpw-54v9 | HIGH |
| GHSA-rj37-6j9x-74q6 | HIGH |

`scan.log` の抜粋（ローカルの絶対パスを省略）。終了コードと JSON 内のパッケージ・advisory を併せて確認した。

```text
CASE=vulnerable EXIT=1
Scanned .../vulnerable/Package.resolved file and found 1 package
CASE=clean EXIT=0
Scanned .../clean/Package.resolved file and found 1 package
CASE=legacy EXIT=128
Scanned .../legacy/Package.resolved file and found 0 packages
No package sources found, --help for usage information.
```

ローカルの元レポートは `%TEMP%/skills-issue-2/{vulnerable,clean}/report.json`、各ログは同ディレクトリの `scan.log` に保存した。一時ファイルは永続保管を保証しないため、判定に使用した値・入力・コマンド・診断抜粋をこの文書に記録した。

## 確認範囲と未確認事項

- 確認済み: OSV-Scanner の取得元・チェックサム、採用版の CLI 引数、SwiftPM の3ケースに対する実問い合わせと判定。スキルの frontmatter 検証、ローカル参照リンク、差分の空白チェックも成功した。
- 文書レビュー: Lint とセキュリティ検査の役割、CI 対象 SHA と成果物の確認、検出あり / 未検出 / 実行不能 / 対象外の区別、他言語の適用表とコマンドを公式資料に照合した。
- 未確認: Swift CodeQL の実ビルド・SARIF 出力、Xcode の ASan / TSan 実行と `.xcresult`、SwiftPM による実依存解決。Windows 環境には必要な macOS / Xcode がないため実行していない。対応する Mac と実プロジェクト、CodeQL の利用権・CLI・パックを用意して実行することが再開条件。
- 未確認: 他言語の CodeQL / 依存監査 / ネイティブ計装コマンドの実プロジェクト実行。対象アプリや CI をこのリポジトリに追加しておらず、今回の文書変更を他言語の実検証成功とは扱わない。
- このリポジトリにはビルド・テストスイート・CI がない。アプリのカバレッジやミューテーションスコアを測定したとは報告しない。
