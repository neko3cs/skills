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

- **create-github-issue**: Creates a GitHub Issue via `gh` using neko3cs/.github's ISSUE_TEMPLATE forms (bug report / feature request), filling all required fields.
- **create-github-pullrequest**: Creates a GitHub Pull Request via `gh` using neko3cs/.github's pull_request_template.md, filled from the actual diff/commits.
- **dotnet-scripting**: Guides .NET one-liners and small data-processing scripts using C# file-based apps and `dotnet run -`.
- **hello-world**: A basic example skill for demonstration.
- **python-scripting**: Guides Python scripting through `uv`, requiring inline dependency metadata instead of virtual environments or direct package installation.
- **test-as-tdd**: Drives implementation through the Red-Green-Refactor TDD cycle with TODO list decomposition, based on Takuto Wada's TDD Boot Camp talk.
- **test-ts-project**: Ensures TypeScript projects run unit, e2e, coverage, and mutation tests sequentially until each step succeeds.
- **test-dotnet-project**: Ensures .NET projects run `dotnet format`, xUnit tests, Playwright.NET e2e checks when applicable, and Stryker.NET mutation tests in sequence.
- **test-ios-project**: Ensures iOS/Swift projects run SwiftFormat, SwiftLint, XCTest unit tests with branch coverage, XCUITest UI tests when applicable, property-based tests with SwiftCheck, and Muter mutation tests in sequence.
- **resolve-issue**: Resolves a GitHub issue end-to-end: reads the issue, creates a branch, implements a fix, adds tests, and opens a pull request.
- **update-agentsmd**: Creates or updates AGENTS.md with tacit knowledge, open issues, incident log, and a dated handoff snapshot for zero-context continuation.
- **design-docs**: Creates and maintains the four design documents (requirements / specification / architecture / design) from templates, routing later changes to the file that matches the change's update frequency.
- **gyaru**: Rewrites Claude's chat responses in gyaru (ギャル) speech style. Two eras selectable via argument: `heisei` (default) and `reiwa`; era-specific rules live in `references/`.
- **ojousama**: Rewrites Claude's chat responses in refined "ojousama" (お嬢様) speech style for elegant, polite conversations.
