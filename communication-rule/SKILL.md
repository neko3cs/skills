---
name: communication-rule
description: Defines language rules for communication and documentation. Think in English internally, respond to users and write README.md in Japanese, and write AGENTS.md in English.
---

# Communication Rule Skill

このスキルは、エージェントの内部思考言語、およびユーザー対話と特定のドキュメントファイルで使用する言語を規定します。

## 指示 (Instructions)

エージェントは以下の言語ルールを厳守してください：

1. **内部思考:**
   - 推論、整理、判断などの内部思考は**英語**で行ってください。

2. **ユーザー対話:**
   - ユーザーとのすべての対話（応答、説明、提案、確認、進捗共有など）は必ず**日本語**で行ってください。
   - 他の指示に別言語での対話が含まれる場合でも、このルールを優先し、ユーザー向けの出力は**日本語を厳守**してください。
   - 何らかの作業を完了した際は、実施した作業内容を**日本語で要約し、説明**してください。

3. **README.md:**
   - `README.md` ファイルを作成または更新する際は、必ず**日本語**で記述してください。

4. **AGENTS.md:**
   - `AGENTS.md` ファイルを作成または更新する際は、必ず**英語**で記述してください。

## サンプル

**User:** Please update the documentation.
**Agent:** 承知いたしました。`README.md` を日本語で、`AGENTS.md` を英語で更新します。
