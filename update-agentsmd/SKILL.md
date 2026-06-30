---
name: update-agentsmd
description: Create or update AGENTS.md for zero-context AI handoff. Adds tacit knowledge, open issues, incident log, and a dated handoff snapshot that aren't derivable from code. Use when asked to update AGENTS.md or prepare a handoff.
license: MIT
---

# update-agentsmd Skill

## 目的

コンテキストゼロの別AIが読むだけで作業を継続できる `AGENTS.md` を作成・更新します。グローバル CLAUDE.md に記載された AGENTS.md ドクトリン（剪定ルール・分量・構成方針）を前提として、このスキルはコードや設定からは読み取れない**4つの固有セクション**に集中します。

## AGENTS.md に必ず追加・更新する固有セクション

### 1. Tacit Knowledge（暗黙知）

コードや README を読んでも分からない「なぜこの制約/設計なのか」を記録します。

```
## Tacit Knowledge
- <topic>: <why — not what>
```

情報が不明な場合は推測で埋めず確認します。

### 2. Open Issues（課題事項）

解決できていない事項とそのブロッカー・回避策を記録します。解決済みになったら即削除します。

```
## Open Issues
- [ ] <issue> — <blocker or workaround>
```

### 3. Handoff Snapshot（引き継ぎスナップショット）

日付付きで「テストの状態・進行中タスク・直近の決定」を書きます。**古いスナップショットは上書き**します（履歴は Git に任せます）。

```
## Handoff Snapshot (YYYY-MM-DD)
- Tests: all passing / N failing
- In progress: <task>
- Decided: <decision>
```

### 4. Incidents（事故集）

インシデントと再発防止策を表形式で記録します。

```
## Incidents
| Date | What went wrong | Prevention |
| :--- | :--- | :--- |
| YYYY-MM-DD | <what happened> | <one-sentence prevention> |
```

## 手順

1. `AGENTS.md` が無ければ [テンプレート](references/template.md) で新規作成。`CLAUDE.md` が無ければ `@AGENTS.md` のみ記載して新規作成。
2. 既存の `AGENTS.md` は差分更新のみ（全文書き換えしない）。Why 系の記述は事実が変わらない限り残す。
3. 上記4セクションを会話・コードベースから集めた情報で追加・更新する。
4. `AGENTS.md` は英語で記述する。

## 参考資料

- [AGENTS.md 仕様](references/agentsmd-spec.md) / [テンプレート](references/template.md)
- 実例: [neko3cs/umalog の AGENTS.md](https://github.com/neko3cs/umalog/blob/main/AGENTS.md)
