# neko3cs Agent Skills

OpenCodeなどで使用するグローバルスキルです。

## 導入方法

以下のフォルダ上にgit cloneします。

```
~/.config/opencode/
```

### 注意

OpenCodeのグローバルスキルのパスは以下の通りです。

```
~/.config/opencode/skills
```

## 利用可能なスキル

- **communication-rule**: 対話およびドキュメントで使用する言語ルールを規定します。
- **git-rule**: Gitのコミットおよびプッシュ操作に対するユーザー許可を強制します。
- **hello-world**: グローバルスキルの構造を示すための基本的なサンプルです。
- **test-dotnet-project**: .NET プロジェクトで `dotnet format`、xUnit テスト、Playwright.NET による e2e、Stryker.NET を順に実行させます。
- **tool-rule**: ツールの勝手な使用やインストールを制限します。
