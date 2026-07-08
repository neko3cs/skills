---
description: Delegate investigation, an explicit fix request, or follow-up rescue work to the agy rescue subagent
argument-hint: "[--background|--wait] [--resume|--fresh] [--model <model>] [what agy should investigate, solve, or continue]"
allowed-tools: Bash(node:*), AskUserQuestion, Agent
---

Invoke the `agy:agy-rescue` subagent via the `Agent` tool (`subagent_type: "agy:agy-rescue"`), forwarding the raw user request as the prompt.
`agy:agy-rescue` is a subagent, not a skill — do not call `Skill(agy:agy-rescue)` (no such skill).
The final user-visible response must be agy's output verbatim.

Raw user request:
$ARGUMENTS

Execution mode:

- If the request includes `--background`, run the `agy:agy-rescue` subagent in the background.
- If the request includes `--wait`, run the `agy:agy-rescue` subagent in the foreground.
- If neither flag is present, default to foreground.
- `--background` and `--wait` are execution flags for Claude Code. Do not forward them to `task`, and do not treat them as part of the natural-language task text.
- `--model` is a runtime-selection flag. Preserve it for the forwarded `task` call, but do not treat it as part of the natural-language task text.
- If the request includes `--resume`, do not ask whether to continue. The user already chose.
- If the request includes `--fresh`, do not ask whether to continue. The user already chose.
- Otherwise, before starting agy, check for a resumable rescue thread from this Claude session by running:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/agy-companion.mjs" task-resume-candidate --json
```

- If that helper reports `available: true`, use `AskUserQuestion` exactly once to ask whether to continue the most recent agy conversation or start a new one.
- The two choices must be:
  - `Continue most recent agy conversation`
  - `Start a new agy conversation`
- If the user is clearly giving a follow-up instruction such as "continue", "keep going", "resume", "apply the top fix", or "dig deeper", put `Continue most recent agy conversation (Recommended)` first.
- Otherwise put `Start a new agy conversation (Recommended)` first.
- If the user chooses continue, add `--resume` before routing to the subagent.
- If the user chooses a new thread, add `--fresh` before routing to the subagent.
- If the helper reports `available: false`, do not ask. Route normally.
- IMPORTANT: unlike the Codex/Copilot bridges, agy has no per-thread session id. `--resume` here means "continue the most recent agy conversation on this machine", not a conversation scoped to this specific prior job. If the user has used `agy` interactively for something unrelated in between, `--resume` will continue that instead. Mention this to the user if it seems relevant (e.g. they haven't used agy in a while, or asked to resume something very specific).

Operating rules:

- The subagent is a thin forwarder only. It should use one `Bash` call to invoke `node "${CLAUDE_PLUGIN_ROOT}/scripts/agy-companion.mjs" task ...` and return that command's stdout as-is.
- Return the agy companion stdout verbatim to the user.
- Do not paraphrase, summarize, rewrite, or add commentary before or after it.
- Do not ask the subagent to inspect files, monitor progress, poll `/agy:status`, fetch `/agy:result`, call `/agy:cancel`, summarize output, or do follow-up work of its own.
- Leave the model unset unless the user explicitly asks for one. agy has no separate reasoning-effort flag; effort is chosen via specific `--model` names (e.g. "Gemini 3.1 Pro (High)").
- Leave `--resume` and `--fresh` in the forwarded request. The subagent handles that routing when it builds the `task` command.
- If the helper reports that agy is missing or unauthenticated, stop and tell the user to run `/agy:setup`.
- If the user did not supply a request, ask what agy should investigate or fix.
