---
name: create-github-pullrequest
description: Creates a GitHub Pull Request with the gh CLI using neko3cs/.github's org-wide pull_request_template.md, filling each section from the actual diff/commits and honestly checking only the checklist items that were verified. Use when the user asks to create/open a Pull Request in a neko3cs org repository.
license: MIT
---

# create-github-pullrequest Skill

## 概要

GitHubにPull Requestを作成する際は、必ず `gh` コマンドを使い、`neko3cs/.github` リポジトリで管理されているPull Requestテンプレートに従って作成します。

## 実行手順

### 1. 前提を確認する

- 現在のブランチと、ベースブランチ（通常 `main`）から分岐後の変更内容（コミット・diff）を確認する。
- 変更がリモートにpushされているか確認する。されていなければ、push してよいかユーザーに確認する。
- PRを作成するリポジトリ・ベースブランチ・ヘッドブランチを確定する。

### 2. テンプレートの最新定義を取得する

テンプレートは `neko3cs/.github` 側で更新される可能性があるため、[スナップショット](references/pr-template-snapshot.md)を流用せず、**作成のたびに最新のテンプレートを取得する**。

```bash
gh api repos/neko3cs/.github/contents/.github/pull_request_template.md --jq '.content' | base64 -d
```

### 3. 各セクションを埋める

- **概要**: このPRが何をするものか、なぜ必要かを簡潔に書く。
- **関連Issue**: `Closes #<番号>` の形式で記載する。関連Issueが無い場合は、この行ごと削除する（番号を無理に埋めない）。複数ある場合は行を複数に分ける。
- **変更種別**: 実際の変更内容に該当するチェックボックスのみ `[x]` にする。複数当てはまっても構わない。
- **実装メモ**: 採用したアプローチ・設計上の判断・トレードオフなど、レビュアーが知っておくべきことを書く。コミットメッセージや会話内の議論から拾う。
- **変更対象ファイル / 対象箇所**: `git diff --stat` 等から変更した主なファイル・モジュールを列挙する。
- **チェックリスト**: **実際に確認・実施した項目のみ** `[x]` にする。確認できていない、または満たしていない項目は未チェックのまま残す。すべて埋まっていなくても、虚偽のチェックをしてはいけない。
  - 「関連Issueの受け入れ条件をすべて満たしている」: Issueの受け入れ条件と実装を見比べて確認してからチェックする。
  - 「変更に対するテストを追加・更新した」: diffにテストファイルの変更が含まれているか確認してからチェックする。
  - 「対応スコープ外の意図しない変更が含まれていない」: diff全体を見直し、目的外の変更が混ざっていないか確認してからチェックする。
  - 「必要に応じてドキュメントを更新した」: README/AGENTS.md等の更新が必要な変更であれば、実施済みか確認してからチェックする。

### 4. PRタイトルを決める

変更内容を端的に表すタイトルにする。リポジトリのコミットメッセージの規約（例: `fix:`/`feat:` プレフィックス等）に合わせる。

### 5. 作成前にユーザーに確認する

組み立てたタイトル・本文・ベース/ヘッドブランチをユーザーに提示し、内容に問題がないか確認を取る。PR作成は他者に見える操作であり、関係者に通知が飛ぶため、`gh pr create` の実行前に必ず確認すること。

### 6. `gh pr create` を実行する

```bash
gh pr create -R <owner>/<repo> \
  --base main \
  --head <branch> \
  --title "..." \
  --body-file <一時ファイル>
```

- 本文は改行・チェックボックスを含むため、シェルのクォート崩れを避けるためスクラッチディレクトリに一時ファイルを作成し `--body-file` で渡す。作成後は一時ファイルを削除する。
- 対象リポジトリ・ベースブランチは特に指定がなければ作業中のリポジトリと `main` を使う。

## 注意事項

- テンプレートのセクション構成は変更される可能性があるため、[スナップショット](references/pr-template-snapshot.md)を過信せず、作成の都度ステップ2で最新定義を取得する。
- チェックリストは実態に基づいて正直にチェックする。レビュアーの信頼を損なうため、未確認の項目を埋めるために推測でチェックしない。

## 他のスキルとの関係

- `resolve-issue`: Issue対応フローのPR作成ステップでは、このスキルに従う。

## 参考文献

- Pull Requestテンプレート: https://github.com/neko3cs/.github/blob/main/.github/pull_request_template.md

## サンプル対話

**User:** このブランチの変更でPRを作成してください。

**Agent:** 現在のブランチの変更内容を確認します。最新のPRテンプレートを取得し、各セクションを実際の変更内容に基づいて埋めます。チェックリストは確認できた項目のみチェックします。内容を提示しますので、作成前にご確認ください。

**User:** テストはまだ追加していません。

**Agent:** その場合は「変更に対するテストを追加・更新した」のチェックは外したまま作成します。
