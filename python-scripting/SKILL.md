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

- Pythonを使う作業では、必ず `uv` 経由で実行してください。最初に `uv` が利用可能か確認し、見つからない場合はその時点で作業を中断し、未導入であることをユーザーに伝えてください。
- 外部パッケージが必要なスクリプトでは、必ずPEP 723形式のインライン依存関係を使ってください。`requirements.txt` の追加、`pip install`、`uv pip install`、`python -m venv`、`uv venv` など、環境を汚す手段（下記「禁止事項」）は使いません。
- スクリプトは常に `uv run <script>.py` で実行してください。標準ライブラリだけで完結する場合もインライン依存関係を使う場合も同じです。
- 一時実行用途の `pipx` や `uvx` 自体は禁止しませんが、Pythonコードを実行する基本手段としては使わず、原則としてスクリプト + `uv run` + インライン依存関係を採用してください。

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
