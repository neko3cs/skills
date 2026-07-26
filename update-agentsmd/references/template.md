# 参考資料: AGENTS.md テンプレート

セクション構成に迷ったときの参照用。**すべてのプロジェクトに全セクションが必要なわけではない。該当しないセクションは省略する。**

各セクションに何を書くか／書かないかの判断は `SKILL.md` を見る。

実例: https://github.com/neko3cs/umalog/blob/main/AGENTS.md

```markdown
# AGENTS.md

## Key References
- `docs/Design.md` — <役割>（最新でない場合は「コードを正とする」と明記）
- `PLAN.md` — <存在する場合のみポインタを置く>

## What This Project Is (and Is Not)
- <非交渉事項／AIが提案してはいけないこと>

## Architecture
- <採用している技術・パターンの要点のみ>

## Data Models / Domain Concepts
- <ドメイン特有の用語・モデル関係>

## Commands
<!-- 対応するテストスキル(test-ts-project 等)があれば、それを使う旨を書く -->
\`\`\`bash
# Format
# Tests
\`\`\`

## Development Rules
- <決まった手順を踏むべきこと>

## Tacit Knowledge
- <topic>: <why — not what>

## Implicit Constraints
- <型やコメントで表現しきれていない制約>

## Distribution / Operational Policy
- <配布・運用上の外部制約（対象地域、年齢制限、外部サービスの規約など）>

## Incidents
| Date | What went wrong | Prevention |
| :--- | :--- | :--- |
| YYYY-MM-DD | <what happened> | <one-sentence prevention> |
```
