---
description: Check whether the local Antigravity CLI (agy) is ready
allowed-tools: Bash(node:*)
---

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/agy-companion.mjs" setup --json
```

If the result says `agy` is unavailable:
- Tell the user to install it (e.g. `winget install Google.AntigravityCLI` on Windows). Do not attempt to install it yourself.

If `agy` is installed but the auth check failed:
- Tell the user to run `agy` interactively once to complete sign-in, then rerun `/agy:setup`.

Output rules:
- Present the final setup output to the user.
