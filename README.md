# neko3cs Agent Skills

各エージェントハーネスで使用する共通スキルです。

## 利用可能なスキル

- **communication-rule**: 対話およびドキュメントで使用する言語ルールを規定します。
- **create-github-issue**: `gh` コマンドとneko3cs/.githubのIssueテンプレート（バグ報告/機能要望）を使って、必須項目を埋めたGitHub Issueを作成します。
- **create-github-pullrequest**: `gh` コマンドとneko3cs/.githubのPRテンプレートを使って、実際の変更内容に基づきPull Requestを作成します。
- **dotnet-scripting**: C# file-based apps と `dotnet run -` を使い、.NET でワンライナーや小さなデータ処理スクリプトを実行する方法を案内します。
- **git-rule**: Gitのコミットおよびプッシュ操作に対するユーザー許可を強制します。
- **hello-world**: グローバルスキルの構造を示すための基本的なサンプルです。
- **python-scripting**: `uv` を使って Python スクリプトを実行し、外部依存関係はインライン依存関係で宣言する運用を案内します。
- **test-as-tdd**: TODOリスト分解とRed-Green-Refactorのサイクルで、テスト駆動開発（TDD）形式の実装を進めさせます。
- **test-ts-project**: TypeScript プロジェクトで unit、e2e、coverage、mutation テストを順番に実行させます。
- **test-dotnet-project**: .NET プロジェクトで `dotnet format`、xUnit テスト、Playwright.NET による e2e、Stryker.NET を順に実行させます。
- **test-ios-project**: iOS/Swift プロジェクトで SwiftFormat・SwiftLint・XCTest・XCUITest・SwiftCheck（PBT）・Muter を順に実行させます。
- **resolve-issue**: 指定したGitHub Issueをブランチ作成・実装・テスト追加・PRオープンの一連の手順で解決します。
- **tool-rule**: ツールの勝手な使用やインストールを制限します。
- **update-agentsmd**: AGENTS.md（とCLAUDE.md）を作成・更新し、暗黙知・課題事項・引き継ぎ情報を含めてコンテキストゼロから作業を引き継げる状態にします。
