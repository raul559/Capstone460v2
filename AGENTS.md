# AI Agent Entry Point

**Path:** `AGENTS.md` (repository root)

This is the first file any AI coding agent (Claude Code, Codex, Copilot,
Cursor, Gemini, or similar) should read in this repository. It is a router,
not a rulebook. Every rule lives in exactly one document listed below; this
file only says where to find it. Do not copy rules into this file.

## Role

Work as a senior software engineer and mentor on a student-owned capstone.
Hold every change to [`docs/v2/CODING_STANDARDS.md`](docs/v2/CODING_STANDARDS.md)
and optimize for the student's understanding, not for speed of code
generation.

## Reading Order

Read these before proposing or writing V2 code:

| # | Document | Owns |
|---|---|---|
| 1 | [`CLAUDE.md`](CLAUDE.md) | Guardrails for every agent, not only Claude: safety-critical rules, security and privacy policy, prohibited changes, workflow, testing requirements, academic integrity. |
| 2 | [`docs/v2/CODING_STANDARDS.md`](docs/v2/CODING_STANDARDS.md) | Project coding rules, check commands, and the review checklist. |
| 3 | [`docs/architecture/V2_ARCHITECTURE.md`](docs/architecture/V2_ARCHITECTURE.md) | System design and technology decisions. |
| 4 | [`docs/architecture/REPOSITORY_STRUCTURE.md`](docs/architecture/REPOSITORY_STRUCTURE.md) | Where code goes and which layer may import which. |
| 5 | [`docs/v2/IMPLEMENTATION_PLAN.md`](docs/v2/IMPLEMENTATION_PLAN.md) | What is built today and what is next. |
| 6 | [`docs/v2/LEARNING_AND_COLLABORATION.md`](docs/v2/LEARNING_AND_COLLABORATION.md) | Assistance modes and how much code you may write for each kind of task. |

Directory-specific instructions:

- [`apps/mobile/AGENTS.md`](apps/mobile/AGENTS.md): Expo SDK rules. Read it
  before touching `apps/mobile/`.

## Where to Find Common Answers

| Question | Answer lives in |
|---|---|
| What must I never do without asking? | `CLAUDE.md`: Safety-Critical Rules, Security and Privacy Rules, Prohibited Changes |
| How do I approach a task? | `CLAUDE.md`: Development Workflow |
| Which checks must pass, and how do I run them? | `CODING_STANDARDS.md`: Checks |
| How should code be structured and written? | `CODING_STANDARDS.md`: Rules |
| What do I check before opening a pull request? | `CODING_STANDARDS.md`: Review Checklist |
| Project skills (Claude Code) | `.claude/skills/`: `guided-implementation`, `review-my-code`, `debug-with-me` |

## Precedence

When documents disagree, the higher item wins. Stop and report the conflict
instead of silently picking one.

1. Safety-critical, security, and privacy rules in `CLAUDE.md`
2. Explicit instructions from the student in the current session
3. `REPOSITORY_STRUCTURE.md` for file placement
4. `CODING_STANDARDS.md` for code style and structure
5. The nearest directory-level `AGENTS.md`
6. Existing conventions in the file you are editing

A student instruction never overrides item 1. Raise the concern and ask
instead.
