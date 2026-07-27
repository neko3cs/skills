# neko3cs Agent Skills

## What This Repo Is

The working tree **is** `~/.claude/skills`. A save goes live across every harness immediately — before any commit, branch, or PR. Treat saving here as deploying.

Two artifact types live side by side and are not interchangeable:

| Type | Marker | Examples |
| :--- | :--- | :--- |
| Agent Skill | `<name>/SKILL.md` | most directories |
| Claude Code plugin | `<name>/.claude-plugin/plugin.json` with `agents/` `commands/` `hooks/` `scripts/` | `agy/`, `copilot/` |

Plugins have no `SKILL.md`. The rules below do not apply to them.

There is no build, no test suite, and no CI. Nothing to run.

## Conventions

- `SKILL.md` follows <https://agentskills.io/specification>.
- Frontmatter `description` is **English**; the `SKILL.md` body is **Japanese**. `README.md` is Japanese; `AGENTS.md` and `PLAN.md` are English.
- `license: MIT` on every skill.
- **Do not invent subdirectory names.** Use `references/` (documents), `assets/` (templates, schemas, images), `scripts/` (executables), even when a skill-specific name would read better. Consistency across skills beats the better name.
- Reference files inside a skill by path relative to the skill root.
- **The skill list lives in `README.md` only.** Agents receive the list from the harness, so `AGENTS.md` does not duplicate it. Add the `README.md` entry in the same commit as the skill.

## SKILL.md Rules

- `name` must **exactly match the directory name**. Lowercase, digits, and hyphens only; no leading, trailing, or consecutive hyphens.
- `description` must state **what the skill does and when to use it**. Skills load by intent-match against this field, so it alone decides whether the skill fires. Include the phrasings a user would actually type, in both languages where relevant.
- Keep the body within ~500 lines. Push judgment criteria and long source material into `references/` so they load only when needed.

## Incidents

2026-07-27 | Two skills (`update-planmd`, `design-docs`) were missing from both the `README.md` and `AGENTS.md` skill lists; the same list was maintained in three places. | Keep the list in `README.md` only, and add the entry in the same commit as the skill.
