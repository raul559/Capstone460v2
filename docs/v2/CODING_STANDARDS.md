# SkinAI V2 Coding Standards

**Path:** `docs/v2/CODING_STANDARDS.md`

The rules every V2 change follows, whoever or whatever wrote it. General style
(formatting, import order, naming conventions) is left to the linters. This
page covers the decisions specific to this project. Safety, security policy,
and file placement live in [`CLAUDE.md`](../../CLAUDE.md) and
[`REPOSITORY_STRUCTURE.md`](../architecture/REPOSITORY_STRUCTURE.md).

## Checks

CI (`.github/workflows/ci.yml`) runs these on every pull request. Run them
locally before pushing.

| Area | Command | Config |
|---|---|---|
| Mobile lint | `npm run lint` in `apps/mobile` | `apps/mobile/eslint.config.js` |
| Mobile types | `npx tsc --noEmit` in `apps/mobile` | `apps/mobile/tsconfig.json` |
| Mobile tests | `npm test` in `apps/mobile` | `jest` in `apps/mobile/package.json` |
| Python lint and format | `ruff check .` and `ruff format --check .` at the repo root | `ruff.toml` |
| API tests | `pytest` in `services/api` | `services/api/pyproject.toml` |

Ruff and pytest come from the API virtualenv (`pip install -e ".[dev]"`). Setup and
manual testing steps are in [`DEVELOPMENT.md`](DEVELOPMENT.md).

## Rules

**1. One job per file and per function.** You should be able to describe a
file's purpose in one sentence without "and". Screens compose components and
navigate; route handlers parse the request, call one service, and return a
response schema. Logic lives in hooks, services, and `intelligence/`. Lint
enforces one React component per file, 300 lines per file, and a complexity
limit. When a file outgrows them, split it by responsibility. Mobile features
follow the folder layout in `REPOSITORY_STRUCTURE.md` (`screens/`,
`components/`, `hooks/`, `stores/`, `utils/`), and each component keeps its
`StyleSheet` at the bottom of its own file.

**2. Don't repeat yourself.** Every fact has one home, and everything else
imports or links to it:

- API base URL and requests: the shared API client. Screens never call
  `fetch` (lint enforces this).
- Request and response shapes: Pydantic schemas on the server, with matching
  TypeScript types on the client.
- Class labels and their order: `intelligence/ml/labels.py`.
- Upload limits and allowed image types: one constants module per side.
- Colors and spacing: `apps/mobile/src/constants/theme.ts`.
- Rules in docs: written once in the owning document, linked elsewhere.

Extract on the third copy, not the second. Keep API schemas and database
models separate even when they look alike, because they change for different
reasons.

**3. Fail loudly and safely.** No empty `catch` or `except`. Raise domain
errors in services and map them to one structured API error format. A failed,
rejected, or uncertain analysis is shown as exactly that, never as low risk.

**4. Secure by default.** Secrets come from environment settings, never from
source. Validate every input on the server, even when the app already checked
it. Take the user's identity from the verified token, and filter every
user-owned query by it. Never log tokens, images, or intake answers.

**5. Write for the next reader.** Clear names over comments. Comments explain
why, not what. No nested ternaries, commented-out code, or placeholder names.
No emoji or decorative symbols in code or UI text; use the icon library
(lint enforces emoji). Plain wording in comments, commits, and docs.

**6. Use AI tools openly and carefully.** Disclose AI help in the pull request
template. Treat generated code as a draft until you have read it, run it, and
can explain it. Never paste secrets, patient images, or health data into a
prompt.

## Existing Code

Files written before these rules start with an `eslint-disable` comment naming
the rules they break and a `TODO` saying what to fix. When you fix a file,
delete its comment so the rules apply again. Never add one to new code.

## Review Checklist

- [ ] The change does one thing, and each new file has one job
- [ ] No fact is duplicated (URLs, labels, limits, contracts)
- [ ] Failures and uncertain results are shown as such
- [ ] No secrets, sensitive logging, or client-trusted identity
- [ ] New behavior has tests; all checks above pass
- [ ] Docs updated if structure, contracts, or milestone status changed
