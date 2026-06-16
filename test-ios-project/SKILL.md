---
name: test-ios-project
description: Ensures iOS/Swift projects run format, lint, XCTest unit/UI, branch coverage, and mutation tests sequentially until each step succeeds.
license: MIT
---

# test-ios-project Skill

## 概要

このスキルを実行したら、実装後に必ずテストの全ステップ（format / lint / unit / ui / coverage / mutation）を1から順に走らせ、各ステップが成功するまで継続することを求めます。失敗があれば1のステップへ戻り、修正と再実行を繰り返して合格させてください。

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

## 設定と補足

- format → lint → unit（coverage 集計含む）→ UI → PBT → mutation の順に個別で実行し、前のステップに失敗がないことを確認してから次へ進んでください。
- 各ステップは成功するまで再実行し、失敗時は必要に応じて1のステップへ戻って再検証してください。
- XCTest のテストターゲットが未整備であれば Xcode の「File > New > Target > Unit Testing Bundle」で追加し、テスト対象モジュールへの依存関係を設定してください。
- シミュレーターが起動していない場合は `open -a Simulator` で起動するか、`xcrun simctl list devices available` で利用可能なデバイスを確認してください。
- Muter はデフォルトでソースファイルを自動検出しますが、生成コードや不要ファイルを除外したい場合は `muter.conf.yml` の `exclude` フィールドで指定してください。
- カバレッジが 90% に届かない場合は、未カバーのブランチを特定し、境界値テストや条件分岐テストを追加してください。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。
- PBT は通常のテストとは役割が異なります。カバレッジのためではなく「この仕様は常に成り立つか」を表現するプロパティを選んで記述し、レビュアーが仕様を読み取れる質の高いテストにしてください。

## 期待される成果

- 実装後に6ステップを順に実行することで、iOS プロジェクトのフォーマット整形・静的解析・ユニットテスト・UI テスト・プロパティベーステスト・ミューテーションテストの信頼性が確保される。
- iOS App と Swift Package の違いを踏まえ、実行可能な UI テスト戦略だけを採用できる。
- PBT により、人がレビューすべき重要テストケースが仕様として明文化され、ランダム入力による予期せぬ回帰を防止できる。
- 各ステップは成功するまで繰り返す習慣が生まれ、合格ライン（ブランチカバレッジ ≥ 90%、ミューテーションスコア ≥ 90%）を順番に満たしていく段階的な品質向上が可能となる。

## 参考文献

- https://github.com/nicklockwood/SwiftFormat
- https://github.com/realm/SwiftLint
- https://developer.apple.com/documentation/xctest
- https://developer.apple.com/documentation/xctest/user_interface_tests
- https://github.com/SlatherOrg/slather
- https://github.com/muter-mutation-testing/muter
