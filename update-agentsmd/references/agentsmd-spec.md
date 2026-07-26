# 参考資料: AGENTS.md 標準仕様（https://agents.md/ の内容）

このファイルは仕様サイトの記述内容を写したもの。**このスキル固有の判断基準は含まない**（それは `SKILL.md` 側）。仕様は更新されるため、ここに無い情報が必要になったら都度 `WebFetch` で実物を確認する。

## 概要

コーディングエージェントに指示を与えるための、シンプルでオープンなフォーマット。README.md を補完する専用の指示ファイル。60,000以上のOSSプロジェクトで使われている。

Linux Foundation 傘下の Agentic AI Foundation が管理。OpenAI Codex / Amp / Google Jules / Cursor / Factory の協働から生まれた。

## なぜ README と分けるのか

README.md は人間の貢献者向けにクイックスタートを提供するもの。AGENTS.md はエージェントが必要とする「ビルド手順・テスト・規約といった、時に詳細なコンテキスト」を担う。

分離する理由は3つ。

- エージェントに対して、指示の置き場所を明確かつ予測可能にする
- README を人間向けに簡潔なまま保てる
- 既存ドキュメントを散らかさずにエージェント固有の指示を書ける

## 書くべき内容

推奨セクション。

- プロジェクト概要（Project overview）
- ビルド・テストコマンド
- コードスタイルガイドライン
- テスト方法・テスト指示
- セキュリティ上の考慮事項
- コミットメッセージ／プルリクエストガイドライン
- デプロイ手順

**必須フィールドは無い。**「AGENTS.md は単なる標準の Markdown。好きな見出しを使ってよい」とされる、意図的に柔軟な仕様。

## 書くべきでない内容

明示的な除外リストは仕様サイトに無い。設計思想として「README を散らかすもの、人間の貢献者に関係しないもの」を避ける立場が示されているのみ。

## ファイル配置ルール（モノレポ対応）

- モノレポでは各パッケージディレクトリに AGENTS.md を置く。「エージェントはディレクトリツリー上で最も近いファイルを自動的に読むため、最も近いものが優先される」
- OpenAI のリポジトリはこの方式で88個のネストしたファイルを持つ
- 指示が衝突した場合の優先順位: ①編集対象ファイルに最も近い AGENTS.md ＞ ②ユーザーの明示的なチャット指示（後者が全てを上書きする）

## 対応ツール

OpenAI Codex / Google Jules / Cursor / Factory / Aider / Zed / VS Code / GitHub Copilot / Cognition の Devin と Windsurf / JetBrains Junie ほか15以上。

## 移行方法

既存の指示ファイルからの移行は、リネーム＋後方互換用のシンボリックリンク。

```bash
mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md
```

ツール個別の設定。

- Aider: `.aider.conf.yml` に `read: AGENTS.md` を追加
- Gemini CLI: `.gemini/settings.json` に `"fileName": "AGENTS.md"` を設定

## 他ツールとの関係（仕様サイト外の補足）

- 仕様自体は `CLAUDE.md` に言及していない。Claude Code では `CLAUDE.md` に `@AGENTS.md` と書くことで内容をインポートできる。

## FAQ

| 質問 | 回答 |
| :--- | :--- |
| 必須フィールドはある？ | 無い。完全に自由な Markdown |
| 指示が衝突したら？ | 編集対象に最も近い AGENTS.md が勝つ。ユーザーの明示的なチャット指示は全てを上書きする |
| エージェントはテストコマンドを自動実行する？ | する。書いてあれば関連するチェックを実行し、失敗を修正しようとする |
| 後から更新していい？ | もちろん。AGENTS.md は生きたドキュメントとして扱う |

## サンプル（仕様サイト掲載）

```markdown
# Sample AGENTS.md

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to packages
- Run `pnpm install --filter <project_name>` for workspace visibility

## Testing instructions
- Find CI plan in `.github/workflows`
- Run `pnpm turbo run test --filter <project_name>`
- Fix errors until full test suite passes

## PR instructions
- Title format: [<project_name>] <Title>
- Run `pnpm lint` and `pnpm test` before committing
```
