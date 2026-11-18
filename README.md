# neko3cs Agent Skills

各エージェントハーネスで使用する共通スキルです。

## 配置先

このリポジトリは、各ハーネスのスキルディレクトリとして以下に配置します。

| ハーネス | 配置先 |
| :--- | :--- |
| Claude Code | `~/.claude/skills` |
| Codex | `~/.codex/skills` |
| Copilot | `~/.copilot/skills` |
| Antigravity | `~/.gemini/skills` |

## 利用可能なスキル

| スキル | 説明 |
| :--- | :--- |
| **create-issue** | `gh` コマンドとneko3cs/.githubの最新のIssueテンプレート（バグ報告/機能要望）を使って、ユーザーの要望から必須項目を埋めたGitHub Issueを作成します。未決の要望は仮定と理由を明示して起票し、後続PRの質問へ引き継ぎます。途中で分かった調査結果や経緯は、Issueコメントに残します。 |
| **create-pullrequest** | `gh` コマンドとneko3cs/.githubの最新のPRテンプレートを使って、実際の変更内容に基づきPull Requestを作成します。Issueが完了するPRだけ `Closes`、設計PRなど途中の段階は `Refs` と書き分けます。既定ブランチ上の変更からは、ブランチとコミットを作ってPRにします。仮案の採否は本文とは別にPRコメントで具体的に質問します。 |
| **dotnet-scripting** | C# file-based apps と `dotnet run -` を使い、.NET でワンライナーや小さなデータ処理スクリプトを実行する方法を案内します。 |
| **hello-world** | グローバルスキルの構造を示すための基本的なサンプルです。 |
| **python-scripting** | `uv` を使って Python スクリプトを実行し、外部依存関係はインライン依存関係で宣言する運用を案内します。 |
| **test-as-tdd** | TODOリスト分解とRed-Green-Refactorのサイクルで、テスト駆動開発（TDD）形式の実装を進めさせます。 |
| **test-code** | プロジェクト構成と変更対象から .NET・iOS/Swift・TypeScript・Go の品質ゲートを選び、CodeQL・Sanitizer・依存脆弱性検査の適用条件と結果も確認します。Go は標準ツールを優先します。 |
| **refactor-code** | AIが書いた冗長なTypeScript / Go / C# / Swift のコードとテストを、振る舞いを変えずに人間が読みやすい形へリファクタリングします。ドキュメントコメントは削らずに質を上げます。 |
| **implement-design** | 設計文書をもとに、GitHub Issueを1つの実装PRで実装します。Issueと設計PRの変更を設計文書と照合して作業範囲を決め、TDDで実装して品質ゲートを通し、Ready for reviewにします。設計の不足や未決事項は仮案と理由を設計文書に明示して実装・検証し、Draft PRコメントで具体的に質問します。コミット・push・PR作成まで確認なしで進め、レビュー指摘への対応も受け持ちます。 |
| **update-agentsmd** | AGENTS.md の作成・更新・見直し全般（別作業の途中での小さな修正も含む）で、別AIへの引き継ぎ状態を作ります。コードから分からない暗黙知（非自明な理由・落とし穴・再発防止の規則）を追加・更新します。 |
| **design-docs** | 設計ドキュメント3ファイル（requirements / specification / architecture）をテンプレートから作成します。目的と成果、期待動作、実現方式と理由を分け、状態・入出力・互換性・検証リスクまで記載先を明確にします。Issue番号を渡すと、受け入れ基準と業務ルールを、Issue・PR・コードから独立して理解できる文書にします。未決事項は具体的な仮案と理由を明示して設計し、PRコメントで動作例と代替案を示して質問します。コミット・push・PR作成まで確認なしで進めます。実装はしません。 |
| **gyaru** | Claudeのチャット応答をギャル口調に変換します。`gyaru:heisei` で平成ギャル、`gyaru:reiwa` で令和ギャル、指定なしは平成ギャルです。 |
| **ojousama** | Claudeのチャット応答を上品な「お嬢様」口調に変換します。優雅なやり取りをしたい時に使います。 |

開発は「`create-issue` でIssueを立てる → `design-docs` で設計し、設計PRをマージする → `implement-design` で実装する」の順に進めます。正しい動作がすでに設計文書に書かれているバグ修正は、`implement-design` から始められます。
