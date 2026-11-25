---
name: refactor-skill
description: Refactor, clean up, or slim down bloated Agent Skills (SKILL.md and supporting files) without losing their intent — classifying accumulated patches (duplicates, contradictions, one-off exceptions, redundant basics), consolidating prohibitions into principles with a one-line "why", and separating details into references/ or deterministic steps into scripts/. Use when asked to refactor, trim, audit, or reorganize an existing skill ("スキルをリファクタリングして", "SKILL.mdを整理して", "スキルが長いのでスリム化して", "スキルの指示が重複・矛盾しているので直して", "refactor this skill", "clean up SKILL.md", "slim down this skill").
license: MIT
---

# refactor-skill

肥大化したりパッチが積み重なったりしたスキル（`SKILL.md` と付随ファイル）を、意図と発火条件を保ったまま短く効く形にリファクタリングします。目的は指示を足すことではなく、重複・矛盾・場当たり的な例外を取り除き、必要なときに必要な情報だけ読まれる構造へ整理することです。

## 大原則

- **意図と発火条件を壊さない**: スキルが解きたい本来の問題と、frontmatter `description` の発火範囲を維持する。意図が読み取れない矛盾や例外は勝手に削らずユーザーに確認する。
- **確認なしに上書きしない**: まず分類結果と整理方針を示し、合意を得てから書き換える。
- **対象リポジトリの規約を優先する**: 記述言語・ディレクトリ構成・frontmatter 形式などは、対象リポジトリの規約（`AGENTS.md` など）に従う。

## 基本の流れ

### 1. 現状を把握する

対象の `SKILL.md`、付随ファイル（`references/`・`scripts/`・`assets/`）、および対象リポジトリの規約をすべて読み、スキルの目的・発火条件・前提を把握します。

### 2. パッチを分類する（まだ直さない）

溜まった指示を次の4つに分類し、あわせて構造分離の候補を洗い出してユーザーに提示します。この段階ではファイルを書き換えません。

- **重複している指示**: 同じ内容を別表現で繰り返している箇所
- **互いに矛盾している指示**: 前後のパッチが食い違っている、または優先順位が不明な箇所
- **特定の一件のために足された例外**: 一度の事故やエッジケースを個別の禁止ルールとして積み上げた箇所
- **今のモデルなら言われなくてもできること**: 一般論や、現行モデルが指示なしで守れる基本動作

### 3. 理由つきで一つにまとめる

ユーザーの合意後、指示を整理します。

- 「〜するな」を積み重ねる代わりに、「なぜそうするのか」を1行添えた原則にまとめる。理由があると似た場面にも効きやすくなる。
- 個別の例外を並べず、原則に対する代表例を1つ載せる形に畳み、再膨張を防ぐ。
- 矛盾している指示は、優先する意図をユーザーに確認したうえで1つに統一する。

### 4. 構造を分ける

`SKILL.md` の役割を「いつ使うか・基本の流れ」に絞り、残りを適切な場所へ移します。

- **`SKILL.md` に残す**: 目的・発火の前提・大原則・基本の流れ・各ファイルへの導線。
- **`references/` に移す**: 細かいルール、判断表、書き換え例、言語・ケース別の詳細手順。必要なときだけ読ませる条件付きリンクを `SKILL.md` に置く。
- **`scripts/` に移す**: 検証・整形・抽出・集計など決まりきった機械的処理。文章での手順をスクリプト実行に置き換える。

### 5. 検証して報告する

整理後、次を確認して結果を短く報告します。

- 元の意図や非自明な制約が欠けていないか
- frontmatter の `description`（発火トリガー表現）が維持されているか
- `references/` や `scripts/` への相対リンク・参照に切れがないか

報告には、削ったもの・統合したもの・分離したもの・判断に迷って残したものを簡潔にまとめます。

## 詳細ガイド

4分類の見分け方、原則へのまとめ方（Before / After 例）、`references/`・`scripts/` への切り分け基準、削ってはいけないものの判断基準は [リファクタリング基準](references/refactoring-guide.md) を読んでください。

## 範囲外

新規スキルのゼロからの作成、およびスキル以外のドキュメント（プロジェクトの `README.md` や設計書など）の整理はこのスキルの範囲外です。
