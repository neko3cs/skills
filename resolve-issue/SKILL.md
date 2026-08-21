---
name: resolve-issue
description: Resolves a GitHub issue by reading it, creating a branch, implementing a fix, adding tests, and opening a pull request. Invoke with an issue number (e.g. /resolve-issue 4).
license: MIT
compatibility: Requires git, gh CLI, and a test-capable project environment
---

# resolve-issue Skill

## 概要

指定されたGitHub Issueを、Issue読解 → ブランチ作成 → 実装 → テスト → PR作成の流れで解決します。各工程の具体的なやり方（テストの合否基準、PRの書式など）は専用スキルに委ね、このスキルは工程の順序と工程間の受け渡しだけを管理します。

## 使い方

```
/resolve-issue <issue番号>
```

## 前提条件

- ブランチ作成前に、ローカルの `AGENTS.md` に「ワークツリーを作らない」「ブランチを切らない」等の指示が無いか確認する。無ければ `EnterWorktree` でワークツリー・ブランチ（`fix/issue-<番号>` または `feature/issue-<番号>`）を作成する。禁止されている場合のみ、`main` を最新化した上で通常のブランチ作成に切り替える。
- 実装に着手する前に、その時点で失敗しているテストを把握しておく。実装後に「元々失敗していたテスト」と「新たに壊したテスト」を区別するために必要になる。プロジェクト種別に応じたテストスキル（`test-ts-project` / `test-dotnet-project` / `test-ios-project`）の基準に従う。
- コミットメッセージには必ずIssue番号を含める（例: `Closes #<番号>`）。実装コミットとテストコミットは分けてよい。
- テストの実装作業を「TDDで進めて」と指示された場合は `test-as-tdd` スキルに従う。
- PR作成は必ず `create-github-pullrequest` スキルに従う。関連Issue欄に `Closes #<番号>` を記載する。マージはユーザーの判断であり、このスキルの範囲はPRを開くところまで。

## 進め方

1. `gh issue view <issue番号>` でIssueの内容を理解する。
2. ワークツリー・ブランチを作成する。
3. 現状のテストの成否を記録する（後で比較する基準線にする）。
4. 既存のコードスタイル・設計方針に沿って、最小限の変更でIssueを解決する。
5. 変更をコミットする。
6. 追加・変更したコードに対するテストを追加・更新する。
7. 全テストを実行する。ステップ3で元々失敗していたテストは無視してよいが、新たに失敗するようになったテストは修正する。
8. テストコードをコミットする。
9. `create-github-pullrequest` スキルでPRを作成する。

工程の順序自体は変えない（後工程が前工程の結果に依存するため）。各工程を実際にどう進めるか（コミットの粒度、テストの書き方、実装方針の細部）はエージェントの判断に委ねる。

## 出力形式

作成したPRのURLを最後に提示する。

## サンプル対話

**User:** /resolve-issue 4

**Agent:** Issue #4 を確認します。「ログイン画面でのクラッシュ」というバグ報告でした。ワークツリーとブランチ `fix/issue-4` を作成し、現状のテストの成否を記録した上で修正に着手します。[実装・テスト追加・PR作成を実行] PRを作成しました。URL: ...

**User:** このプロジェクトはワークツリーを作らない方針です。

**Agent:** ローカルの `AGENTS.md` の指示に従い、ワークツリーは作らずカレントディレクトリ上でブランチ `fix/issue-4` を作成して進めます。
