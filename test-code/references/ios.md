# iOS / Swift のテスト手順

## 実行順序と合格ライン

テストを始める前にコード品質の土台を整えるため、以下の手順をこの順序で必ず完了してください。プロジェクト形式は **Xcode プロジェクト**（`.xcodeproj` / `.xcworkspace`）と **Swift Package Manager**（`Package.swift`）の2種類を想定します。

1. **`swiftformat .` - Format**
   - 最初に `swiftformat .` を実行して、コード全体の書式を整えます。
   - SwiftFormat が未インストールであれば `brew install swiftformat` で追加してください。
   - 戻ってくる変更はフォーマット作業のみとし、意図的な機能変更は含めないでください。

2. **`swiftlint` - Lint**
   - `swiftlint` を実行して静的解析と規約チェックを行い、すべての警告とエラーを解消してください。
   - SwiftLint が未インストールであれば `brew install swiftlint` で追加してください。
   - `.swiftlint.yml` が存在しない場合は適切なルールセットで新規作成し、プロジェクトの規約に合わせてください。

3. **UnitTest - XCTest Unit Test（ブランチカバレッジ集計）**
   - **Xcode プロジェクトの場合**
     ```
     xcodebuild test \
       -scheme <SchemeName> \
       -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
       -enableCodeCoverage YES \
       -resultBundlePath TestResults.xcresult
     ```
   - **Swift Package Manager の場合**
     ```
     swift test --enable-code-coverage
     ```
   - すべてのユニットテストが成功するまで修正を繰り返してください。
   - テスト実行後、ブランチカバレッジを集計・レポート化してください。
     - Xcode プロジェクトの場合は `xcresulttool` または `slather` を使用します。
       - `slather` 未インストール時: `gem install slather` → `slather coverage --html --scheme <SchemeName> <ProjectName>.xcodeproj`
     - SPM の場合は `.build/debug/codecov/` に生成される `.json` を `llvm-cov report` で確認します。
       ```
       xcrun llvm-cov report \
         .build/debug/<TargetName> \
         -instr-profile .build/debug/codecov/default.profdata \
         -use-color
       ```
   - **合格ライン: ブランチカバレッジ 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**

4. **UI Test - XCUITest（iOS App のみ）**
   - **iOS App（`.xcodeproj` / `.xcworkspace`）の場合**
     - XCUITest を使い、主要な画面遷移・タップ操作・フォーム入力・ナビゲーションのシナリオを検証してください。
     ```
     xcodebuild test \
       -scheme <SchemeName> \
       -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest' \
       -only-testing:<UITestTargetName>
     ```
     - 既存の UI テストターゲットがあればそれを優先し、なければ Xcode で UI Test Bundle ターゲットを追加してから実行してください。
     - 失敗シナリオを修正し、すべてのシナリオが成功するまで繰り返してください。
   - **Swift Package Manager / ライブラリの場合**
     - UI 操作を伴う画面が存在しないため、UI テストステップは明示的にスキップしてください。
     - スキップした理由を記録し、そのまま次の Property-Based Test に進んでください。

5. **Property-Based Test（SwiftCheck）**
   - `SwiftCheck` を使ったプロパティベーステストを実施します。`Package.swift` または Xcode プロジェクトの依存に `SwiftCheck` を追加してください。
   - PBT はブランチカバレッジの穴埋めではなく、**人がレビューすべき重要なテストケース**を表現するために行います。ランダムな入力で仕様の不変条件・境界条件・対称性などを検証するプロパティを定義してください。
   - PBT のレベル（ユニット・シナリオ・UI）はプロダクトの性質に合わせて柔軟に選択します。ビジネスロジックの不変条件はユニットレベル、複数コンポーネントにまたがる仕様はシナリオレベルで記述することを基本とします。
   - PBT は通常の XCTest ターゲット内に記述できるため、既存の `xcodebuild test` / `swift test` コマンドで実行されます。

