---
name: create-github-pullrequest
description: Creates a GitHub Pull Request with the gh CLI using neko3cs/.github's org-wide pull_request_template.md, filling each section from the actual diff/commits and honestly separating "確認済み" from "未確認" in the 動作確認 section based on what was actually verified. Use when the user asks to create/open a Pull Request in a neko3cs org repository.
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

- **概要**: このPRが何をするものか、なぜ必要かを数行で書く。背景・目的もここに含める。関連Issueがあれば `Closes #<番号>` の形式で記載する。関連Issueが無い場合は無理に番号を埋めず、この記載自体を省略する。複数ある場合は行を複数に分ける。
- **変更ファイル**: `git diff --stat` 等から変更した主要なファイルを表（ファイル / 内容）にまとめる。新規か修正かと、そのファイルで何をしたかを1行で書く。主要なもので構わず、細部まで網羅する必要はない。
- **実行方法・確認手順**: レビュアーが手元で動かす、または画面で確認するための手順を書く。コマンドはコードブロックでそのまま貼り付けられる形にする。
- **レビューしていただきたい設計判断**: 迷った点・意図的に選んだ方針を「何を選んだか → なぜそうしたか」の順に番号付きで書く。判断を委ねたい箇所は「この方針でよいかご確認ください」のように明示的に問いかける。特に無ければセクションごと削除する。
- **動作確認**: 「確認済み」と「未確認」の2つに分けて書く。
  - 確認済み: 実際に実行・目視した内容を、いつ・どの環境で確認したかを添えて箇条書きにする。テストの実行、Issueの受け入れ条件との突き合わせなどはここで確認してから記載する。
  - 未確認: 確認できていないことと、その理由を正直に書く。**確認していないことを確認済みに含めてはいけない**。レビュアーがどこを重点的に見るべきかの手がかりになる。
- **補足**: 機密情報を含めていないかの確認、既知の制約、今後の対応予定、意図的にスコープ外とした変更などを書く。diff全体を見直して目的外の変更が混ざっていないかもここで触れる。特に書くことが無ければセクションごと削除する。

### 4. PRタイトルを決める

変更内容を端的に表すタイトルにする。リポジトリのコミットメッセージの規約（例: `fix:`/`feat:` プレフィックス等）に合わせる。

### 5. `gh pr create` を実行する

```bash
gh pr create -R <owner>/<repo> \
  --base main \
  --head <branch> \
  --title "..." \
  --body-file <一時ファイル>
```

- 本文は改行・表（Markdownテーブル）を含むため、シェルのクォート崩れを避けるためスクラッチディレクトリに一時ファイルを作成し `--body-file` で渡す。作成後は一時ファイルを削除する。
- 対象リポジトリ・ベースブランチは特に指定がなければ作業中のリポジトリと `main` を使う。
- 前提（push状況など）に問題がない限り、内容が揃い次第このステップまで確認なしで進めて作成する。マージはユーザーの判断であり、このスキルの範囲はPRを開くところまで。作成後にPR URLを提示する。

## 注意事項

- テンプレートのセクション構成は変更される可能性があるため、[スナップショット](references/pr-template-snapshot.md)を過信せず、作成の都度ステップ2で最新定義を取得する。
- 「動作確認」は実態に基づいて正直に書く。レビュアーの信頼を損なうため、確認できていないことを確認済みに含めない。

## 他のスキルとの関係

- `resolve-issue`: Issue対応フローのPR作成ステップでは、このスキルに従う。

## 参考文献

- Pull Requestテンプレート: https://github.com/neko3cs/.github/blob/main/.github/pull_request_template.md

## サンプル対話

**User:** このブランチの変更でPRを作成してください。

**Agent:** 現在のブランチの変更内容を確認します。最新のPRテンプレートを取得し、各セクションを実際の変更内容に基づいて埋めます。「動作確認」は実際に確認できた内容のみを「確認済み」に、それ以外は「未確認」に理由とともに記載し、そのまま作成します。[`gh pr create` を実行] PRを作成しました。URL: ...

**User:** テストはまだ追加していません。

**Agent:** その場合は「動作確認」の「未確認」に「テスト未追加」である旨を記載したうえで作成します。[`gh pr create` を実行] PRを作成しました。URL: ...
