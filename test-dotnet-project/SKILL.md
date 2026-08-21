---
name: test-dotnet-project
description: Ensures .NET projects run format, xUnit unit/e2e, and mutation tests sequentially until each step succeeds.
license: MIT
---

# test-dotnet-project Skill

## 概要

このスキルを実行したら、実装後に必ずテストの全ステップ（format / unit / e2e / mutation）を1から順に走らせ、各ステップが成功するまで継続することを求めます。失敗があれば1のステップへ戻り、修正と再実行を繰り返して合格させてください。

## 実行順序と合格ライン

テストを始める前にコード品質の土台を整えるため、以下の手順をこの順序で必ず完了してください。多くの .NETプロジェクトでは `.slnx` または `.csproj` を基準に `dotnet` CLIから実行できます。

1. **`dotnet format` - Format**
   - 最初に `dotnet format` を実行して、ソリューションまたは対象プロジェクト全体の書式を整えます。
   - 可能な限り `.slnx` を起点に実行し、Analyzerやcode styleの指摘も含めて差分を解消してください。戻ってくる変更はフォーマット作業のみとし、意図的な機能変更は含めないでください。
2. **`dotnet test` - xUnit UnitTest**
   - xUnitのUnitTestプロジェクトを対象に `dotnet test` を実行し、ユニットテストがすべて成功するまで修正を繰り返してください。
   - ソリューション内に複数のテストプロジェクトがある場合は、ユニットテスト用プロジェクトを明示的に選び、失敗箇所を先に解消してから次の段階へ進んでください。
   - Coverletによる、Branch Coverageの集計をおこなってください。
   - Coverletの結果は `dotnet-reportgenerator-globaltool` を使ってレポート化してください。
     - インストールされていなければインストールしてください。（`dotnet tool install -g dotnet-reportgenerator-globaltool`）
   - **合格ライン: ブランチカバレッジ 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**
3. **`dotnet test` - xUnit e2e Test**
   - **ASP.NET Core プロジェクトの場合**
     - Playwright.NETを利用したxUnitのe2eテストを実行し、画面遷移、認証、フォーム送信、主要フローなどのシナリオが安定して成功するまで調整してください。
     - 既存のe2eプロジェクトがあればそれを優先し、無ければPlaywright.NETベースのテストプロジェクトを追加してブラウザのインストールまで含めて整備します。
   - **WPF / Console プロジェクトの場合**
     - 有効で再現性の高いe2e手法をこのスキルでは前提にしないため、e2eステップは明示的にスキップしてください。
     - スキップした理由を記録し、そのまま次のMutation Testに進んでください。
4. **Property-Based Test（FsCheck / CsCheck）**
   - プロパティベーステストを実施します。xUnit と統合しやすい `FsCheck.Xunit` または `CsCheck` を推奨します。未導入であれば `dotnet add package FsCheck.Xunit` 等で追加してください。
   - PBT はブランチカバレッジの穴埋めではなく、**人がレビューすべき重要なテストケース**を表現するために行います。ランダムな入力で仕様の不変条件・境界条件・対称性などを検証するプロパティを定義してください。
   - PBT のレベル（ユニット・シナリオ・E2E）はプロダクトの性質に合わせて柔軟に選択します。ビジネスロジックの不変条件はユニットレベル、複数レイヤーにまたがる仕様はシナリオレベルで記述することを基本とします。
   - PBT は通常の xUnit テストと同じ `dotnet test` コマンドで実行されるため、既存のテストパイプラインに自動的に組み込まれます。
5. **`dotnet stryker` - Stryker.NET Mutation**
   - Stryker.NETによるミューテーションテストを実行し、変異を十分に殺せるまでテストコードと実装を改善してください。
   - まずUnitTestが安定していることを確認したうえで、通常は単体テストプロジェクトのディレクトリから `dotnet stryker` を実行します。
   - **合格ライン: ミューテーションスコア 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**

## 設定と補足

- `dotnet format` → UnitTest → e2e → PBT → Mutationの順に個別で実行し、前のステップに失敗がないことを確認してから次へ進んでください。各ステップは成功するまで再実行し、失敗時は必要に応じて1のステップへ戻って再検証してください。
- xUnitのテストプロジェクトが未整備であれば `dotnet new xunit` で追加し、対象プロジェクトへの参照を設定してください。
- ASP.NET CoreでPlaywright.NETが未導入であれば、`Microsoft.Playwright.Xunit` など適切なパッケージを追加し、ビルド後にPlaywrightのブラウザ導入を完了させてから `dotnet test` を実行してください。
- Playwright.NETのe2eでは `WebApplicationFactory` やテスト用URL、認証状態、テストデータ初期化などを明示的に管理し、外部依存に引きずられない再現可能なテストにしてください。
- WPF / Consoleではe2eを無理に追加せず、UnitTestとMutation TestおよびPBTの品質を高めることを優先してください。
- Coverletや `--collect:"XPlat Code Coverage"` がすでに導入されている場合は、その結果を補助指標として使い、分岐や境界値の不足を補ってからStryker.NETに進んでください。カバレッジが 90% に届かない場合は、未カバーのブランチを特定し、境界値テストや条件分岐テストを追加してください。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。
- Stryker.NETの設定では対象ファイル、除外設定、テストプロジェクト、タイムアウトを明示的に管理し、必要であれば `stryker-config.json` などを整備してください。
- PBT は通常のテストとは役割が異なります。カバレッジのためではなく「この仕様は常に成り立つか」を表現するプロパティを選んで記述し、レビュアーが仕様を読み取れる質の高いテストにしてください。

## サンプル対話

**User:** ログイン機能を実装したので品質ゲートを通してください。

**Agent:** `dotnet format` → xUnit UnitTest（ブランチカバレッジ集計）→ e2e（ASP.NET Coreの場合）→ PBT → Stryker.NET の順に実行します。ブランチカバレッジが87%だったので、未カバーの分岐（null入力時のバリデーション）にテストを追加してから次に進めます。

## 参考文献

- https://learn.microsoft.com/ja-jp/dotnet/core/testing/unit-testing-code-coverage?tabs=linux
- https://github.com/microsoft/playwright-dotnet
- https://playwright.dev/dotnet/docs/intro
- https://learn.microsoft.com/ja-jp/dotnet/core/testing/mutation-testing
