---
name: design-docs
description: Creates and maintains a project's four design documents — requirements.md (why/for whom), specification.md (what to build), architecture.md (how, always-on policy), design.md (how, per-feature detail) — scaffolding them from templates and routing later changes to the right file. Use when asked to write, set up, scaffold, or organize design docs for a project ("設計ドキュメントを作って", "ドキュメントを整備して", "設計書を用意して"), and equally when asked to update or refresh existing ones after a change ("design.md を更新して", "ドキュメントを最新化して", "仕様変更をドキュメントに反映して", "この実装を設計書に反映して").
license: MIT
---

# design-docs Skill

`requirements.md` / `specification.md` / `architecture.md` / `design.md` の4ファイルを作成・更新します。

| ファイル | 段階 | 更新頻度 |
| :--- | :--- | :--- |
| `requirements.md` | 前提（なぜ・誰のために作るか） | 要件が変わったときだけ |
| `specification.md` | 何を作るか（顧客と合意する粒度） | 機能が変わったとき |
| `architecture.md` | どう作るか・方針（常時読ませる） | 低い |
| `design.md` | どう作るか・詳細（機能ごとに読ませる） | 高い |

各ファイルの守備範囲、更新頻度による切り分け、テストの扱い、どの図をどこで使うかの判断は [方針の抜粋](references/policy.md) を読んでください。

## 最初に判定する

対象ディレクトリに4ファイルが存在するか調べ、モードを決めます。

- 1つも無い → **新規作成モード**
- 1つ以上ある → **更新モード**（既存ファイルは絶対に上書きしない）
- 一部だけある → 無いファイルは新規作成モード、あるファイルは更新モード

## 手順: 新規作成モード

1. 配置先を確認する。既存の `docs/` があればその配下、無ければリポジトリ直下。判断がつかなければユーザーに聞く。
2. `assets/templates/` の4ファイルを配置先へコピーする。
3. リポジトリの内容（README、コード、`AGENTS.md` / `CLAUDE.md`、Issue、ユーザーの説明）から**確認できた事実だけ**を各節に書く。
4. 確認できない箇所は `TBD` と1行だけ残す。**推測で埋めない。** 埋められなかった項目はユーザーに提示して聞く。
5. その案件に無い節（画面が無い、外部連携が無い等）は節ごと削除する。空の見出しを残さない。
6. Mermaid の空ブロックは、実際に図を描く箇所だけ埋める。埋めない空ブロックは削除する。
7. 完了後、次の一文を出力する。

   > `architecture.md` は常時読ませたい情報です。`CLAUDE.md` / `AGENTS.md` に `docs/architecture.md` への参照を1行追加することを推奨します。追加しますか？

   ユーザーが了承したら、`AGENTS.md` の `Key References` に1行足す（[update-agentsmd](../update-agentsmd/SKILL.md) 参照）。

## 手順: 更新モード

1. 何が変わったかを掴む。ユーザーの説明、`git diff`、Issue、直前の実装内容を材料にする。
2. 下のルーティング表で**更新すべきファイルだけ**を選ぶ。無関係なファイルは開かない。
3. 該当ファイルの該当節だけを差分更新する。全文の書き直しはしない。
4. 変更後、ファイル間の整合を確認する。
   - `specification.md` の機能が `requirements.md` の機能要件に無い → 要件の追加漏れ
   - `design.md` のモジュールが `architecture.md` のレイヤー構成に反する → どちらかが古い
   - コードと文書が食い違う → **コードを正とし、文書を直す**
5. 更新した節と、変更しなかったファイルの理由を1行で報告する。

### ルーティング表

| 変わったもの | 更新するファイル |
| :--- | :--- |
| 目的、想定利用者、要件、スコープ、非機能の目標値、受け入れ基準 | `requirements.md` |
| 機能、画面、画面遷移、データモデル、外部連携、エラーメッセージ | `specification.md` |
| 技術選定、ライブラリ、全体構成、レイヤー、依存の向き、共通規約、不変条件、テスト方針 | `architecture.md` |
| モジュール・クラス構成、処理の流れ、状態遷移、データアクセス、機能ごとのテスト観点 | `design.md` |

どちらに入れるか迷う情報は、**その情報がどれくらいの頻度で変わるか**で決めます。話題の近さで決めません。判断基準は [方針の抜粋](references/policy.md) の「更新頻度による切り分けの原則」。

### ADR の更新は追記のみ

`architecture.md` の技術選定の記録は、一度書いた項目を書き換えません。決定が変わったら新しい記録を足し、古い記録から新しい記録へリンクします。「いつ・なぜ方向が変わったか」を消さないためです。

## 書かないこと

- **テストケース・テスト手順** — テストコードを正とします。文書に書くのは方針（`architecture.md`）と観点（`design.md`）まで
- **`tasks.md` / 実装タスク一覧** — このスキルの範囲外です。着手中の作業は [update-planmd](../update-planmd/SKILL.md) で `PLAN.md` へ
- **サンプル本文の創作** — 確認できないことは `TBD` にしてユーザーに聞きます
- **コードを読めば分かること** — 関数シグネチャの転記、ディレクトリ一覧
- **維持できない粒度の記述** — 更新されない設計ドキュメントは「間違った地図」になります

## 既存ファイルの扱い

`requirements.md` / `specification.md` / `architecture.md` / `design.md` を**確認なしに上書き・全面書き換えしません**。既存ファイルを大きく作り直す必要があると判断した場合は、節ごとの分類（残す / 消す / 別ファイルへ移す）を理由付きの表で示し、差分を提示して、ユーザーの承認を待ちます。

## 参考資料

- [方針の抜粋](references/policy.md) — 判断基準
- [テンプレート](assets/templates/) — `requirements.md` / `specification.md` / `architecture.md` / `design.md`
