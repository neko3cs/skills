---
name: ts-testing
description: Specifies the mandatory sequence of unit, e2e, coverage, and mutation tests for TypeScript projects.
license: MIT
---

# ts-testing Skill

## 概要

このスキルがアクティブなTypeScriptプロジェクトでは、実装後に必ずテストの全ステップ（unit / e2e / coverage / mutation）を1から順に走らせ、各ステップの合格基準を満たすことを求めます。失敗したら最初のステップに戻り、再実装・再実行してください。

## 実行順序と合格ライン

1. **`npm run test`（/`pnpm test` 等プロジェクト固有） - UnitTest**
   - プロジェクトにすでに導入されているテスティングライブラリ（Viteの場合はVitest、他はJestやそれぞれのフレームワーク）を使ってください。
   - 新たにフレームワークを追加するのではなく、既存のライブラリで `test` スクリプトが正常に動作することを確認してください。
2. **`npm run test:e2e` - Playwright E2E**
   - Playwrightを用いてユーザー操作のビジネスシナリオを再現します。ログイン、入力、送信、画面遷移など、実際のユーザー体験に沿ったテストケースを用意してください。
3. **`npm run test:coverage` - Branch Coverage**
   - ブランチカバレッジを算出し、90%以上を合格とします。90% 未満ならTest Failとみなし、該当箇所を補うテストを追加してから再実行してください。
4. **`npm run test:mutation` - Stryker Mutation**
   - Strykerを導入し、ミューテーションスコア80%以上を合格とします。80% 未満の場合はテストの品質を上げる改善を行い、再実行してください。

## 設定と補足

- Playwright/Vitest/Strykerがインストールされていない場合は `npm install --save-dev` で追加し、`package.json` のスクリプトで実行できるように設定してください。
- `test:e2e` は `playwright test` などの命令を含むスクリプトにし、実環境に近いシナリオを自動化することを重視してください。
- `test:coverage` は `vitest run --coverage` のようにブランチカバレッジ出力が可能なコマンドを用いてください。CIでも同じコマンドで90% を保証します。
- `test:mutation` ではStrykerの設定ファイル（`stryker.conf.js` など）を用意し、対象ディレクトリ・ファイルを正しく指定してください。標準のテストスイートが通ることが前提です。
- 4ステップはすべて成功するまで進めないでください。各ステップが失敗したらリグレッションの兆候とみなし、リトライすることを厳守してください。

## 期待される成果

- テストスクリプトを通じて、信頼性の高いユニット、E2E、カバレッジ、ミューテーション検証が得られる。
- 4ステップは `test` → `test:e2e`→ `test:coverage` → `test:mutation` の順に、各コマンドを個別に実行して検証してください。失敗時は各ステップのログ/差分を確認し、再実行前に問題箇所を補強します。
