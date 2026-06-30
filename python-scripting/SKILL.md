---
name: python-scripting
description: Run Python scripts via `uv run` with PEP 723 inline dependencies — no venvs, no `pip install`. Use when the user asks to process data or run a quick Python script.
compatibility:
  - Requires `uv` on PATH
  - Uses Python through `uv run`
---

# Python スクリプト作成ガイド（uv / インライン依存関係）

このスキルは、Pythonのワンライナーや小さなスクリプトを扱う際に、`uv` を使った安全で再現性のある実行方法を強制します。基本運用は、スクリプトを書き、必要な依存関係をインラインで宣言し、`uv run` で実行する形です。

## 基本方針

1. **`uv` を必須にする**
   - Pythonを使う作業では、必ず `uv` 経由で実行してください。
   - 最初に `uv` が利用可能か確認してください。
   - `uv` が見つからない場合は、その時点で作業を中断し、`uv` が未導入であることをユーザーに伝えてください。

2. **依存関係はインラインで宣言する**
   - 外部パッケージが必要なスクリプトでは、必ずPEP 723形式のインライン依存関係を使ってください。
   - `requirements.txt` の追加、`pip install`、`pip install -g`、`uv pip install`、`python -m venv`、`uv venv` など、環境を汚す手段は禁止です。
   - 環境に直接パッケージを入れたり、仮想環境を新規作成したりしてはいけません。
   - 一時実行用途の `pipx` や `uvx` 自体はこのルールでは禁止しませんが、Pythonコードを実行する基本手段としては使わず、原則としてスクリプト + `uv run` + インライン依存関係を採用してください。

3. **実行方法を統一する**
   - スクリプトは `uv run <script>.py` で実行してください。
   - 依存関係を使う場合も、同じく `uv run` で実行してください。

## 標準ライブラリだけで完結する場合

標準ライブラリだけで完結する場合は、通常のPythonスクリプトとして `uv run` で実行します。

```python
from pathlib import Path

text = Path("input.txt").read_text()
print(text.upper())
```

```bash
uv run script.py
```

## 外部パッケージを使う場合

外部パッケージが必要な場合は、ファイル先頭にインライン依存関係を記述してください。

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "requests",
#     "beautifulsoup4",
#     "pandas",
# ]
# ///

import requests
from bs4 import BeautifulSoup
import pandas as pd
```

```bash
uv run script.py
```

## 指示

エージェントはPythonを使う必要があると判断した場合、以下の順序で行動してください。

1. `uv` が存在するか確認する
2. 標準ライブラリで足りるかを判断する
3. 外部パッケージが必要なら、インライン依存関係をスクリプトに記述する
4. `uv run` で実行する

## 優先する実行形態

- 最優先は、Pythonスクリプトを作成して `uv run <script>.py` で実行する方法です。
- 外部依存がある場合は、必ずスクリプト先頭にインライン依存関係を記述してください。
- `pipx` や `uvx` は環境を恒久的に汚す手段ではないため一律禁止ではありませんが、このスキルにおける標準手順ではありません。

## 禁止事項

- `pip install <package>`
- `pip install -g <package>`
- `uv pip install <package>`
- `python -m pip install <package>`
- `python -m venv .venv`
- `uv venv`
- `.venv` などの仮想環境ディレクトリの作成
- 依存関係を環境へ直接インストールすること

## サンプル対話

**User:** PythonでHTMLを取って表をCSVにしてください。

**Agent:** まず `uv` が使えることを確認します。外部パッケージが必要なので、インライン依存関係を持つPythonスクリプトを作成し、`uv run` で実行します。

**User:** `uv` が入っていない環境でも進めてください。

**Agent:** このスキルでは `uv` が必須です。`uv` が見つからない場合は作業を中断し、未導入であることをお伝えします。
