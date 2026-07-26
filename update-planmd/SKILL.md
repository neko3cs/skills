---
name: update-planmd
description: Write or resume PLAN.md — the in-flight work baton that survives across sessions, tools, and machines. Records the chosen approach, the options already rejected, and the next step. Use when asked to update PLAN.md, to pause/hand off work, or to resume where work left off.
license: MIT
---

# update-planmd Skill

## 目的

いま着手している作業を、セッションが切れても別ツール・別マシン・別の人が引き継げる形で `PLAN.md` に残します。

書く対象は「**他ツール・他人・別マシンが読んで初めて意味がある情報**」だけです。Claude の auto-memory はセッションを越えて働きますが、Codex や Antigravity や Copilot はそれを読めません。`PLAN.md` はそのギャップを埋めるためだけに存在します。逆に、自分のセッション内で覚えていれば済むものは書きません。

情報の置き場所は `AGENTS.md` 側と共通です（[update-agentsmd](../update-agentsmd/SKILL.md) 参照）。`PLAN.md` は「いま着手中で覚えておきたいこと」だけを担当します。

`PLAN.md` は `AGENTS.md` と同じ英語で記述します。ここに書いた Why はそのまま `AGENTS.md` へ昇格するため、言語を揃えて転記コストをゼロにします。

## 書く内容

| セクション | 中身 |
| :--- | :--- |
| `Goal` | いま何を目指しているか。1行 |
| `Approach` | 選んだ方針と、その理由 |
| `Rejected` | 検討して却下した選択肢と、却下理由 |
| `Next` | 次の一手 |
| `Undecided` | 未確定事項。Issue を立てられるようになったら移す |

`Rejected` が最も価値の高いセクションです。記録が無いと、再開したエージェントはユーザーが既に潰した袋小路へ再突入します。ここに溜まった却下理由は `AGENTS.md` の `Tacit Knowledge` 昇格候補でもあります。

## 書かない

- plan mode で出力した計画の全文。残すのは決定と却下した選択肢だけ
- セッション内の作業リスト（`TodoWrite` と auto-memory の領域）
- コード・設定・`git log` を見れば分かること
- 仕様変更・他人と共有すべき未解決課題（GitHub Issue に立てる）

## 手順: 書く

1. 方針を決めた時点、および作業を中断する時点で更新する
2. 差分更新のみ。特に `Rejected` は消さない
3. `Undecided` が仕様レベルなら Issue を立てるようユーザーに促す
4. `AGENTS.md` に `Key References` があり `PLAN.md` へのポインタが無ければ1行足す

## 手順: 再開する

1. `PLAN.md` を読む
2. **`Rejected` を先に読む。**却下済みの方針を再提案しない
3. `Next` から着手する
4. 着手後に判明した事実で `Approach` と `Next` を更新する

## 寿命

- `PLAN.md` は**常に存在させる**。着手中のものが無ければ `No work in progress.` の1行に畳む
- 畳むのは PR を出す前。恒久的な価値がある Why と制約は [update-agentsmd](../update-agentsmd/SKILL.md) で `AGENTS.md` に昇格させてから消す
- ファイルごと削除するのは、その repo で `PLAN.md` 運用をやめる時だけ

この不変条件により、運用スタイルを判定する必要がなくなります。main オンリーでは陳腐化した計画の再着手を防ぎ、ブランチや worktree では畳んだ結果が差分ゼロになりマージ衝突が起きません。

## 参考資料

- [テンプレート](references/template.md)
