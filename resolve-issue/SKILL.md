---
name: resolve-issue
description: Resolves a GitHub issue by reading it, creating a branch, implementing a fix, adding tests, and opening a pull request. Invoke with an issue number (e.g. /resolve-issue 4).
license: MIT
compatibility: Requires git, gh CLI, and a test-capable project environment
---

# resolve-issue Skill

## 概要

このスキルは、指定されたGitHub Issueを解決するための一連の手順を自動的に実行します。Issueの内容を理解し、ブランチを作成し、修正を実装し、テストを追加・確認した後、Pull Requestを作成します。

## 使用方法

```
/resolve-issue <issue番号>
```

例：`/resolve-issue 4`

## 実行手順

### 1. Issueの内容を読み取る

`gh issue view <issue番号>` を使用して、Issueのタイトル・本文・コメントを読み取り、解決すべき問題を正確に理解してください。

```bash
gh issue view <issue番号>
```

### 2. Issue対応ブランチを作成する

まず、mainブランチを最新の状態にしてから、Issue対応用のブランチを作成します。

```bash
git switch main
git pull origin main
git switch -c fix/issue-<issue番号>
```

ブランチ名はIssueの内容に応じて `fix/issue-<番号>` または `feature/issue-<番号>` など適切な名前にしてください。

### 3. 現在のテスト品質を把握する

プロジェクトのテストを実行し、現時点でどのテストが通っていて、どのテストが失敗しているかを記録します。後のステップで「元々失敗していたテスト」を判断するために必要です。

プロジェクトの種類に応じたテストスキルを参照してください：

- **TypeScriptプロジェクト**: `test-ts-project` スキルを参照
- **.NETプロジェクト**: `test-dotnet-project` スキルを参照

このステップでは修正は行わず、現状を記録するだけです。

### 4. Issueを解決する

Issueの内容に基づいて実装を行います。

- Issueで報告されたバグを修正する、または要求された機能を追加します
- 既存のコードスタイルや設計方針に従ってください
- 最小限の変更で問題を解決することを心がけてください

### 5. 実装をコミットする

修正内容をコミットします。コミットメッセージにはIssue番号を含め、変更内容を明確に記述してください。

```bash
git add <変更ファイル>
git commit -m "fix: <変更内容の概要>

Closes #<issue番号>"
```

### 6. テストを見直し、追加する

ステップ4で追加・変更したコードに対するテストを追加または更新します。

- 新しい関数や分岐に対するユニットテストを追加してください
- 既存のテストが引き続き正しく動作することを確認してください
- プロジェクトの種類に応じたテストスキルのガイドラインに従ってください：
  - **TypeScriptプロジェクト**: `test-ts-project` スキルを参照
  - **.NETプロジェクト**: `test-dotnet-project` スキルを参照

### 7. テストが全て通ることを確認する

プロジェクトの全テストを実行し、結果を確認します。

**重要**: ステップ3で既に失敗していたテストは無視して構いません。新たに失敗するようになったテストのみ修正してください。

```bash
# プロジェクトに応じたテストコマンドを実行
```

全てのテスト（元々通っていたもの + 今回追加したもの）が通ることを確認してください。

### 8. テストコードをコミットする

追加・更新したテストコードをコミットします。

```bash
git add <テストファイル>
git commit -m "test: <issue番号>に対するテストを追加"
```

### 9. Pull Requestを作成する

`create-github-pullrequest` スキルに従ってPull Requestを作成してください。`neko3cs/.github` の最新のPRテンプレートを取得し、各セクションを実際の変更内容で埋め、関連Issue欄には `Closes #<issue番号>` を記載します。

## 注意事項

- ブランチ作成前に必ずmainブランチを最新の状態にしてください
- コミットメッセージには必ずIssue番号を含めてください
- テスト追加時は既存のテストフレームワークとスタイルに合わせてください
- PRの本文には変更内容とテスト内容を明確に記述してください
