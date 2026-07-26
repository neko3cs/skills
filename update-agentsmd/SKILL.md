---
name: update-agentsmd
description: Create or update AGENTS.md so a zero-context AI can continue work. Interviews the user for tacit knowledge — non-obvious "why", implicit constraints, gotchas, incidents — that isn't derivable from code. Use when asked to update AGENTS.md or prepare a handoff.
license: MIT
---

# update-agentsmd Skill

## 目的

コンテキストゼロの別AIが読むだけで作業を継続できる `AGENTS.md` を作成・更新します。

`AGENTS.md` には**決定論的で恒久的な情報だけ**を置きます。揺れる情報の逃し先はグローバルドクトリンのルーティング表に従い、着手中のものは `PLAN.md`、仕様変更や未解決課題は GitHub Issue へ回します。

`PLAN.md` と Issue はこのスキルの成果物ではありません。`PLAN.md` は既存ならそこへ追記し、無ければユーザーに作成を提案します。存在する場合は `AGENTS.md` の `Key References` に1行のポインタだけ置きます。

Issue を立てられない状況（repo 未作成・オフライン）では一時的に `PLAN.md` へ間借りさせ、立てられるようになったら移します。

ルールの優先順位: グローバルドクトリン ＞ 以下の判断基準。グローバルドクトリンは実行中のツールのグローバル指示ファイル（`~/.claude/CLAUDE.md` / `~/.codex/AGENTS.md` / `~/.gemini/GEMINI.md` / `~/.copilot/copilot-instructions.md` などにシンボリックリンクされた同一実体）を指します。

## 判断基準

1行ごとに「**この行を消したらエージェントが間違えるか**」で判断します。No なら消します。

### 書かない

- README・コード・設定ファイル・`git log` を見れば分かること（採用ライブラリ名、ディレクトリの中身、過去の修正履歴）
- 一般論（「テストを書きましょう」「型を付けましょう」）
- グローバルドクトリンや他のスキルに既にある指示の再掲
- テスト結果など、実行すれば分かる状態
- プロダクトの紹介文。仕様サイトは `Project overview` を推奨セクションに挙げていますが、README と重複する範囲は書きません

### 書く

- 非自明な Why（なぜこの設計／制約を選んだか）
- 型やコメントで表現しきれていない制約
- プロダクトの非交渉事項。AIが提案してはいけないこと
- 踏みやすい落とし穴。**説明を長文にせず、再現するテストや事故ったコミットのパスを指す**
- 実行コマンド（対応するテストスキルがあればそれを使う旨）
- 配布・運用上の外部制約（対象地域、年齢制限、外部サービスの規約など）
- 既存の設計ドキュメントへの参照。古い場合は「コードを正とする」と明記する

## 暗黙知の引き出し方

暗黙知はコードベースではなくユーザーの頭の中にしかありません。集める側の手順です。

1. 更新前に blind spot pass を1回。「このプロジェクトについて、私が言い忘れている前提はありますか」をユーザーに促す
2. 曖昧な点は `AskUserQuestion` で**1問ずつ**。`AGENTS.md` の記述が変わる質問を優先する
3. 答えが得られなければ推測で埋めない。仕様レベルの未決は Issue、着手中のものは `PLAN.md` に回す

## 手順

1. `AGENTS.md` が無ければ最小構成で新規作成する。`Commands` と落とし穴だけ。最初から埋め尽くさない
2. `CLAUDE.md` が無ければ `@AGENTS.md` の1行のみで新規作成する
3. 既存の `AGENTS.md` は差分更新のみ（全文書き換えしない）。Why 系は事実が変わらない限り残す
4. 育てるのは失敗したときだけ。実際に事故った内容を `Incidents` に足し、そこから制約を導く
5. 更新後、剪定パスを1回かける

## 参考資料

- セクション構成に迷ったら [テンプレート](references/template.md)、仕様の確認は [AGENTS.md 仕様](references/agentsmd-spec.md)
- 実例: [neko3cs/umalog の AGENTS.md](https://github.com/neko3cs/umalog/blob/main/AGENTS.md)
