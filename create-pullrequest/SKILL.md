---
name: create-pullrequest
description: Creates a GitHub Pull Request with the gh CLI using neko3cs/.github's org-wide pull_request_template.md, filling each section from the actual diff/commits by the template's own instructions, honestly separating verified from unverified checks, and writing "Closes #N" only when the PR completes the issue ("Refs #N" for intermediate steps such as a design-docs-only PR). If uncommitted changes sit on the default branch, it creates the branch and commit first. Use whenever a Pull Request in a neko3cs org repository is being created (draft or ready) or its body is being rewritten — when the user asks ("create a PR", "open a draft PR", "PRを作って", "PR本文を更新して"), or when a workflow step says to open a PR or update its body.
license: MIT
---

# create-pullrequest Skill

## 概要

GitHubにPull Requestを作成する際は、必ず `gh` コマンドを使い、`neko3cs/.github` リポジトリで管理されているPull Requestテンプレートに従って作成します。

## 実行手順

### 1. 前提を確認する

- 現在のブランチと、ベースブランチ（通常 `main`）から分岐後の変更内容（コミット・diff）を確認する。
- 既定ブランチ上に未コミットの変更がある場合は、ブランチを作ってコミットしてからPRにする。
  - ブランチ名は、変更が設計文書だけなら `docs/issue-<番号>`、それ以外は `feature/issue-<番号>` か `fix/issue-<番号>`。
  - コミットメッセージに `Refs #<番号>` を含める。
  - 関連Issueの番号が会話から分からなければ、推測せずユーザーに聞く。関連Issueが無いと分かった場合は、変更内容から名前を付ける。
  - `AGENTS.md` に指示（worktree を使わない、など）があれば従う。
- 変更がリモートにpushされているか確認する。されていなければ、ユーザーに確認せずに push する（`git push -u origin <branch>`）。
- PRを作成するリポジトリ・ベースブランチ・ヘッドブランチを確定する。
- Draft PRで作るよう指示されている場合は、Draftとして作る。

### 2. テンプレートの最新定義を取得する

テンプレートは `neko3cs/.github` 側で更新される可能性があるため、**作成のたびに最新のテンプレートを取得し、それだけを正とする**。節の構成や書き方をこのスキルの記述や記憶から補わない。

```bash
gh api repos/neko3cs/.github/contents/.github/pull_request_template.md --jq '.content' | base64 -d
```

### 3. 各セクションを埋める

各節は、取得したテンプレートのコメント（記入の指示）に従って、実際の diff とコミットから埋める。テンプレートのコメントは本文に残さない。そのうえで、テンプレートに無い次の規則を守る。

- **関連Issueは `Closes` と `Refs` を書き分ける。** このPRがマージされた時点で、そのIssueで求められていることをすべて満たすなら `Closes #<番号>`、途中の段階（設計文書だけの変更、`未実装 #<番号>` の印が残る変更、一部だけの対応など）なら `Refs #<番号>` と書く。呼び出し元ではなくPRの中身で判断する。テンプレートのコメントが `Closes` の形式だけを示していても、この規則を優先する。関連Issueが無ければ書かない。複数ある場合は行を分ける。
- **動作確認は「確認済み」と「未確認」を正直に分ける。** 確認済みには、実際に実行・目視した内容（テストの実行、Issueや設計文書の受け入れ基準との突き合わせなど）だけを、いつ・どの環境で確認したかを添えて書く。確認していないことは、理由とともに未確認に書く。**確認していないことを確認済みに含めてはいけない**。
- 書くことが無い任意の節は、節ごと削除する。
- diff 全体を見直し、目的外の変更が混ざっていないかを確かめる。混ざっていれば、その旨を本文に書く。

### 4. 本文の文字数を確認する

Draft PRのあいだは、この文字数の範囲を適用しない（中身がまだ少ないうちに水増しをしないため）。Ready for reviewにする時点で範囲に収める。

PR本文は **1950〜2050文字の範囲**（`wc -c` のバイト数ではなく、実際の文字数）に収める。`wc -m` はロケールによって正しく数えられないことがあるため、Pythonで確認する。

```bash
python -c "print(len(open('<一時ファイル>', encoding='utf-8').read()))"
```

1950文字未満の場合は、削った情報がないか見直しつつ、各セクションの記述を補って範囲内まで厚みを増す。2050文字を超える場合は、以下の優先順位で圧縮する。**動作確認の「確認済み」「未確認」の区別と正直さは、増減の際も絶対に削らない。**

1. 任意の節を簡潔にする、または特に無ければ節ごと削除する。
2. 表や一覧は主要なものだけに絞り、説明も1行に短縮する。
3. コマンド例は代表的なものだけ残す。
4. 残りの文章を簡潔にする（内容は削らず、表現を短くする）。

調整後、再度文字数を確認し、1950〜2050文字の範囲に収まるまで繰り返す。

### 5. PRタイトルを決める

変更内容を端的に表すタイトルにする。リポジトリのコミットメッセージの規約（例: `fix:`/`feat:` プレフィックス等）に合わせる。

### 6. `gh pr create` を実行する

```bash
gh pr create -R <owner>/<repo> \
  --base main \
  --head <branch> \
  --title "..." \
  --body-file <一時ファイル>
```

- Draft PRの場合は `--draft` を付ける。
- 本文は改行・表（Markdownテーブル）を含むため、シェルのクォート崩れを避けるためスクラッチディレクトリに一時ファイルを作成し `--body-file` で渡す。作成後は一時ファイルを削除する。
- 対象リポジトリ・ベースブランチは特に指定がなければ作業中のリポジトリと `main` を使う。
- push から PR の作成まで、途中でユーザーに確認せずに進める。マージはユーザーの判断であり、このスキルの範囲はPRを開くところまで。作成後にPR URLを提示する。

## 注意事項

- テンプレートのセクション構成は変更される可能性があるため、作成の都度ステップ2で最新定義を取得し、それに従う。
- 動作確認は実態に基づいて正直に書く。レビュアーの信頼を損なうため、確認できていないことを確認済みに含めない。
- 本文は1950〜2050文字の範囲に収める（Draft PRを除く）。範囲外の場合はステップ4の方針に従って圧縮・加筆し、`gh pr create` 実行前に必ずPythonで文字数を確認する（`wc -c`/`wc -m` はバイト数やロケール依存で不正確なため使わない）。

## 参考文献

- Pull Requestテンプレート: https://github.com/neko3cs/.github/blob/main/.github/pull_request_template.md

## サンプル対話

**User:** このブランチの変更でPRを作成してください。

**Agent:** 現在のブランチの変更内容を確認します。最新のPRテンプレートを取得し、各セクションを実際の変更内容に基づいて埋めます。「動作確認」は実際に確認できた内容のみを「確認済み」に、それ以外は「未確認」に理由とともに記載し、そのまま作成します。[`gh pr create` を実行] PRを作成しました。URL: ...

**User:** （main 上で設計文書を変更した状態で）#12 の設計をPRにして。

**Agent:** main 上に未コミットの変更があり、設計文書だけの変更なので、`docs/issue-12` ブランチを作り、`Refs #12` を含めてコミットしました。設計の段階でマージしても #12 は完了しないため、本文には `Closes` ではなく `Refs #12` と書いて作成します。[`gh pr create` を実行] PRを作成しました。URL: ...

**User:** テストはまだ追加していません。

**Agent:** その場合は「動作確認」の「未確認」に「テスト未追加」である旨を記載したうえで作成します。[`gh pr create` を実行] PRを作成しました。URL: ...
