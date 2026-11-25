# neko3cs Agent Skills

各エージェントハーネスで使用する共通スキルです。

## 配置先

このリポジトリは、各ハーネスのスキルディレクトリとして以下に配置します。
配置先ごとに別の clone で、symlink では繋いでいません。片方で変更して push したら、もう片方で `git pull` して揃えます。

| ハーネス | 配置先 |
| :--- | :--- |
| Claude Code | `~/.claude/skills` |
| Codex | `~/.agents/skills` |
| GitHub Copilot CLI | `~/.agents/skills` |
| Antigravity | `~/.gemini/skills` |

## 利用可能なスキル

| スキル | 説明 |
| :--- | :--- |
| **dotnet-scripting** | C# file-based apps と `dotnet run -` を使い、.NET でワンライナーや小さなデータ処理スクリプトを実行する方法を案内します。 |
| **hello-world** | グローバルスキルの構造を示すための基本的なサンプルです。 |
| **python-scripting** | `uv` を使って Python スクリプトを実行し、外部依存関係はインライン依存関係で宣言する運用を案内します。 |
| **test-code** | プロジェクト構成と変更対象から .NET・iOS/Swift・TypeScript・Go の品質ゲートを選び、CodeQL・Sanitizer・依存脆弱性検査の適用条件と結果も確認します。Go は標準ツールを優先します。 |
| **refactor-code** | AIが書いた冗長なTypeScript / Go / C# / Swift のコードとテストを、振る舞いを変えずに人間が読みやすい形へリファクタリングします。ドキュメントコメントは削らずに質を上げます。 |
| **refactor-skill** | 肥大化・パッチが積み重なったスキル（`SKILL.md` と付随ファイル）を、意図を保ったまま分類・原則化・構造分離でリファクタリングします。 |
| **update-agentsmd** | AGENTS.md の作成・更新・見直し全般（別作業の途中での小さな修正も含む）で、別AIへの引き継ぎ状態を作ります。コードから分からない暗黙知（非自明な理由・落とし穴・再発防止の規則）を追加・更新します。 |
| **gyaru** | Claudeのチャット応答をギャル口調に変換します。`gyaru:heisei` で平成ギャル、`gyaru:reiwa` で令和ギャル、指定なしは平成ギャルです。 |
| **ojousama** | Claudeのチャット応答を上品な「お嬢様」口調に変換します。優雅なやり取りをしたい時に使います。 |
