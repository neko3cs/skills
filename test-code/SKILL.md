---
name: test-code
description: Run a project's post-implementation quality gate, choosing .NET, iOS/Swift, or TypeScript procedures from repository evidence. Use when asked to test a project, run quality checks before commit or PR, or「テストして」「品質ゲートを通して」「実装後の検証をして」. Covers formatting, lint/type checks where applicable, unit and E2E/UI tests, coverage, property-based tests, and mutation tests.
license: MIT
---

# test-code

実装後の品質ゲートを実行する。プロジェクトの構成と変更対象から手順を選び、該当する参照ファイルだけを読む。

## 手順の選択

リポジトリの `AGENTS.md`、変更差分、プロジェクト定義、既存のテスト設定と CI を確認する。拡張子だけで決めず、実際にテスト対象となるプロジェクト単位で判定する。

| 判定の手掛かり | 読む手順 |
| :--- | :--- |
| `.sln` / `.slnx` / `.csproj` / `.fsproj` などの .NET プロジェクト | [references/dotnet.md](references/dotnet.md) |
| `.xcodeproj` / `.xcworkspace` / `Package.swift` などの iOS / Swift プロジェクト | [references/ios.md](references/ios.md) |
| `package.json` の TypeScript 依存・スクリプト、`tsconfig*.json` など | [references/typescript.md](references/typescript.md) |

- 複数の対象がある場合は、変更したコンポーネントとその影響先ごとに対応する手順を選ぶ。たとえば .NET API と TypeScript フロントエンドを変更したら両方を対象にする。
- `package.json` がドキュメント用ツールにしか使われていない場合など、構成ファイルの存在だけを理由に対象を追加しない。
- 対象と選定理由を実行前に短く伝える。判定できる場合は言語の選択をユーザーに求めない。
- 対応手順のない言語では、他言語のツールを当てはめない。プロジェクト既定の検証を行い、このスキルの手順では未対応であることを報告する。

## 共通の進め方

- 各参照の順序に沿って個別に実行し、前段の失敗を解消してから次へ進む。コマンド例より、プロジェクトの既存スクリプト、パッケージマネージャー、設定、テスト対象を優先する。
- 失敗の原因を調べ、実装やテストを修正する。修正後は影響する検証を再実行し、必要のない全工程のやり直しを繰り返さない。
- ブランチカバレッジとミューテーションスコアは 90% 以上を合格ラインとし、意味のあるテストで 100% を目指す。達成に見合わない複雑さやコストが生じる場合は、実測値と未達理由を報告し、合格扱いにしない。
- PBT は仕様の不変条件・境界条件・対称性などを表す。カバレッジの数字を埋めるためのテストにしない。
- 合格のためにテストを無効化したり、閾値・解析ルールを緩めたりしない。
- 必要なツールやテスト基盤の整備は対象プロジェクトの規約と依頼範囲に従う。実行環境の不足や外部依存で進めない場合は、原因と再開条件を報告し、同じ失敗を無制限に繰り返さない。
- 未実行・測定不能を成功と扱わない。行・領域カバレッジをブランチカバレッジとして報告しない。

## 結果の報告

対象プロジェクト、実行コマンド、各ステップの成否、カバレッジ・ミューテーションの実測値とレポートの場所を簡潔に示す。「確認済み」「失敗・基準未達」「対象外（理由付き）」「未確認（実行できなかった理由付き）」を区別する。

このスキルが担当するのは実装後の検証。TDD の実装サイクルには `test-as-tdd` を使う。コミット・push・PR 作成は、このスキルの呼び出しだけでは許可されたとみなさない。
