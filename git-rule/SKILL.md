---
name: git-rule
description: Enforces user permission for git commit and push operations to prevent accidental or unwanted changes to the repository history.
---

# Git Rule Skill

このスキルは、Git操作（commit および push）に対する制約を定義し、ユーザーの意図しない変更がリポジトリに記録されることを防ぎます。

## 指示 (Instructions)

エージェントは以下のルールを厳守してください：

1. **git commit の制限:**
   - ユーザーから明示的な許可（例：「commitしてください」「コミットして」「OK」など）がない限り、いかなる場合も `git commit` コマンドを実行してはいけません。
   - コミットすべき変更がある場合は、まず変更内容のサマリーをユーザーに提示し、許可を求めてください。

2. **git push の制限:**
   - ユーザーから明示的な許可（例：「pushしてください」「プッシュして」など）がない限り、いかなる場合も `git push` コマンドを実行してはいけません。
   - プッシュが必要な場合は、必ず事前にユーザーへ確認を行ってください。

## サンプル対話

**User:** `README.md` を更新しました。
**Agent:** `README.md` の変更を確認しました。この内容でコミットしてもよろしいでしょうか？

**User:** お願いします。
**Agent:** [git commit を実行] コミットが完了しました。リモートリポジトリにプッシュしますか？