6. **`muter run` - Muter Mutation Test**
   - Muter によるミューテーションテストを実行し、変異を十分に殺せるまでテストコードと実装を改善してください。
   - Muter が未インストールであれば `brew install muter-mutation-testing/formulae/muter` でインストールしてください。
   - `muter.conf.yml` が存在しない場合は以下を参考に作成してください。
     ```yaml
     # Xcode プロジェクトの場合
     testCommandArguments:
       - xcodebuild
       - test
       - -scheme
       - <SchemeName>
       - -destination
       - platform=iOS Simulator,name=iPhone 16,OS=latest

     # Swift Package Manager の場合
     testCommandArguments:
       - swift
       - test
     ```
   - ユニットテストが安定していることを確認してから `muter run` を実行してください。
   - **合格ライン: ミューテーションスコア 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**

## セキュリティ検証

[共通手順](security.md) の実施条件・判定・報告に従い、以下を通常ゲートに追加する。SwiftLint や `xcodebuild analyze` の成功で代替しない。ここに示すのは macOS のシェル向けの例で、採用ツールのバージョンを固定し、プレースホルダーを対象プロジェクトに置き換える。

### CodeQL による Swift のセキュリティ静的解析

1. macOS、Xcode / Swift、CodeQL CLI bundle、Swift queries を用意する。`xcode-select -p`、`xcodebuild -version`、`swift --version`、`codeql version` を記録し、採用 CLI の対応表・リリースノートでコンパイラとの互換性を確認する。最新版の対応範囲を古い CLI に適用しない。Windows / Linux で Swift をビルドできても CodeQL の Swift 抽出は macOS が必要。
2. 共通手順の利用権・ライセンス、実行担当、ビルド対象を確認する。Swift の `none` ビルドモードは使わず、ビルドを伴う `manual` または既存 CI の `autobuild` を使う。autobuild は最大のターゲットを選び得るため、必要なアプリ・ライブラリが対象になったか確認する。Objective-C / C++ 等の混在コードは Swift 解析だけで網羅したと扱わない。
3. ロックに基づき依存を取得する。CocoaPods / Carthage を使う場合も、DB 作成前にプロジェクト既定の方法で依存を用意する。新しい DB とビルド用ディレクトリを使い、キャッシュでコンパイルが省略されないようにする。

```sh
mkdir -p reports
# 各実行で未使用のパスを選ぶ。workspace がなければ -project に置き換える
codeql database create reports/codeql-swift-db --language=swift --source-root=. \
  --command='xcodebuild clean build -workspace App.xcworkspace -scheme App -configuration Debug -destination "generic/platform=iOS Simulator" -derivedDataPath reports/codeql-derived CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO COMPILATION_CACHE_ENABLE_CACHING=NO SWIFT_ENABLE_COMPILE_CACHE=NO SWIFT_USE_INTEGRATED_DRIVER=NO'
codeql database analyze reports/codeql-swift-db \
  codeql/swift-queries:codeql-suites/swift-security-extended.qls \
  --format=sarif-latest --output=reports/codeql-swift.sarif
```

SwiftPM 単体なら DB 作成を以下に置き換える。iOS SDK が必要なターゲットはホスト向け `swift build` で代替せず Xcode の手順を使う。

```sh
codeql database create reports/codeql-swift-db --language=swift --source-root=. \
  --command='swift build --scratch-path reports/codeql-spm-build'
```

DB 作成・解析のログと SARIF を保存し、抽出対象・警告・`runs[].results` を確認する。suite / パックのバージョンも記録する。処理成功と脆弱性未検出を分け、検出時は rule ID・箇所・重大度・データフローを調査し、修正後に再解析する。既存 CI で実施する場合は macOS ランナー・ビルドとクエリ設定・対象 SHA・完了結果・SARIF または alerts を確認する。

### Address Sanitizer / Thread Sanitizer 付きテスト

- ASan はメモリアクセスの異常、TSan はデータ競合などを検査する。Swift にも適用できるが、ASan はメモリリークや未初期化メモリのすべてを検出するものではない。Swift のコンパイラ診断や Main Thread Checker も別の検査。
- ASan と TSan は同時に有効にせず、別々にビルド・テストする。Scheme / Test Plan の設定とコマンドの両方を確認し、片方だけが有効であることをビルドログ・実行結果で確かめる。
- iOS の TSan は対応する **64-bit Simulator** で実行する。iOS 実機では対象外。ASan も採用 Xcode / SDK / アーキテクチャの対応を確認する。適用可能だが必要な Simulator・メモリ・SDK がない場合は未確認とする。
- `xcodebuild -showdestinations -workspace App.xcworkspace -scheme App` 等から利用可能な destination を選ぶ。以下の `<Simulator-UDID>` はその ID に置き換える。Unit / integration を基本に、必要な UI シナリオでも対象アプリの計装を確認する。

