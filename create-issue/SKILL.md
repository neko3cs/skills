---
name: create-issue
description: Creates a GitHub Issue with the gh CLI using neko3cs/.github's org-wide ISSUE_TEMPLATE forms (bug_report.yml / feature_request.yml), filling every required field and composing the body in GitHub's rendered heading format. Use whenever a GitHub Issue (bug report or feature request) is being filed in a neko3cs org repository — when the user asks ("create an issue", "file a bug", "Issueを作って", "バグ報告を起票して", "機能要望をIssueにして"), or when a workflow step says to file one. Also use when recording requirements context on an existing Issue as a comment — background, investigation results, or decisions from discussing its requirements ("add a comment to the issue", "Issueにコメントして", "調査結果をIssueに残して", "要件の議論をIssueに残して").
license: MIT
---

# create-issue Skill

## 概要

GitHub Issueを作成する際は、必ず `gh` コマンドを使い、`neko3cs/.github` リポジトリで管理されている2つのIssueテンプレート（バグ報告 / 機能要望）のいずれかに従って作成します。`blank_issues_enabled: false` のため、テンプレートを使わない空のIssueは作成しません。

## Issue に残すもの

Issue の作成は要件定義です。要件を検討する途中で分かったことは、後で設計や実装をする人が会話を持たずに読めるよう、Issue に書き残します。

| 残す先 | 残すもの |
| :--- | :--- |
| Issue 本文 | 合意の対象（説明、動機、受け入れ条件、対応スコープ外など）。テンプレートのフィールドに書く |
| Issue コメント | 要件を検討する途中で生じた考え・暗黙知・調査結果のうち、本文に入れると長すぎるものや経緯（既存コードの挙動、外部仕様、選ばなかった案とその理由など） |

- 本文には合意の対象だけを置き、長い調査結果や経緯はコメントに分ける。
- 残すのは、次に読む人が会話を持たずに困るものに限る。作業の実況や、コードを読めば分かることは書かない。

## 実行手順

### 1. テンプレートを選ぶ

- ユーザーの依頼内容が「バグ報告」か「機能要望」かを判断する。
- 判断が難しい場合は、ユーザーにどちらか確認する。

### 2. テンプレートの最新定義を取得する

テンプレートは `neko3cs/.github` 側で更新される可能性があるため、[スナップショット](references/issue-templates-snapshot.md)を流用せず、**作成のたびに最新のYAMLを取得する**。

```bash
gh api repos/neko3cs/.github/contents/.github/ISSUE_TEMPLATE/bug_report.yml --jq '.content' | base64 -d
gh api repos/neko3cs/.github/contents/.github/ISSUE_TEMPLATE/feature_request.yml --jq '.content' | base64 -d
```

取得したYAMLから次を読み取る。

- `title`: タイトルに付与するプレフィックス（例: `[Bug]: `）
- `labels`: 付与するラベル（例: `bug`、`enhancement`）
- `body`: 各フィールドの `id` / `label` / `required` / `placeholder`

### 3. 各フィールドの内容を埋める

- `required: true` のフィールドは必ず内容を埋める。会話やコードから判断できない場合は、推測で埋めずユーザーに質問する。
- 任意フィールドは、書く内容がなければそのセクション自体を省略する（空見出しを作らない）。
- `placeholder` は記入例（プレースホルダー）であり、そのまま転記しない。
- 受け入れ条件（`acceptance_criteria`）は次のように書く。
  - 計算・変換・入力チェックなど、入力から結果が決まる条件は、入力と期待結果の表で書く。決まらない行（境界値、欠けたデータ、異常系）は推測で埋めず、期待結果を `？` のまま残す。
  - 見た目・操作感など表にできない条件は、チェックボックスの箇条書きで書く。
  - 「テストを書く」など、プロダクトの振る舞いではない条件は書かない。
- `type: dropdown`（例: 影響度）は選択肢の中から該当するものを1つ選ぶ。判断がつかない場合は推測せずユーザーに確認する。
- `type: checkboxes`（例: 確認事項の「機密情報を含めていません」）は、実際に確認したうえでチェックを入れる。特に機密情報チェックは注意事項の確認と直結するため、内容を精査せずに機械的にチェックしない。

