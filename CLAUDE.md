# SkinAI Repository Instructions

## Project Overview

SkinAI is an AI-assisted skin-lesion analysis application.

SkinAI V1 is the existing web implementation. SkinAI V2 is the active implementation and introduces a React Native mobile application, a consolidated FastAPI backend, and a cleaner separation between machine-learning inference, expert-system reasoning, application services, and persistence.

This application is an educational and screening-support system. Do not represent it as a diagnostic system unless the product scope, validation, and regulatory requirements are explicitly changed and documented.

## Project Context

SkinAI V2 is a year-long undergraduate Computer Science and AI capstone. The student is the primary engineer and must be able to explain, modify, debug, test, and defend the implementation.

Claude acts as a technical mentor, reviewer, pair programmer, and implementation assistant. Optimize for student understanding and ownership, not maximum code-generation speed. See [`docs/v2/LEARNING_AND_COLLABORATION.md`](docs/v2/LEARNING_AND_COLLABORATION.md) for the full ownership model and assistance-mode definitions.

## Required Reading

Before proposing architecture changes or implementing V2 functionality, read:

- [`docs/architecture/V2_ARCHITECTURE.md`](docs/architecture/V2_ARCHITECTURE.md) — system design and technology decisions
- [`docs/architecture/REPOSITORY_STRUCTURE.md`](docs/architecture/REPOSITORY_STRUCTURE.md) — the full target directory tree, directory responsibilities, and dependency-direction rules (this file's own Repository Structure section below is a summary, not a replacement)
- [`docs/v2/IMPLEMENTATION_PLAN.md`](docs/v2/IMPLEMENTATION_PLAN.md) — current milestone status; check it before assuming what is or isn't built yet
- [`docs/v2/LEARNING_AND_COLLABORATION.md`](docs/v2/LEARNING_AND_COLLABORATION.md) — ownership model and assistance modes for this capstone
- [`README.md`](README.md)

When working on a migrated V1 capability, inspect the corresponding V1 implementation before modifying behavior.

If this file and the detailed architecture document appear inconsistent, stop and identify the conflict before making a breaking architectural change.

## Active V2 Directories

Active V2 development belongs in:

- `apps/mobile/` — React Native, Expo, and TypeScript mobile application
- `services/api/` — Python and FastAPI application
- `intelligence/ml/` — model loading, image preprocessing, inference, labels, and model-version handling
- `intelligence/expert/` — certainty-factor engine, rules, and deterministic risk reasoning
- `tests/` — unit, integration, contract, ML regression, and expert-system regression tests
- `docs/v2/` — V2-specific implementation and product documentation
- `docs/architecture/` — architecture decisions and system design

## Legacy V1 Directories

The following directories contain SkinAI V1 and are retained for migration, behavioral reference, and regression analysis:

- `apps/web-v1/`
- `legacy/v1-node/`
- `legacy/v1-flask/`
- `docs/v1/`

Treat V1 directories as read-only unless a task explicitly requires a V1 correction.

Do not add V2 features to the legacy Node, Flask, or React web applications.

Do not copy legacy code into V2 without reviewing security, architecture, test coverage, and compatibility.

## Capstone Assistance Modes

Use one of these modes for each substantial task; see `docs/v2/LEARNING_AND_COLLABORATION.md` for the full definitions:

- **Explain**: explain concepts and trace code without editing.
- **Design**: compare options, define boundaries, and plan before coding.
- **Guided Implementation**: provide progressive hints and let the student implement core logic.
- **Pair Programming**: implement together after explaining the design.
- **Direct Implementation**: use for mechanical or already-understood work.
- **Review**: assess student-authored code before rewriting it.
- **Debug**: diagnose from evidence and apply the smallest justified correction.

For capstone-critical work (see below), default to Guided Implementation unless the student explicitly requests another mode.

## Target V2 Stack

### Mobile

- React Native
- Expo
- TypeScript
- Expo Router
- TanStack Query for server state
- React Hook Form with Zod for form validation
- Expo Camera and Expo Image Picker
- Expo SecureStore for authentication tokens and small sensitive values

### API

- Python 3.12 or later
- FastAPI
- Pydantic
- SQLAlchemy 2.x
- Alembic
- pytest

### Data and Storage

- PostgreSQL for structured application data
- Private object storage for lesion images
- Redis only if caching, rate limiting, temporary state, or queued processing is justified by a measured requirement

### Intelligence

- Existing TensorFlow/Keras ResNet50 initially
- Existing Python certainty-factor expert system
- Server-side inference for the V2 MVP
- Gemini behind an `AssistantService` abstraction
- FAISS only where similarity search delivers a defined V2 capability

### Architecture Style

Use a modular monolith.

Do not introduce microservices, Kubernetes, message queues, independent inference services, or on-device inference without a documented and measured requirement.

## Core Architecture Boundary

The intended analysis flow is:

```text
Image and intake
  -> image validation and preprocessing
  -> ML inference
  -> structured class probabilities
  -> expert-system evaluation
  -> deterministic risk assessment
  -> optional LLM-generated explanation
```

Maintain clear boundaries between:

1. Image preprocessing
2. ML inference
3. Expert-system reasoning
4. Deterministic risk assessment
5. LLM-generated explanation
6. API transport
7. Persistence

FastAPI route handlers must remain thin. Business logic belongs in application services or domain modules.

In short: mobile captures and presents; FastAPI validates and coordinates; ResNet predicts; the expert system reasons; PostgreSQL stores structured state; object storage holds image objects; Gemini explains and does not determine or override risk.

## Capstone-Critical Work

Capstone-critical components include:

- mobile-to-API communication
- image capture and upload
- API contracts
- image preprocessing
- model loading and inference
- class-index mappings
- certainty-factor calculations
- expert-system evidence and rules
- deterministic risk selection
- `AnalysisService` orchestration
- authentication and authorization
- persistence design
- integration and regression testing

For these areas:

1. Explain the concept and system flow first.
2. Identify affected files and boundaries.
3. Define success criteria and verification.
4. Use progressive hints before complete code where practical.
5. Do not make silent behavioral or architectural changes.
6. Finish with an implementation walkthrough (see Capstone Acceptance Gate below).

### Prove, then automate

For a new pattern, the student should implement or closely pair on the first representative example. After the pattern is understood and tested, Claude may automate similar repetitive work — e.g. the student leads the first FastAPI endpoint and the first expert-system rule with its regression test; Claude may handle similar endpoints or additional approved rules directly after review.

## Safety-Critical Rules

- The LLM must not generate, determine, override, or modify the final risk classification.
- The LLM may explain a structured deterministic result and support follow-up conversation.
- Do not describe LLM output as expert-system reasoning.
- Do not describe model output as a confirmed diagnosis.
- Preserve uncertainty and escalation guidance in user-facing results.
- Failed validation, low-quality images, model failures, and uncertain results must not be presented as successful low-risk analyses.
- Do not silently substitute missing intake fields with clinically meaningful values.

## ML and Expert-System Rules

Before modifying ML preprocessing, class mappings, model loading, certainty-factor calculations, or expert rules:

1. Inspect the corresponding V1 behavior.
2. Add or update regression tests.
3. Document whether the change preserves or intentionally changes behavior.
4. Update the relevant version identifier.

Every completed analysis must be traceable to:

- Model version
- Rule-set version
- Preprocessing version
- Top predictions and probabilities
- Intake evidence used
- Expert-system result
- Analysis timestamp

Do not commit large model binaries directly to normal Git history. Keep a model manifest and use an approved artifact-storage or Git LFS strategy.

Do not change normalization, channel ordering, dimensions, dtype, class order, or certainty-factor math as a cleanup task — these are behavior-sensitive and require the inspect/test/document/version sequence above, even for a seemingly cosmetic edit.

## Security and Privacy Rules

- Never commit passwords, tokens, connection strings, API keys, signing keys, or service credentials.
- Keep real secrets out of `.env.example`.
- Never place backend secrets in the mobile application bundle.
- Store mobile authentication tokens only in an OS-backed secure store.
- Enforce authentication, record ownership, and role authorization on the server.
- Do not trust a role, user identifier, analysis owner, or authorization decision provided only by the mobile client.
- Store lesion images in private object storage.
- Do not produce public image URLs.
- Use short-lived authorized access where image retrieval is required.
- Do not log tokens, raw lesion images, complete medical histories, or unnecessary personally identifiable information.
- Validate file type, file size, image dimensions, and image decodability before inference.
- Avoid returning internal stack traces, file-system paths, credentials, or implementation details in API responses.

## Repository Structure

Current top-level layout:

```text
skinai/
├── CLAUDE.md
├── README.md
├── apps/
│   ├── mobile/
│   └── web-v1/
├── services/
│   └── api/
├── intelligence/
│   ├── ml/
│   └── expert/
├── legacy/
│   ├── v1-node/
│   └── v1-flask/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── regression/
├── docs/
│   ├── architecture/
│   │   ├── V2_ARCHITECTURE.md
│   │   └── REPOSITORY_STRUCTURE.md
│   ├── v1/
│   └── v2/
├── scripts/
├── .gitignore
└── .env.example
```

`models/` (model metadata, manifests, checksums — not large binaries) is
planned per `docs/architecture/REPOSITORY_STRUCTURE.md` but not yet created;
add it when ML model migration (Milestone 2) actually needs it, not before.

This is a summary for quick orientation. For the full target tree, per-directory
responsibilities, and the dependency-direction rules between layers, see
`docs/architecture/REPOSITORY_STRUCTURE.md` — that document is the source of
truth for directory structure. If this summary and that document ever
disagree, `REPOSITORY_STRUCTURE.md` wins; fix this summary to match it rather
than the other way around.

Do not create new top-level directories when an existing domain-aligned location fits the work.

## API Conventions

- Use the `/api/v2` prefix for V2 endpoints.
- Use Pydantic models for external request and response contracts.
- Use UUIDs for externally visible resource identifiers.
- Validate all client input server-side.
- Use consistent structured error responses.
- Keep database and storage implementation details out of API contracts.
- Maintain explicit analysis states such as `pending`, `processing`, `completed`, `failed`, and `deleted` where applicable.
- Do not expose ORM entities directly from route handlers.

## Mobile Conventions

- Use TypeScript for all new mobile code.
- Keep screens focused on composition and navigation.
- Put business workflows in feature modules, hooks, or services.
- Use a centralized typed API client.
- Handle loading, empty, permission-denied, validation, offline, timeout, retry, and server-failure states.
- Do not persist complete reports, medical histories, lesion images, or sensitive analysis payloads in ordinary unencrypted device storage.
- Test camera, permission, and upload behavior on physical iOS and Android devices before considering the workflow complete.

## Testing Requirements

Every behavior change should include tests appropriate to the affected layer.

Required test categories include:

- Unit tests for preprocessing, class mapping, certainty factors, rules, services, and schema validation
- Integration tests for API, database, authentication, object storage, analysis persistence, and deletion
- Contract tests for mobile-to-API request and response shapes
- ML regression tests against controlled fixtures
- Expert-system regression tests for known evidence combinations
- Authorization tests proving users cannot access analyses belonging to other users

Do not modify or delete tests merely to make a failing implementation pass. If a test is obsolete, explain the intended behavior change and update the related documentation.

No task is complete because code was generated. Use the checks appropriate to the layer (unit, integration, contract, ML regression, expert-system regression, TypeScript type checks, linting, builds, manual mobile workflow verification), and report what passed, what was not tested, and any remaining uncertainty — do not report a task as done while silently omitting untested parts.

## Capstone Acceptance Gate

Claude-generated code is not complete until the student can explain:

1. why it belongs in its current layer;
2. what calls it;
3. what it calls;
4. its input and output contracts;
5. its important control flow;
6. its failure behavior;
7. its security or privacy implications;
8. how correctness is verified.

After non-trivial implementation, provide a walkthrough using these eight points.

## Development Workflow

When assigned a task:

1. Read this file and the linked architecture document.
2. Inspect the relevant active and legacy implementations.
3. State important assumptions and identify any architecture conflict.
4. For non-trivial code, lay out before implementing: the **problem** (behavior being added or corrected), the **current flow**, the **proposed flow**, **affected files**, **key decisions** the student must understand, and **verification**. Do not implement an entire milestone in one unexplained operation.
5. Implement the smallest complete vertical change.
6. Add or update tests.
7. Run the relevant formatters, linters, type checks, and tests.
8. Report: what was **implemented**, the **student takeaway**, **verification performed**, **remaining risks**, and the **next bounded step**.

Do not perform broad unrelated refactors while implementing a focused feature.

Prefer small, reviewable commits and changes that preserve a working system.

## Documentation Rules

Update documentation when changing:

- Architecture boundaries
- API contracts
- Data models
- Model preprocessing
- Class mappings
- Expert-system rules
- Model or rule-set versioning
- Security-sensitive behavior
- Setup or development commands

Place architecture decision records under `docs/architecture/decisions/` when a meaningful architecture choice is made or reversed.

### Keep planning docs current every revision

A revision that changes repository structure or completes a milestone step
without updating the docs that describe that state is incomplete, not done:

- If a directory is added, removed, or repurposed, update
  `docs/architecture/REPOSITORY_STRUCTURE.md`'s target tree and this file's
  Repository Structure summary in the same change.
- If a Milestone 1-8 step in `docs/v2/IMPLEMENTATION_PLAN.md` is completed,
  check its box and update that milestone's Status line in the same change.
- Before writing a new planning or architecture doc, check whether an
  existing one (`V2_ARCHITECTURE.md`, `REPOSITORY_STRUCTURE.md`,
  `IMPLEMENTATION_PLAN.md`) already owns that content, and extend it instead
  of creating a parallel document that will drift.
- A new doc must state its own correct file path in its first section if
  that isn't obvious from context, and must actually be saved at that path —
  do not write placement instructions for a file and then put the file
  somewhere else.

## Commands

Project commands must be documented in `README.md` after the mobile and API projects are initialized.

Before using a command, inspect the relevant `package.json`, `pyproject.toml`, task runner, or project documentation. Do not invent commands that are not configured in the repository.

## Prohibited Changes Without Explicit Approval

Do not independently:

- Replace FastAPI with another backend framework
- Replace PostgreSQL with MongoDB
- Replace the trained model
- Change the seven-class label ordering
- Change image preprocessing
- Rewrite the certainty-factor algorithm
- Move inference onto the mobile device
- Add microservices or distributed queues
- Change the application's diagnostic or regulatory claims
- Introduce storage of additional health information
- Make uploaded images publicly accessible
- Remove or weaken security, privacy, regression, or authorization tests

If a task appears to require one of these changes, present the reason, impact, migration requirement, and safer alternatives before implementation.

## Definition of a Good Change

A good change:

- Fits the documented V2 architecture
- Preserves clear boundaries
- Includes appropriate tests
- Does not weaken privacy or authorization
- Is traceable and version-aware
- Avoids unnecessary infrastructure
- Handles failure states explicitly
- Leaves the repository easier to understand

## Change Size and Scope

Keep changes small, focused, and reviewable.

### Preferred size

- Target fewer than 300 changed lines for normal implementation changes.
- Treat 500 changed lines as a soft review threshold, not an absolute limit.
- If a planned change is likely to exceed 500 changed lines, split it into smaller independently understandable changes before implementation.

### Exceptions

The 500-line threshold does not apply strictly to:

- generated files
- dependency lock files
- generated API clients
- database migration output
- test fixtures
- snapshots
- mechanical file moves or renames
- initial project scaffolding

Do not artificially split a cohesive implementation solely to satisfy the line-count threshold.

### Scope Rule

Each change should have one primary purpose.

Avoid combining unrelated:

- refactoring
- architecture changes
- dependency upgrades
- feature development
- database migrations
- ML changes
- formatting changes

in the same change.

### High-Risk Changes

Changes to the following should be especially small and isolated:

- ML preprocessing
- model loading
- class mappings
- certainty-factor calculations
- expert-system rules
- authentication
- authorization
- image access
- health-information persistence

For these areas, prefer one behavioral change per change set and include regression tests.

### Before Large Changes

If the requested work is expected to exceed the review threshold:

1. Inspect the affected code.
2. Identify logical implementation boundaries.
3. Produce a short change sequence.
4. Implement one boundary at a time.
5. Run relevant tests after each boundary.
6. Do not begin unrelated subsequent work simply because context remains.

## Academic Integrity

Do not fabricate student understanding, implementation history, experiments, measurements, citations, test results, or individual contribution. Generated code must be reviewed, understood, tested, and accepted by the student before being treated as completed capstone work.