```sh
xcodebuild test -workspace App.xcworkspace -scheme App \
  -destination 'platform=iOS Simulator,id=<Simulator-UDID>' \
  -enableAddressSanitizer YES -enableThreadSanitizer NO \
  -derivedDataPath reports/asan-derived -resultBundlePath reports/asan.xcresult \
  > reports/asan.log 2>&1
asan_status=$?
printf '%s\n' "$asan_status" > reports/asan.exit
# 終了コードを直後に記録し、ログと xcresult を確認してから別実行する
xcodebuild test -workspace App.xcworkspace -scheme App \
  -destination 'platform=iOS Simulator,id=<Simulator-UDID>' \
  -enableAddressSanitizer NO -enableThreadSanitizer YES \
  -derivedDataPath reports/tsan-derived -resultBundlePath reports/tsan.xcresult \
  > reports/tsan.log 2>&1
tsan_status=$?
printf '%s\n' "$tsan_status" > reports/tsan.exit
```

SwiftPM のホスト上で実行可能なテストは `swift test --help` と採用プラットフォームの対応を確認し、次のように分離できる。iOS アプリの Simulator テストの代替とはしない。

```sh
swift test --sanitize address --scratch-path reports/asan-spm > reports/asan-spm.log 2>&1
swift test --sanitize thread --scratch-path reports/tsan-spm > reports/tsan-spm.log 2>&1
```

各実行の終了コード、対象ターゲット、テスト件数、診断スタックを保存する。Xcode で `.xcresult` を開き、Test Report の失敗・runtime issues と生ログを確認する。CLI で読む場合は採用 Xcode の `xcrun xcresulttool help` から対応する抽出方法を選ぶ。テスト成功だけで合格にせず、Sanitizer 診断がないことも確認する。検出時は条件を再現して修正し、該当 Sanitizer と通常テストを再実行する。検査範囲は実行経路・計装済みコードに限られ、テスト 0 件や起動失敗は合格にしない。

### SwiftPM 依存ライブラリの既知脆弱性検査

1. `Package.swift` の有無だけで判断せず、`.xcodeproj/project.pbxproj` の package references、workspace とすべての `Package.resolved` を確認する。

   ```sh
   find . -name Package.resolved -not -path './.git/*' -not -path './.build/*'
   ```

   Xcode では `App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved` や `App.xcworkspace/xcshareddata/swiftpm/Package.resolved` も対象にする。古いキャッシュを含めて見つかった全ファイルを無条件に監査せず、ビルドが使うロックを選び、pins の URL・version / revision と解決済み依存を照合する。未取得なら既存の依存解決手順を実行し、意図しないロック更新がないか確認する。
2. 採用する監査ツールの **SwiftPM 形式と DB の対応** を確認する。例は OSV-Scanner **2.7.0** の `swift/packageresolved` extractor と OSV の `SwiftURL` データ。採用版の `--help`・公式実装を確認する。この版はトップレベル `pins` の `location` / `state.version` を読む。v1 の `object.pins` は読み取れないため未確認。branch / revision-only、registry / private / local 依存もバージョン照合できたと仮定しない。
3. ロックごとに監査し、JSON に全依存を出力する。以下は macOS のシェル例で、複数ロックなら出力名も分ける。

   ```sh
   osv-scanner --version
   osv-scanner scan source --x-plugins=swift/packageresolved \
     --lockfile=App.xcworkspace/xcshareddata/swiftpm/Package.resolved \
     --all-packages --format=json --output-file=reports/swiftpm-audit.json \
     2> reports/swiftpm-audit.log
   audit_status=$?
   printf '%s\n' "$audit_status" > reports/swiftpm-audit.exit
   ```

