# 参考資料: AGENTS.md テンプレート

セクション構成に迷ったときの参照用。**すべてのプロジェクトに全セクションが必要なわけではない。該当しないセクションは省略する。**

各セクションに何を書くか／書かないかの判断は `SKILL.md` を見る。

```markdown
# AGENTS.md

## Key References
- <既存の設計ドキュメントの実際のパス> — <文書の役割・読む場面>。必要な文書ごとに1行で参照し、コードと食い違ったら「文書を正とし、コードの不具合として扱う」と明記

## What This Project Is (and Is Not)
- <非交渉事項／AIが提案してはいけないこと>

## Architecture
<!-- 構成や設計方針を説明する既存文書があればこのセクションは省略し、Key References の参照だけにする。概要は書かない -->
- <該当する設計文書が無い場合のみ、標準と違う点・非自明な点だけを書く>

## Data Models / Domain Concepts
- <ドメイン特有の用語・モデル関係のうち、コードから読み取れない・一般的な意味と違うものだけ>

## Commands
<!-- 品質ゲートを実行するスキルがあれば、それを使う旨を書く -->
\`\`\`bash
# Format
# Tests
\`\`\`
- <遅い・高い操作>: <代わりに使うもの>


## Development Rules
- <決まった手順を踏むべきこと>

## Tacit Knowledge
- <topic>: <why — not what>

## Implicit Constraints
- <型やコメントで表現しきれていない制約>

## Distribution / Operational Policy
- <配布・運用上の外部制約（対象地域、年齢制限、外部サービスの規約など）>
```
