# TypeScript のテスト手順

## 実行順序と合格ライン

テストを始める前にコード品質の土台を整えるため、以下の手順をこの順序で必ず完了してください。多くのプロジェクトでは `package.json` に示すようなスクリプトが用意されています（例：`"format": "prettier --write ."`, `"lint": "eslint --cache ."`, `"typecheck": "tsc --noEmit -p ..."`）。

1. **`pnpm run format`（`prettier --write .`） - Format**
   - 最初に `prettier --write .` を実行して、コード全体の書式を整えます。
   - 可能な限りこのコマンドをスクリプト経由で実行し、差分を無くします。戻ってくる変更はフォーマット作業のみとし、意図的な機能変更は含めないでください。
2. **`pnpm run lint`（`eslint --cache .`） - Lint**
   - `eslint --cache .` を使って静的解析と規約チェックを行い、すべての警告とエラーを解消してください。
   - キャッシュを活用した実行で迅速に検出し、必要なら設定やルールを調整してプロジェクトのスタイルガイドに従わせてください。
3. **`pnpm run typecheck`（`tsc --noEmit`） - Typecheck**
   - `tsc --noEmit` を走らせ、型チェックが通過するまで修正を繰り返してください。必要であれば `tsconfig.node.json` や `tsconfig.web.json` を使った `typecheck:node` / `typecheck:web` 相当の確認も行います。
4. **テストシーケンス**
   - すべてのフォーマット・リンティング・型チェックが合格したら、以下のテストステップを順に実行します。各ステップは成功するまで繰り返し、失敗したステップに戻って再検証してください。
   - **`npm run test`（または `pnpm test` 等） - UnitTest**
     - 既存のテストライブラリ（Vitest、Jestなど）を利用し、新たなフレームワークを追加せずに `test` スクリプトが通るよう調整します。
   - **`npm run test:e2e` - Playwright E2E**
     - Playwrightでログインやフォーム、画面遷移などのシナリオを再現し、堅牢性を検証します。失敗箇所を修正し、成功を確認できるまで繰り返します。
   - **`npm run test:coverage` - Branch Coverage**
     - ブランチカバレッジを計測し、90%以上を合格とします。`vitest run --coverage` などを調整して達成してください。
     - **合格ライン: ブランチカバレッジ 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**
   - **`npm run test:pbt` - Property-Based Test（fast-check）**
     - `fast-check` を使ったプロパティベーステストを実施します。未インストールであれば `npm install --save-dev fast-check` で追加してください。
     - PBT はブランチカバレッジの穴埋めではなく、**人がレビューすべき重要なテストケース**を表現するために行います。ランダムな入力で仕様の不変条件・境界条件・対称性などを検証するプロパティを定義してください。
     - PBT のレベル（ユニット・シナリオ・E2E）はプロダクトの性質に合わせて柔軟に選択します。ビジネスロジックの不変条件はユニットレベル、複数コンポーネントにまたがる仕様はシナリオレベルで記述することを基本とします。
     - `package.json` の `test:pbt` スクリプトに登録し、`vitest` や `jest` の設定ファイルで PBT 専用のファイルパターンを認識させてください。
   - **`npm run test:mutation` - Stryker Mutation**
     - Strykerでミューテーションテストを実行し、90%以上のスコアを目指します。`stryker.conf.js` 等で対象ファイルとテストコマンドを明示的に指定してください。
     - **合格ライン: ミューテーションスコア 90% 以上。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。**

## セキュリティ検証

[共通手順](security.md) に従い、通常ゲートに以下を追加する。

- **CodeQL**: JavaScript extractor による TypeScript 解析を使う。対応する TS / Node バージョン、対象ソースと生成物の除外、既存 CI の suite を確認する。ローカルの DB 作成・解析例は共通手順を参照する。ESLint / `tsc` の成功で代替せず、抽出ログ・SARIF・検出を確認する。
- **Sanitizer**: 通常の JavaScript / TypeScript は Xcode ASan / TSan の対象外。自前ビルドする native addon や Wasm 等がある場合は、それぞれのツールチェーンの計装と対応ランタイムを確認する。対象にできるが環境がない場合は未確認とする。
- **依存監査**: `packageManager`、ワークスペース、使用中の lockfile とレジストリを確認し、既存のパッケージマネージャーの監査を使う。例のうち該当するものだけを実行する。

  ```sh
  npm audit --json > reports/npm-audit.json
  pnpm audit --json > reports/pnpm-audit.json
  # Yarn Berry の例。Classic は採用版の yarn audit を確認
  yarn npm audit --all --recursive --json > reports/yarn-audit.json
  ```

  各コマンドの終了コードを直後に記録し、レポート内の検出と通信・認証エラーを区別する。開発時依存と推移的依存も含め、production のみの監査を全体監査と呼ばない。使用レジストリの監査 API 対応・DB の制限、Git / local / private 依存の照合可否を確認する。`outdated` と脆弱性監査は別。`audit fix --force` 等で無条件に更新せず、影響を確認して修正・通常テスト・再監査する。

- [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/)
- [pnpm audit](https://pnpm.io/cli/audit)
- [Yarn npm audit](https://yarnpkg.com/cli/npm/audit)

## 設定と補足

- Playwright、Stryker、fast-check、既存のテスティングライブラリが未インストールであれば `npm install --save-dev` 等で追加し、スクリプトから実行できるようにしてください。
- `test` → `test:e2e` → `test:coverage` → `test:pbt` → `test:mutation` の順に個別で実行し、前のステップに失敗がないことを確認してから次へ進んでください。各ステップは成功するまで再実行し、ログやカバレッジ／ミューテーションレポートを参考に不足を補ってください。
- Stryker設定では対象ファイルやテストコマンド、テスト環境（Node、ブラウザなど）を明示的に記述し、必要に応じて `tsconfig` や `playwright.config.ts` との整合性を保ってください。
- PBT は通常のテストとは役割が異なります。カバレッジのためではなく「この仕様は常に成り立つか」を表現するプロパティを選んで記述し、レビュアーが仕様を読み取れる質の高いテストにしてください。
- カバレッジが 90% に届かない場合は、未カバーのブランチを特定し、境界値テストや条件分岐テストを追加してください。100% を目指しますが、テストが無意味に複雑になる・コストに見合わない場合はできるところまでとします。

## サンプル対話

**User:** フォーム機能を実装したので品質ゲートを通してください。

**Agent:** format → lint → typecheck → unit → e2e → coverage → pbt → mutation の順に実行します。typecheckで型エラーが1件出たので直してから進めます。
