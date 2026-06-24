---
name: update-agentsmd
description: Creates or updates AGENTS.md (and a CLAUDE.md pointer to it) so another AI can pick up the work with zero prior context. Captures standard AGENTS.md content (setup/build/test commands, code style) plus project tacit knowledge, decision rationale, and open issues gathered from the conversation and codebase. Use when the user asks to update AGENTS.md, prepare a handoff for another AI, or wrap up a session's context.
license: MIT
---

# update-agentsmd Skill

## 概要

このスキルは `AGENTS.md` を最新化し、**コンテキストがゼロの別のAIが読むだけで作業を継続できる**状態を保つことを目的とします。標準仕様（[参考資料](references/agentsmd-spec.md)）に沿った内容に加えて、コードや設定からは読み取れない暗黙知・課題事項・引き継ぎ情報を補強します。

## 実行手順

### 1. 既存ファイルの確認

- 対象リポジトリ（モノレポの場合は作業対象のサブプロジェクト）のルートに `AGENTS.md` があるか確認する。
- 同じ場所に `CLAUDE.md` があるか確認する。

### 2. ファイルが無い場合の作成

- `AGENTS.md` が無ければ、[テンプレート](references/template.md)に基づき新規作成する。該当しないセクションは省略してよい。
- `CLAUDE.md` が無ければ、内容を以下のみとして新規作成する。

  ```markdown
  @AGENTS.md
  ```

  これはClaude CodeがAGENTS.mdの内容をインポートするための記法であり、`AGENTS.md` を正（single source of truth）として扱うために行う。
- `CLAUDE.md` が既に存在し `@AGENTS.md` への参照を含んでいない場合は、独自カスタマイズを上書きしないよう、追記してよいかをユーザーに確認してから対応する。

### 3. 標準仕様に基づく内容を整理する

`AGENTS.md` には、READMEを補完する**エージェント向けの技術的コンテキスト**のみを書く。

- 含めるもの: ビルド・テストコマンド、コードスタイル規約、テスト方法、コミット/PRガイドライン、セキュリティ上の注意点
- 含めないもの: クイックスタート、プロジェクトの紹介文・売り文句、人間向けの貢献ガイドライン（これらはREADME.mdの役割）

プロジェクトに対応するテストスキル（`test-ts-project` / `test-dotnet-project` / `test-ios-project` など）がある場合は、個別コマンドを羅列するより「このスキルを使う」旨を明記したほうが簡潔で陳腐化しにくい。

### 4. このスキール独自の3セクションを追加・更新する

会話やコードから次の情報を集め、`AGENTS.md` に反映する。情報源が不明確な場合は推測で埋めず、ユーザーに確認すること。

1. **プロジェクトの暗黙知**
   - コードや設定ファイルから読み取れない、ユーザーとの会話で明らかになった重要なドメイン知識・意思決定の理由・「なぜこの制約があるのか」を記録する。
   - 例: 「なぜこのライブラリ/設計を選んだか」「なぜこの操作が禁止されているか」。
2. **課題事項**
   - 解決すべきだが何らかの理由で解決できていない事項を記録する。理由・現在のブロッカー・回避策の有無を含める。
   - 解決済みになった課題事項は削除し、放置しない。
3. **引き継ぎ用の現状スナップショット**
   - 日付付きで「テストの状態」「進行中/未着手のタスク」「直近の決定」など、ゼロコンテキストから作業を始めるために必要な情報を記録する。
   - 古いスナップショットは上書きし、履歴として残さない（Gitの履歴が代わりに担う）。

### 5. 既存ファイルは差分更新する

- すでに `AGENTS.md` が存在する場合、全文を書き換えるのではなく、**陳腐化した箇所・欠けているセクションのみ**を更新する。
- 既存の意思決定の記録（Why系の記述）は、事実が変わっていない限り消さない。
- セクション構成は[テンプレート](references/template.md)を基準にしつつ、既存ファイルの構成が合理的であればそれを尊重する。

### 6. 言語

- `communication-rule` スキルに従い、`AGENTS.md` は英語で記述する。
- `CLAUDE.md` は内容が `@AGENTS.md` のみなので言語の問題は生じない。

### 7. 完了確認

- 更新内容（追加・変更したセクション）をユーザーに日本語で要約する。
- `git-rule` に従い、コミット・プッシュはユーザーの明示的な許可がない限り行わない。

## 参考資料

- AGENTS.md標準仕様: https://agents.md/ （[要約](references/agentsmd-spec.md)）
- 実例: neko3cs/umalog の `AGENTS.md` ([GitHub](https://github.com/neko3cs/umalog/blob/main/AGENTS.md) / [テンプレート化](references/template.md))

## サンプル対話

**User:** AGENTS.mdを最新化して、引き継げる状態にしてください。

**Agent:** 現在のAGENTS.mdとCLAUDE.mdの有無を確認します。会話で出てきた決定事項と未解決の課題を整理し、差分更新します。

**User:** AGENTS.mdが無いプロジェクトなんですが。

**Agent:** AGENTS.mdとCLAUDE.mdをまだ作成していないようです。テンプレートに沿って新規作成し、CLAUDE.mdの内容は `@AGENTS.md` のみにします。

**User:** 何を「暗黙知」として書けばいいか分かりません。

**Agent:** コードや設定だけでは伝わらない「なぜこの設計/制約にしたか」という会話上の背景です。例えば umalog の例では「なぜ`.pbxproj`を編集禁止にしているか」「なぜテスト名を日本語にしているか」が該当します。
