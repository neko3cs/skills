# 参考資料: AGENTS.md テンプレート

セクション構成に迷ったときの参照用。**すべてのプロジェクトに全セクションが必要なわけではない。該当しないセクションは省略する。**

各セクションに何を書くか／書かないかの判断は `SKILL.md` を見る。

```markdown
# AGENTS.md

## Key References
- `architecture.md`（design-docs 管理。配置先はプロジェクト依存）— 存在する場合のみ。最新でない場合は「コードを正とする」と明記
- `specification.md` / `requirements.md` / `design.md` — 同上、必要な場合のみ
- `PLAN.md` — <存在する場合のみポインタを置く>

## What This Project Is (and Is Not)
- <非交渉事項／AIが提案してはいけないこと>

## Architecture
<!-- design-docs スキルの architecture.md があればこのセクションは省略し、Key References の参照だけにする -->
- <design-docs 未導入の場合のみ、採用している技術・パターンの要点を書く>

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
