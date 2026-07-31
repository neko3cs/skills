# 参考資料: Issueテンプレート スナップショット（取得日: 2026-07-31）

出典: https://github.com/neko3cs/.github/tree/main/.github/ISSUE_TEMPLATE

**注意:** これは取得時点のスナップショットであり、`neko3cs/.github` 側で更新される可能性がある。実際にIssueを作成する際は、SKILL.mdの手順に従って必ず最新のYAMLを取得し直すこと。このファイルはフィールド構成を素早く把握するための下書き用途のみに使う。

`config.yml`: `blank_issues_enabled: false`（テンプレートを使わない空のIssue作成は不可）

## バグ報告（bug_report.yml）

- `name`: バグ報告
- `title`: `[Bug]: `
- `labels`: `bug`

| id | label | type | required |
|---|---|---|---|
| description | 説明 | textarea | ✅ |
| steps | 再現手順 | textarea | ✅ |
| expected | 期待する動作 | textarea | ✅ |
| actual | 実際の動作 | textarea | ✅ |
| environment | 環境情報 | textarea | - |
| version | バージョン | input | ✅ |
| related_files | 関連ファイル / 対象箇所 | textarea | - |
| acceptance_criteria | 受け入れ条件 | textarea | ✅ |
| out_of_scope | 対応スコープ外 | textarea | - |
| severity | 影響度 | dropdown（高／中／低） | ✅ |
| additional_context | 補足情報 | textarea | - |
| confirmation | 確認事項（機密情報を含めていません） | checkboxes | ✅ |

## 機能要望（feature_request.yml）

- `name`: 機能要望
- `title`: `[Feature]: `
- `labels`: `enhancement`

| id | label | type | required |
|---|---|---|---|
| description | 説明 | textarea | ✅ |
| motivation | 動機 / ユースケース | textarea | ✅ |
| proposed_solution | 提案する解決策 | textarea | ✅ |
| alternatives | 代替案・検討したこと | textarea | - |
| related_files | 関連ファイル / 対象箇所 | textarea | - |
| acceptance_criteria | 受け入れ条件 | textarea | ✅ |
| out_of_scope | 対応スコープ外 | textarea | - |
| additional_context | 補足情報 | textarea | - |
| confirmation | 確認事項（機密情報を含めていません） | checkboxes | ✅ |

## Issue本文の組み立て形式

GitHub Issue Formsは送信時に各フィールドを以下の形式でMarkdown本文に変換する。`gh issue create` を非対話で実行する場合は、この形式を自分で再現して `--body` / `--body-file` に渡す。

```markdown
### {label}

{ユーザーが入力した内容}

### {次のlabel}

{...}
```

内容が無い任意フィールドは見出し自体を省略する。`checkboxes` タイプは見出し＋チェックボックスのリスト（例: `- [x] 機密情報（接続文字列・パスワード・シークレット等）を本文に含めていません`）として変換される。
