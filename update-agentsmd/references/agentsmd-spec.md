# 参考資料: AGENTS.md 標準仕様

- 仕様サイト: https://agents.md/
- このサイトから読み取れない情報が必要な場合は、都度 `WebFetch` で該当ページを取得して確認すること（仕様は更新される可能性があるため、毎回このファイルの記述を過信せず実物を確認する）。

## 概要

AGENTS.md は、OpenAI Codex / Google Jules / Cursor / VS Code / GitHub Copilot / Aider / Zed など60以上のAIコーディングエージェントが共通で読み込む、エージェント向けコンテキストファイルのオープンフォーマット。**必須フィールドはない**（自由形式のMarkdown）。

## 書くべき内容（READMEを補完する立場）

- ビルド・テストコマンド
- コードスタイルガイドライン
- テスト方法・テスト指示
- コミットメッセージ／プルリクエストガイドライン
- セキュリティ上の落とし穴
- 大規模データセットの扱い
- デプロイ手順

## 書くべきでない内容

README（人間向け）と重複する以下は書かない。

- クイックスタート
- プロジェクトの紹介・説明（プロダクトの売り文句）
- 貢献ガイドライン全般

## ファイル配置ルール（モノレポ対応）

- 複数の `AGENTS.md` を配置できる。**編集対象ファイルのディレクトリツリーから見て最も近いファイルが優先**される。
- 優先順位: ①編集対象に最も近い `AGENTS.md` ＞ ②ユーザーの明示的なプロンプト指示。
- サブプロジェクトごとに専用の `AGENTS.md` を置く運用が想定されている（例: OpenAIの主要リポジトリには88ファイル存在）。

## 他ツールとの関係

- 仕様自体は `CLAUDE.md` に言及していない。Claude Codeでは `CLAUDE.md` に `@AGENTS.md` と書くことで、`AGENTS.md` の内容をインポートして読み込ませることができる。
- `update-agentsmd` スキルでは、`CLAUDE.md` が無い場合に内容を `@AGENTS.md` のみとして新規作成し、Claude CodeからもAGENTS.mdを正として参照させる。

## サンプル（仕様サイト掲載の最小例）

```markdown
# AGENTS.md

## Setup commands
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
```
