---
name: create-issue
description: Creates a GitHub Issue with the gh CLI using neko3cs/.github's org-wide ISSUE_TEMPLATE forms (bug_report.yml / feature_request.yml), filling every required field from the user's request and composing the body in GitHub's rendered heading format. Use whenever a GitHub Issue (bug report or feature request) is being filed in a neko3cs org repository — when the user asks ("create an issue", "file a bug", "Issueを作って", "バグ報告を起票して", "機能要望をIssueにして", "○○の機能が欲しいのでIssueを作って"), or when a workflow step says to file one. Also use when recording context on an existing Issue as a comment — background, investigation results, or the course of a discussion ("add a comment to the issue", "Issueにコメントして", "調査結果をIssueに残して", "議論の経緯をIssueに残して").
license: MIT
---

# create-issue Skill

## 概要

GitHub Issueを作成する際は、必ず `gh` コマンドを使い、`neko3cs/.github` リポジトリで管理されている2つのIssueテンプレート（バグ報告 / 機能要望）のいずれかに従って作成します。`blank_issues_enabled: false` のため、テンプレートを使わない空のIssueは作成しません。

## Issue に残すもの

Issue は、ユーザーの要望を書く場所です。何を作るかの合意や受け入れ基準の作り込みは、設計文書で行うもので、このスキルの範囲外です。要望を聞く途中で分かったことは、後で設計や実装をする人が会話を持たずに読めるよう、Issue に書き残します。

| 残す先 | 残すもの |
| :--- | :--- |
| Issue 本文 | 要望。テンプレートのフィールドに書く |
| Issue コメント | 要望を聞く途中で生じた考え・暗黙知・調査結果のうち、本文に入れると長すぎるものや経緯（既存コードの挙動、外部仕様、選ばなかった案とその理由など） |

- 本文には合意の対象だけを置き、長い調査結果や経緯はコメントに分ける。
- 残すのは、次に読む人が会話を持たずに困るものに限る。作業の実況や、コードを読めば分かることは書かない。
- 同じ話題のコメント（ある調査の結果、ある論点の結論など）の内容が変わったら、新しいコメントを足さず、既存のコメントを書き換える（`gh api -X PATCH repos/{owner}/{repo}/issues/comments/<コメントID> -f body=...`）。古い内容が並ぶと、次に読む人が迷うため。ただし、人に判断を問うコメントは新しく書く（書き換えでは通知が飛ばないため）。

## 実行手順

### 1. テンプレートを選ぶ

- ユーザーの依頼内容が「バグ報告」か「機能要望」かを判断する。
- 判断が難しい場合は、ユーザーにどちらか確認する。

### 2. テンプレートの最新定義を取得する

テンプレートは `neko3cs/.github` 側で更新される可能性があるため、**作成のたびに最新のYAMLを取得し、それだけを正とする**。フィールドの構成をこのスキルの記述や記憶から補わない。

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
- 受け入れ条件を書くフィールドがあれば、完了の目安をチェックボックスの箇条書きで簡潔に書く。入力と期待結果の表などの作り込みは、設計文書で行うため求めない。「テストを書く」など、プロダクトの振る舞いではない条件は書かない。
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

## 起票後に分かったことを残す

起票した後の議論で、考え・暗黙知・調査結果が生じたら、その Issue にコメントとして書く（手順6と同じ方法）。

- 議論の結果、要望が変わる場合は、本文も更新する（`gh issue edit <番号> --body-file <一時ファイル>`）。本文はテンプレートの見出し形式を保つ。
- 本文を更新したら、何をなぜ変えたかをコメントにも書く。本文には変更の経緯が残らないため。同じ論点の経緯を書いたコメントが既にあれば、そのコメントを書き換える（「Issue に残すもの」）。

## 注意事項

- `blank_issues_enabled: false` のため、テンプレートを使わない空のIssueは作成しない。
- テンプレートのフィールド構成は変更される可能性があるため、作成の都度ステップ2で最新定義を取得し、それに従う。
- ユーザー提供内容に個人情報・社外秘情報が含まれていないかを確認したうえで本文に反映する。

## 参考文献

- ISSUE_TEMPLATE一覧: https://github.com/neko3cs/.github/tree/main/.github/ISSUE_TEMPLATE
- バグ報告: https://github.com/neko3cs/.github/blob/main/.github/ISSUE_TEMPLATE/bug_report.yml
- 機能要望: https://github.com/neko3cs/.github/blob/main/.github/ISSUE_TEMPLATE/feature_request.yml

## サンプル対話

**User:** ログイン画面がクラッシュするのでIssueを作ってください。

**Agent:** バグ報告として作成します。最新のテンプレート定義を取得し、そこにある必須項目を会話内容から埋め、そのまま作成します。[`gh issue create` を実行] Issueを作成しました。URL: ...

**User:** ○○機能を追加してほしいです。

**Agent:** 機能要望として作成します。最新のテンプレートで必須の項目のうち、なぜ必要か（動機）が会話から分からないので、伺ってもよいですか？

**User:** （動機を回答）

**Agent:** [`gh issue create` を実行] Issueを作成しました。URL: ...

**User:** さっき調べた既存APIの制約もIssueに残しておいて。

**Agent:** 要望は変わらないので、本文はそのままにし、調べた制約をIssueにコメントとして書きました。URL: ...
