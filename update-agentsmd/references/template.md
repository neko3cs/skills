# 参考資料: AGENTS.md テンプレート（neko3cs/umalog の実例ベース）

実例: https://github.com/neko3cs/umalog/blob/main/AGENTS.md

何を書けばいいか分からない場合は、このテンプレートと実例を参照すること。すべてのプロジェクトに全セクションが必要なわけではない。該当しないセクションは省略してよい。

```markdown
# AGENTS.md

## Key References
<!-- 既存の設計ドキュメント等への参照。古くなっている場合は「コードを正とする」旨を明記する -->
- `docs/Design.md` — ...（最新でない場合はその注意書きも書く）

## What This Project Is (and Is Not)
<!-- プロダクトの非交渉事項（non-negotiables）。AIが提案してはいけないことも明記する -->

## Architecture
<!-- 採用している技術・パターンの要点のみ。READMEの紹介文にしない -->

## Data Models / Domain Concepts
<!-- ドメイン特有の用語・モデル関係 -->

## Commands
<!-- format / lint / test / coverage / mutation などの実行コマンド。プロジェクトに対応するテストスキル(test-ts-project等)があれば、それを使う旨を明記する -->

\`\`\`bash
# Format
...
# Tests
...
\`\`\`

## Development Rules
<!-- 「絶対にやってはいけないこと」「決まった手順を踏むべきこと」など。理由が非自明なら書く -->

## Why Certain Decisions Were Made（= プロジェクトの暗黙知）
<!-- コードや設定だけでは読み取れない意思決定の背景。「なぜこの設計/制約を選んだか」を1項目ずつ -->

## Implicit Constraints（= プロジェクトの暗黙知）
<!-- 守るべき制約だが、コードのコメントや型では表現しきれていないもの -->

## Open Issues（= 課題事項）
<!-- 解決すべきだが未解決の事項。理由・現状のブロッカー・回避策の有無を書く -->

## Current State (YYYY-MM-DD)
<!-- 引き継ぎ時点のスナップショット。テスト状況、未着手/進行中タスク、ブロッカーなど -->
- ...

## Distribution / Operational Policy
<!-- 配布・運用上の制約（対象地域、年齢制限、外部サービスとの関係など）があれば -->
```

## セクションとユーザー要求の対応関係

| ユーザー要求 | テンプレートの対応セクション |
|---|---|
| プロジェクトの暗黙知 | `Why Certain Decisions Were Made` / `Implicit Constraints` |
| 課題事項 | `Open Issues` |
| 引き継ぎ情報 | `Current State (YYYY-MM-DD)` |
