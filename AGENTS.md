# neko3cs Agent Skills

## Project Objective

To develop and manage global skills for the neko3cs environment.

## Coding Conventions

The creation of `SKILL.md` must comply with the specifications described on the following site:

<https://agentskills.io/specification>

---

## SKILL.md Specification Details

### 1. Frontmatter

The beginning of `SKILL.md` must always include YAML-formatted frontmatter.

| Field | Required | Description |
| :--- | :--- | :--- |
| `name` | **Yes** | 1-64 characters. Lowercase, numbers, and hyphens only. Must **exactly match the directory name**. |
| `description` | **Yes** | 1-1024 characters. Describes what the skill does and when it should be used. |
| `license` | No | License name or reference to an included license file. |
| `compatibility` | No | System requirements, dependency packages, network access requirements, etc. |
| `metadata` | No | Optional key-value pairs for additional properties. |
| `allowed-tools` | No | List of allowed tools (space-separated). |

### 2. Directory Structure

Skills are managed on a directory basis and can have the following structure:

- `SKILL.md` (Required): Main instruction file placed at the root of the skill.
- `scripts/` (Optional): Scripts executable by the agent (Python, Bash, JS, etc.).
- `references/` (Optional): Additional documentation or supplementary information.
- `assets/` (Optional): Static assets such as templates, images, data schemas, etc.

### 3. Validation and Naming Conventions

- **Directory Name:** Must match the `name` field in the frontmatter.
- **Character Restrictions:** Only lowercase letters, numbers, and hyphens are allowed. Consecutive hyphens or hyphens at the beginning/end are not allowed.
- **File References:** Use relative paths from the skill root when referencing other files within the skill.
- **Context Optimization:** The body of `SKILL.md` (Markdown part) is recommended to be within 500 lines to optimize agent processing capability.

---

## Available Skills

- **communication-rule**: Defines language rules for communication and documentation.
- **git-rule**: Enforces user permission for git commit and push operations.
- **hello-world**: A basic example skill for demonstration.
- **test-dotnet-project**: Ensures .NET projects run `dotnet format`, xUnit tests, Playwright.NET e2e checks when applicable, and Stryker.NET mutation tests in sequence.
- **tool-rule**: Restricts unauthorized tool usage and installation.
