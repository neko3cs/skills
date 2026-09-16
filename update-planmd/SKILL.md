---
name: update-planmd
description: Write or resume PLAN.md — the in-flight work spec that survives across sessions, tools, and machines. Records goals, deliverables, and machine-checkable success/failure conditions so work (including a Ralph Loop) can resume or stop correctly. Use when asked to update PLAN.md, to pause/hand off work, or to resume where work left off.
license: MIT
---

# update-planmd Skill

## 目的

いま着手している作業を、セッションが切れても別ツール・別マシン・別の人（および Ralph Loop のような自律ループ）が引き継げる形で `PLAN.md` に残します。

`PLAN.md` は「何を・誰のために・どこまでやれば終わりか」を一箇所にまとめた作業指示書です。特に `Success Conditions` と `Failure Conditions` は Ralph Loop がループを継続するか止めるかの判定材料になるため、読めば機械的に判定できる形で書きます。

`PLAN.md` は**フロー情報**（今この作業に必要な情報だけ）、[design-docs](../design-docs/SKILL.md) の4ファイルは**ストック情報**（プロジェクト全体の恒久的な情報）です。役割が違うため、内容の重複を避けません。`PLAN.md` を読むだけで作業に着手できることを優先し、`Personas` / `Issues` / `Deliverables` が `requirements.md` / `specification.md` と重複していても、そのまま `PLAN.md` に書きます。

`PLAN.md` は `AGENTS.md` と同じ英語で記述します。

## 書く内容

| セクション | 中身 |
| :--- | :--- |
| `Goals` | 何を達成するか |
| `Personas` | どんな人が利用するか。作業内容によっては省略 |
| `Issues` | 想定利用者が抱える課題。想定利用者がいない場合は、目的の背景となる課題 |
| `Deliverables` | 最終的に何を作るのか詳細に |
| `Usecases` | 作成物がどんな用途で利用されるか |
| `Success Conditions` | 何ができていたら作業終了か。数値または検証可能な状態で書く |
| `Failure Conditions` | 作業を続行しなければならない失格条件。満たさない場合は成果物を見直し、修正する |
| `Next Actions` | 次にやらなければいけない作業を具体的に書く |

`Success Conditions` と `Failure Conditions` が最も重要です。AI は要素を足し算しがちなので、`Failure Conditions`（やってはいけないことの列挙）の方が `Success Conditions` より効く場面が多いです。ここが薄いと、再開したエージェント（や Ralph Loop）が「好みの問題」を「定義から外れている」に変換できず、いつまでも収束しません。

## 書かない

- plan mode で出力した計画の全文。残すのは決定事項と判定条件だけ
- セッション内の作業リスト（`TodoWrite` と auto-memory の領域）
- コード・設定・`git log` を見れば分かること
- 色・フォントなど見た目の指示（該当ドキュメントがあればそちらへ）
- 過去に却下した選択肢の経緯・ログ。条件が変われば採用しうる選択を固定化しない。やってはいけないことは `Failure Conditions` など、その時点のインプット情報として書く
- 未確定事項の管理。仕様レベルの未決は `PLAN.md` に置かず、GitHub Issue へ回す
- 仕様変更・他人と共有すべき未解決課題（GitHub Issue に立てる）

## 手順: 書く

1. 方針を決めた時点、および作業を中断する時点で更新する
2. 差分更新のみ
3. `Success Conditions` / `Failure Conditions` は書いた本人以外が判定できるか読み直す。曖昧なら数値か具体的な状態に言い換える
4. 仕様レベルの未決事項が出たら GitHub Issue を立てる。Issue が使えない状況（repo 未作成・オフライン等）では `PLAN.md` に書かず、ユーザーに記録を託す
5. `AGENTS.md` に `Key References` があり `PLAN.md` へのポインタが無ければ1行足す

## 手順: 再開する

1. `PLAN.md` を読む
2. `Failure Conditions` を読み、失格条件を把握する
3. `Success Conditions` を読み、終了判定基準を把握する
4. `Next Actions` から着手する
5. 着手後に判明した事実で各セクションを更新する
6. `Success Conditions` を満たしたら作業終了。`Failure Conditions` に触れたら成果物を見直し、修正してから再判定する

## 寿命

- `PLAN.md` は**常に存在させる**。着手中のものが無ければ `No work in progress.` の1行に畳む
- 畳むのは PR を出す前。恒久的な価値がある Why と制約は [update-agentsmd](../update-agentsmd/SKILL.md) で `AGENTS.md` に昇格させてから消す
- ファイルごと削除するのは、その repo で `PLAN.md` 運用をやめる時だけ

この不変条件により、運用スタイルを判定する必要がなくなります。main オンリーでは陳腐化した計画の再着手を防ぎ、ブランチや worktree では畳んだ結果が差分ゼロになりマージ衝突が起きません。

## 参考資料

- [テンプレート](references/template.md)
