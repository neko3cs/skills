---
description: Check whether the local GitHub Copilot CLI is ready and optionally toggle the stop-time review gate
argument-hint: '[--enable-review-gate|--disable-review-gate]'
allowed-tools: Bash(node:*), AskUserQuestion
---

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/copilot-companion.mjs" setup --json $ARGUMENTS
```

If the result says Copilot CLI is unavailable:
- Tell the user to install it (see https://docs.github.com/copilot/how-tos/copilot-cli). Do not attempt to install it yourself; there is no single cross-platform install command to run non-interactively.

If Copilot CLI is installed but not authenticated:
- Preserve the guidance to run `!copilot login`.

Output rules:
- Present the final setup output to the user.
