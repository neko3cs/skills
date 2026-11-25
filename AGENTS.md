# neko3cs Agent Skills

## What This Repo Is

This repository distributes personal agent skills as a single-plugin marketplace (`skills@neko3cs`) and an `npx skills`-compatible repository across Claude Code, GitHub Copilot CLI, Codex, and Antigravity.

Development follows a standard Git workflow: work in a regular local clone on a feature branch, open a pull request, merge into `main`, and update the installed plugin or skills in each harness. `main` is protected on GitHub, so direct pushes are rejected.

There is no build, no test suite, and no CI. When changing manifests or skill layouts, validate locally with `claude plugin validate .` and `agy plugin validate .`.

## Repository Layout & Manifests

Place every skill at `skills/<skill-name>/SKILL.md`. Both plugin manifests and `npx skills` auto-discover skills from `skills/`.

Harness manifests live at:

- `.claude-plugin/marketplace.json` & `.claude-plugin/plugin.json` — Claude Code
- `.github/plugin/marketplace.json` — GitHub Copilot CLI
- `.agents/plugins/marketplace.json` & `.codex-plugin/plugin.json` — Codex
- `plugin.json` — Antigravity

Adding, removing, or editing skills under `skills/` requires no manifest edits. When updating plugin metadata (`name`, `description`, `version`, etc.), keep all manifests in sync. Keep root `plugin.json` limited to Antigravity's supported top-level fields (`name`, `displayName`, `version`, `description`, `author`, `homepage`, `repository`, `logo`, `suggestedPrompts`, `disabled`) so `agy plugin validate` does not warn on unknown keys.

## Conventions

`SKILL.md` follows <https://agentskills.io/specification>. On top of it:

- Frontmatter `description` is **English**; the `SKILL.md` body is **Japanese**.
- `description` alone decides whether a skill fires, so include the phrasings a user would actually type, in both English and Japanese.
- `license: MIT` on every skill.
- **Do not invent subdirectory names.** Use `references/` (documents), `assets/` (templates, schemas, images), `scripts/` (executables), even when a skill-specific name would read better. Consistency across skills beats the better name.
- **Only a skill that orchestrates other skills names them** (none does today). Such a skill names each skill it calls, because a loose hint like "implement with TDD" may not load the skill mid-task, and its house rules then drop silently. Every other skill names no caller and no peer: state the rule inline, or say the work is out of scope. This keeps dependencies one-way, so restructuring one skill never breaks another.
- **The skill list lives in `README.md` only.** Agents receive the list from the harness, so `AGENTS.md` does not duplicate it. Add the `README.md` entry in the same commit as the skill.
