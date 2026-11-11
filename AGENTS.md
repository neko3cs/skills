# neko3cs Agent Skills

## What This Repo Is

The working tree **is** `~/.claude/skills`. A save goes live across every harness immediately — before any commit, branch, or PR. Treat saving here as deploying.

Every change goes through a branch and a pull request. `main` is protected on GitHub, so direct pushes are rejected.

There is no build, no test suite, and no CI. Nothing to run.

## Conventions

`SKILL.md` follows <https://agentskills.io/specification>. On top of it:

- Frontmatter `description` is **English**; the `SKILL.md` body is **Japanese**.
- `description` alone decides whether a skill fires, so include the phrasings a user would actually type, in both English and Japanese.
- `license: MIT` on every skill.
- **Do not invent subdirectory names.** Use `references/` (documents), `assets/` (templates, schemas, images), `scripts/` (executables), even when a skill-specific name would read better. Consistency across skills beats the better name.
- **Only a skill that orchestrates other skills names them** (today: `implement-design`). It names each skill it calls, because a loose hint like "implement with TDD" may not load the skill mid-task, and its house rules then drop silently. Every other skill names no caller and no peer: state the rule inline, or say the work is out of scope. This keeps dependencies one-way, so restructuring one skill never breaks another.
- **The skill list lives in `README.md` only.** Agents receive the list from the harness, so `AGENTS.md` does not duplicate it. Add the `README.md` entry in the same commit as the skill.
