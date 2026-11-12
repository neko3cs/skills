---
name: design-docs
description: Creates and maintains a project's four design documents (requirements.md, specification.md, architecture.md, design.md) from templates, routing changes to the right file and committing, pushing, and opening or updating a PR without per-operation approval. Also designs a GitHub issue by number into them — acceptance criteria, business-rule tables, "TBD" for uncertainties to resolve through PR review, self-contained specifications independent of issues, PRs, and code — without writing code. Use whenever design docs need writing or organizing ("設計ドキュメントを作って", "ドキュメントを整備して"), an issue is to be designed or its requirements defined ("design issue #4", "#4を設計して", "#4の要件定義をして", "要件定義して", "要件をまとめて"), design PR review comments are to be addressed ("設計PRのレビューを反映して"), or docs need updating after a change ("design.md を更新して", "仕様変更をドキュメントに反映して", "この実装を設計書に反映して") — whether the user asks or a workflow step says to update the docs or check docs against the code (docs are the source of truth; a mismatch is reported as a code defect, not fixed in the docs).
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

Issue 作成時に決定済みの内容を引き継ぎます。設計中に新たな不確定事項が見つかった場合は、推測で決めず、該当箇所を `TBD` として残します。PR本文に該当する節と確認したい内容をまとめ、PR作成まで進めてユーザーにレビューで確認します。レビューで決まった内容は設計文書に反映します。

## Issue から設計する

Issue 番号を渡されたら、その Issue を設計文書に落とし込みます。Issue は要望を書く場所で、何を作るかの合意と受け入れ基準の正本は設計文書です。