### 4. Issue本文を組み立てる

GitHub Issue Formsは送信時に各フィールドを `### {label}` の見出し＋内容に変換してIssue本文を生成する。`gh issue create --template` は対話入力前提のため、非対話で確実に全フィールドを反映させるには、この見出し形式の本文を自分で組み立て、`--body` / `--body-file` で渡す。

```markdown
### 説明

...

### 再現手順

1. ...
2. ...
```

フィールドの順序はYAMLの `body` の順序に揃える。

### 5. `gh issue create` を実行する

```bash
gh issue create -R <owner>/<repo> \
  --title "[Bug]: ログイン画面でクラッシュする" \
  --body-file <一時ファイル> \
  --label bug
```

- 対象リポジトリは特に指定がなければ作業中のリポジトリ（`origin`）を使う。別リポジトリ向けの場合は `-R owner/repo` を明示する。
- ラベルはテンプレートYAMLの `labels` をそのまま使う（バグ報告→`bug`、機能要望→`enhancement`）。
- 本文は改行・見出しを含むため、シェルのクォート崩れを避けるためスクラッチディレクトリに一時ファイルを作成し `--body-file` で渡す。作成後は一時ファイルを削除する。
- 必須項目が会話やコードから判断できずユーザーへの質問が必要な場合を除き、内容が揃い次第このステップまで確認なしで進めて作成する。作成後にIssue URLを提示する。

### 6. 本文に入れなかったことを Issue コメントに書く

起票までの会話で分かった調査結果や経緯のうち、本文に入れなかったもの（「Issue に残すもの」）があれば、作成した Issue にコメントとして書く。無ければ書かない。

```bash
gh issue comment <番号> -R <owner>/<repo> --body-file <一時ファイル>
```

## 起票後に要件を補う

起票した後の要件の議論で、考え・暗黙知・調査結果が生じたら、その Issue にコメントとして書く（手順6と同じ方法）。

- 議論の結果、合意の対象（受け入れ条件、対応スコープ外など）が変わる場合は、本文も更新する（`gh issue edit <番号> --body-file <一時ファイル>`）。本文はテンプレートの見出し形式を保つ。
- 本文を更新したら、何をなぜ変えたかをコメントにも書く。本文には変更の経緯が残らないため。

## 注意事項

- `blank_issues_enabled: false` のため、テンプレートを使わない空のIssueは作成しない。
- テンプレートのフィールド構成は変更される可能性があるため、[スナップショット](references/issue-templates-snapshot.md)を過信せず、作成の都度ステップ2で最新定義を取得する。
- ユーザー提供内容に個人情報・社外秘情報が含まれていないかを確認したうえで本文に反映する。

## 参考文献

- ISSUE_TEMPLATE一覧: https://github.com/neko3cs/.github/tree/main/.github/ISSUE_TEMPLATE
- バグ報告: https://github.com/neko3cs/.github/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml
- 機能要望: https://github.com/neko3cs/.github/blob/main/.github/ISSUE_TEMPLATE/feature_request.yml

## サンプル対話

**User:** ログイン画面がクラッシュするのでIssueを作ってください。

**Agent:** バグ報告として作成します。最新のテンプレート定義を取得し、再現手順・期待する動作・実際の動作・バージョン・影響度・受け入れ条件などの必須項目を会話内容から埋め、そのまま作成します。[`gh issue create` を実行] Issueを作成しました。URL: ...

**User:** ○○機能を追加してほしいです。

**Agent:** 機能要望として作成します。動機/ユースケースと提案する解決策が必須項目なので、その内容を伺ってもよいですか？

**User:** （動機とユースケースを回答）

**Agent:** [`gh issue create` を実行] Issueを作成しました。URL: ...

**User:** さっき調べた既存APIの制約もIssueに残しておいて。

**Agent:** 受け入れ条件は変わらないので、本文はそのままにし、調べた制約をIssueにコメントとして書きました。URL: ...
