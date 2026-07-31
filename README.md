# neko3cs Agent Skills

各エージェントハーネスで使用する共通スキルです。

## 利用可能なスキル

- **create-github-issue**: `gh` コマンドとneko3cs/.githubのIssueテンプレート（バグ報告/機能要望）を使って、必須項目を埋めたGitHub Issueを作成します。
- **create-github-pullrequest**: `gh` コマンドとneko3cs/.githubのPRテンプレートを使って、実際の変更内容に基づきPull Requestを作成します。
- **dotnet-scripting**: C# file-based apps と `dotnet run -` を使い、.NET でワンライナーや小さなデータ処理スクリプトを実行する方法を案内します。
- **hello-world**: グローバルスキルの構造を示すための基本的なサンプルです。
- **python-scripting**: `uv` を使って Python スクリプトを実行し、外部依存関係はインライン依存関係で宣言する運用を案内します。
- **test-as-tdd**: TODOリスト分解とRed-Green-Refactorのサイクルで、テスト駆動開発（TDD）形式の実装を進めさせます。
- **test-ts-project**: TypeScript プロジェクトで unit、e2e、coverage、mutation テストを順番に実行させます。
- **test-dotnet-project**: .NET プロジェクトで `dotnet format`、xUnit テスト、Playwright.NET による e2e、Property-Based Test（FsCheck/CsCheck）、Stryker.NET を順に実行させます。
- **test-ios-project**: iOS/Swift プロジェクトで SwiftFormat・SwiftLint・XCTest・XCUITest・SwiftCheck（PBT）・Muter を順に実行させます。
- **resolve-issue**: 指定したGitHub Issueをブランチ作成・実装・テスト追加・PRオープンの一連の手順で解決します。
- **update-agentsmd**: AGENTS.md を作成・更新して別AIへの引き継ぎ状態を作ります。暗黙知・課題事項・事故集・スナップショットを追加・更新します。
- **update-planmd**: 着手中の作業を PLAN.md に残し、セッション・ツール・マシンをまたいで再開できるようにします。採用した方針、却下した選択肢、次の一手を記録します。
- **design-docs**: 設計ドキュメント4ファイル（requirements / specification / architecture / design）をテンプレートから作成し、変更内容に応じて更新すべきファイルを振り分けます。
- **gyaru**: Claudeのチャット応答をギャル口調に変換します。`gyaru:heisei` で平成ギャル、`gyaru:reiwa` で令和ギャル、指定なしは平成ギャルです。
- **ojousama**: Claudeのチャット応答を上品な「お嬢様」口調に変換します。優雅なやり取りをしたい時に使います。
