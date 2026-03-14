---
name: test-ts-project
description: Ensures TypeScript projects run unit, e2e, coverage, and mutation tests sequentially until each step succeeds.
license: MIT
---

# test-ts-project Skill

## 概要

このスキルを実行したら、実装後に必ずテストの全ステップ（unit / e2e / coverage / mutation）を1から順に走らせ、各ステップが成功するまで継続することを求めます。失敗があれば1のステップへ戻り、修正と再実行を繰り返して合格させてください。

## 実行順序と合格ライン

1. **`npm run test`（/`pnpm test` 等プロジェクト固有） - UnitTest**
   - プロジェクトにすでに導入されているテスティングライブラリ（ViteならVitest、その他はJestやそれぞれのフレームワーク）を使います。
   - 新たにフレームワークを追加せず、既存ライブラリで `test` スクリプトが正常に動作するように調整してください。合格になるまで次フェーズへ進まず、必要な修正と再実行を続けてください。
2. **`npm run test:e2e` - Playwright E2E**
   - Playwrightを用いて、ログインやフォーム入力、画面遷移などのビジネスシナリオを再現するテストを記述・実行してください。
   - 実行結果が成功するまで、失敗箇所を見直してテスト・実装を改善します。
3. **`npm run test:coverage` - Branch Coverage**
   - ブランチカバレッジを算出し、90%以上を合格とします。
   - `vitest run --coverage` などプロジェクト固有のコマンドでブランチカバレッジが得られるように設定し、90% に達するまでテストを補強してください。
4. **`npm run test:mutation` - Stryker Mutation**
   - Strykerを導入し、ミューテーションスコア80%以上を合格とします。
   - `stryker.conf.js` などで対象ファイルとテストコマンドを指定し、80% を超えるまでテスト品質を高める作業を継続してください。

## 設定と補足

- Playwright、Stryker、既存のテスティングライブラリが未インストールであれば `npm install --save-dev` 等で追加し、スクリプトから実行できるようにしてください。
- `test` → `test:e2e` → `test:coverage` → `test:mutation` の順に個別で実行し、前のステップに失敗がないことを確認してから次へ進んでください。各ステップは成功するまで再実行し、ログやカバレッジ／ミューテーションレポートを参考に不足を補ってください。
- Stryker設定では対象ファイルやテストコマンド、テスト環境（Node、ブラウザなど）を明示的に記述し、必要に応じて `tsconfig` や `playwright.config.ts` との整合性を保ってください。

## 期待される成果

- 実装後に4ステップを順に実行することで、ユニット、E2E、カバレッジ、ミューテーションの信頼性が確保される。
- 各ステップは成功するまで繰り返す習慣が生まれ、テストの合格ライン（Unit成功、E2E成功、Coverage ≥ 90%、Mutation ≥ 80%）を順番に満たしていく。
- スキルを実行した際には、どのステップが失敗したかを把握し、そのステップに戻って再検証することで段階的な品質向上が可能となる。