4. `results[].packages` のパッケージ名（例: `github.com/apple/swift-nio`）、`SwiftURL`、バージョン、抽出件数を元の pins と突き合わせる。推移的依存も **そのロックに解決・記録され、抽出された範囲** が対象。OSV-Scanner の再帰探索では `.gitignore` により漏れる可能性があるため、ネストしたロックは明示的に指定する。CocoaPods / Carthage や別管理のバイナリはこの監査に含めず、対応ツールで別途監査するか未確認範囲として残す。
5. OSV-Scanner 2.7.0 の終了コードは 0=検出なし、1=検出あり、127=一般エラー、128=依存の抽出なし。その他の非 0 もログと公式の終了コード定義を確認する。0 でも全 pins の照合・DB への問い合わせ完了を確認し、漏れがあれば全体合格にしない。更新確認コマンドで代替せず、advisory ID・影響版・修正版・推移的な依存経路を調べて修正・再監査する。

既知脆弱性の DB 収録範囲に限られ、未検出は安全の保証ではない。DB / ネットワーク / 形式対応が不足する場合は、対応版の監査ツールや承認済み代替手段を再開条件にする。ソース送信を伴う新しい外部サービスを無断で導入しない。検出あり・未検出・v1 非対応の実行証跡は [security-validation.md](security-validation.md) を参照する。

## 設定と補足

- format → lint → unit（coverage 集計含む）→ UI → PBT → mutation の順に個別で実行し、前のステップに失敗がないことを確認してから次へ進んでください。
- この順序を維持し、通常テスト成功後の ASan / TSan、CodeQL、依存監査も最終判定までに実施してください。既存 CI が担当する場合も、対象 SHA の完了結果と成果物を確認します。
- 失敗を修正したら、変更の影響を受けるステップを再実行してください。
- XCTest のテストターゲットが未整備であれば Xcode の「File > New > Target > Unit Testing Bundle」で追加し、テスト対象モジュールへの依存関係を設定してください。
- シミュレーターが起動していない場合は `open -a Simulator` で起動するか、`xcrun simctl list devices available` で利用可能なデバイスを確認してください。
- Muter はデフォルトでソースファイルを自動検出しますが、生成コードや不要ファイルを除外したい場合は `muter.conf.yml` の `exclude` フィールドで指定してください。
- カバレッジが 90% に届かない場合は、未カバーのブランチを特定し、境界値テストや条件分岐テストを追加してください。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。
- PBT は通常のテストとは役割が異なります。カバレッジのためではなく「この仕様は常に成り立つか」を表現するプロパティを選んで記述し、レビュアーが仕様を読み取れる質の高いテストにしてください。

## サンプル対話

**User:** この画面の実装が終わったので品質ゲートを通してください。

**Agent:** `swiftformat .` → `swiftlint` → XCTest Unit Test（ブランチカバレッジ集計）→ XCUITest（iOS Appの場合）→ PBT → Muter の順に実行します。SwiftLintで未使用importの警告が出たので削除してから進めます。

## 参考文献

- https://github.com/nicklockwood/SwiftFormat
- https://github.com/realm/SwiftLint
- https://developer.apple.com/documentation/xctest
- https://developer.apple.com/documentation/xctest/user_interface_tests
- https://github.com/SlatherOrg/slather
- https://github.com/muter-mutation-testing/muter
- [Apple: Sanitizer の用途・制限](https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early)
- [Apple: CI と Package.resolved](https://developer.apple.com/documentation/xcode/building-swift-packages-or-apps-that-use-them-in-continuous-integration-workflows)
- [GitHub: Swift の CodeQL ビルド条件](https://docs.github.com/en/code-security/reference/code-scanning/codeql/build-options-for-compiled-languages)
- [GitHub: DB 作成と Swift のビルド例](https://docs.github.com/en/code-security/tutorials/customize-code-scanning/prepare-code-for-analysis)
- [OSV-Scanner: 監査コマンド](https://google.github.io/osv-scanner/usage/scan-source/)
- [OSV-Scanner: extractor の選択](https://google.github.io/osv-scanner/experimental/manual-plugin-selection/)
- [OSV-Scalibr: Package.resolved extractor](https://github.com/google/osv-scalibr/blob/v0.5.3/extractor/filesystem/language/swift/packageresolved/packageresolved.go)