1. `gh issue view <番号> --comments` で本文とコメントを読み、その内容を「変わったもの」として下の判定と手順に進む。設計文書が無いリポジトリでは、新規作成モードで4ファイルを作る。Issue には書かない。
2. 受け入れ基準は、`requirements.md` の機能要件に、業務の言葉の文章で併記する。
3. 計算・変換・入力チェックなど、入力から結果が決まる規則は、`specification.md` の「業務ルール」に入力と期待結果の表で書く。表にするのは規則で、テストケースではない（[テストの扱い](references/policy.md#5-テストの扱い)）。
4. 決まらない箇所は推測で埋めず、表の期待結果も含めて `TBD` のまま残す。
5. 設計文書は Issue・PR・コードから独立して仕様を理解できるように、要望の内容・判断の理由・受け入れ基準を本文に記載する。未実装でこれから実装が必要であることを示すメモは残さない。作業範囲や進捗は PR本文に残す。
6. 書き終えたら、変えた節と、残した `TBD` の箇所・確認したい内容を PR本文に記載し、「PRで確認する」に進む。会話で確認を求めて止まらない。

設計PRへのレビュー指摘も、更新モードで設計文書を直します。

## 最初に判定する

対象ディレクトリに4ファイルが存在するか調べ、モードを決めます。

- 1つも無い → **新規作成モード**
- 1つ以上ある → **更新モード**（既存ファイルは絶対に上書きしない）
- 一部だけある → 無いファイルは新規作成モード、あるファイルは更新モード

## 手順: 新規作成モード

1. 配置先を確認する。既存の配置規約を優先し、指定がなければ既存の `docs/` 配下、無ければリポジトリ直下に置く。判断の理由は PR本文に記載する。
2. `assets/templates/` の4ファイルを配置先へコピーする。
3. リポジトリの内容（README、コード、`AGENTS.md`、Issue、ユーザーの説明）から**確認できた事実だけ**を各節に書く。Issue 番号を渡された場合は、「Issue から設計する」の手順2〜5も当てはめる。
4. 確認できない箇所は `TBD` と1行だけ残す。**推測で埋めない。** 埋められなかった項目は PR本文の確認事項にまとめる。
5. その案件に無い節（画面が無い、外部連携が無い等）は節ごと削除する。空の見出しを残さない。
6. Mermaid の空ブロックは、実際に図を描く箇所だけ埋める。埋めない空ブロックは削除する。
7. `AGENTS.md` に `architecture.md` への参照が無ければ、実際の配置先への参照追加を PR本文で提案する。今回の設計文書作成に付随して `AGENTS.md` は変更せず、「PRで確認する」に進む。

## 手順: 更新モード

1. 何が変わったかを掴む。ユーザーの説明、`git diff`、Issue、直前の実装内容を材料にする。
2. 下のルーティング表で**更新すべきファイルだけ**を選ぶ。無関係なファイルは開かない。
3. 該当ファイルの該当節だけを差分更新する。全文の書き直しはしない。Issue 番号を渡された場合は、「Issue から設計する」の手順2〜5も当てはめる。
4. 変更後、ファイル間の整合を確認する。
   - `specification.md` の機能が `requirements.md` の機能要件に無い → 要件の追加漏れ
   - `design.md` のモジュールが `architecture.md` のレイヤー構成に反する → どちらかが古い
   - コードと文書が食い違う → **文書を正とし、コードの不具合として報告する**。文書をコードに合わせて直さない（利用者が確認するのは文書のため）。コードの修正は実装の作業で、このスキルでは行わない。報告では、食い違った箇所（文書の節、コードの場所）と文書の記述を一覧にして示し、不具合として Issue にするよう人に勧める（会話だけでは次に読む人に残らないため）。ただし、Issue・設計PRの差分から設計が先行していると確認できる箇所は、不具合として扱わない
   - 人が仕様の変更として文書の更新を依頼した場合（「この実装を設計書に反映して」など）は、依頼に従って文書を直す
5. 更新した節と、変更しなかったファイルの理由を PR本文に記載し、「PRで確認する」に進む。

### ルーティング表

| 変わったもの | 更新するファイル |
| :--- | :--- |
| 目的、想定利用者、要件、スコープ、非機能の目標値、受け入れ基準 | `requirements.md` |
| 機能、業務ルール、画面、画面遷移、データモデル、外部連携、エラーメッセージ | `specification.md` |
| 技術選定、ライブラリ、全体構成、レイヤー、依存の向き、共通規約、不変条件、テスト方針 | `architecture.md` |
| モジュール・クラス構成、処理の流れ、状態遷移、データアクセス、機能ごとのテスト観点 | `design.md` |

どちらに入れるか迷う情報は、**その情報がどれくらいの頻度で変わるか**で決めます。話題の近さで決めません。判断基準は [方針の抜粋](references/policy.md) の「更新頻度による切り分けの原則」。

### ADR の書式と更新

`architecture.md` のADRは、[テンプレート](assets/templates/architecture.md)の番号付きタイトル（Title、レベル3）と本文5項目（レベル4）で記録します。本文はステータス（Status）、意思決定内容（Decision）、背景（Context）、影響（Consequences）、他に検討したもの（Alternatives Considered）の順です。番号・Status・不明事項の扱いは [ADR の記録と改定](references/policy.md#adr-の記録と改定) に従います。

決定の履歴は追記で残します。決定が変わったら新しい番号のADRを足し、新旧を相互に参照します。既存ADRの書式統一を求められた場合だけ、番号と決定内容を保持して該当箇所を整形できます。未承認の決定変更は既存の決定を保ち、`Proposed` の新規ADRとして PRで確認します。

## 書かないこと

- **テストケース・テスト手順** — テストコードを正とします。文書に書くのは方針（`architecture.md`）と観点（`design.md`）まで
- **`tasks.md` / 実装タスク一覧** — このスキルの範囲外です。着手中の作業は GitHub Issue で管理します
- **サンプル本文の創作** — 確認できないことは `TBD` にして PR本文の確認事項に記載します
- **コードを読めば分かること** — 関数シグネチャの転記、ディレクトリ一覧
- **維持できない粒度の記述** — 更新されない設計ドキュメントは「間違った地図」になります

## しないこと

- **実装** — テストやプロダクトコードは書きません

## PRで確認する

設計文書の作成・更新の依頼には、作業ブランチの作成、対象変更のコミット、push、PR作成・本文更新までを含みます。操作ごとの許可や、設計内容の事前承認を会話で求めず、レビューできる PRにして URLを提示します。マージはユーザーの判断とします。

- 既存の作業ブランチや PRがあれば再利用し、今回の対象変更だけをコミットする。実装など別の作業の一部として呼ばれた場合は、その作業のブランチ・PRに含め、別PRや途中のコミット・pushを作らず、呼び出した作業の完了手順に戻る。
- PRの起票方法と本文は、対象リポジトリの規約・指定された PRテンプレートに従う。
- 未決事項、変更案、文書とコードの食い違い、未確認の内容を PR本文に残す。判断待ちがあっても PR作成前に止まらず、必要なら Draft にする。
- 設計だけで Issue は完了しないため、関連Issueは `Closes #<番号>` ではなく `Refs #<番号>` とする。Issueが指定されていなければ、その確認だけを理由に止まらず、番号なしで PRを作る。

## 既存ファイルの扱い

`requirements.md` / `specification.md` / `architecture.md` / `design.md` は既存内容を踏まえて差分更新します。大きく作り直す必要がある場合も、節ごとの分類（残す / 消す / 別ファイルへ移す）と理由を PR本文に示し、変更案を差分として提出します。承認を会話で待たず、PR上で確認を受けます。未決事項を合意済みの事実として書き換えません。

## 参考資料

- [方針の抜粋](references/policy.md) — 判断基準
- [テンプレート](assets/templates/) — `requirements.md` / `specification.md` / `architecture.md` / `design.md`
