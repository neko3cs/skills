---
name: agy-result-handling
description: Internal guidance for presenting agy helper output back to the user
user-invocable: false
---

# Agy Result Handling

When the helper returns agy output:
- Present the raw output as-is; agy has no structured verdict/findings/next-steps format to preserve (that's Codex/Copilot-specific — this plugin only has a plain `task` command).
- For `agy:agy-rescue`, do not turn a failed or incomplete agy run into a Claude-side implementation attempt. Report the failure and stop.
- For `agy:agy-rescue`, if agy was never successfully invoked, do not generate a substitute answer at all.
- If agy made file edits, verify what changed yourself (e.g. `git status`/`git diff`) before summarizing, since agy's plain-text output does not reliably enumerate touched files the way the Copilot bridge's structured output does.
- If the helper reports malformed output or a failed agy run, include the most actionable stderr lines and stop there instead of guessing.
- If the helper reports that setup or authentication is required, direct the user to `/agy:setup` and do not improvise alternate auth flows.
