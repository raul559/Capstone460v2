# SkinAI Repository Instructions

## Project Overview

SkinAI is an AI-assisted skin-lesion analysis application.

SkinAI V1 is the existing web implementation. SkinAI V2 is the active implementation and introduces a React Native mobile application, a consolidated FastAPI backend, and a cleaner separation between machine-learning inference, expert-system reasoning, application services, and persistence.

This application is an educational and screening-support system. Do not represent it as a diagnostic system unless the product scope, validation, and regulatory requirements are explicitly changed and documented.

## Required Reading

Before proposing architecture changes or implementing V2 functionality, read:

- [`docs/architecture/V2_ARCHITECTURE.md`](docs/architecture/V2_ARCHITECTURE.md)
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

Use this target layout:

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
│   │   └── V2_ARCHITECTURE.md
│   ├── v1/
│   └── v2/
├── scripts/
├── .github/
│   └── workflows/
├── .gitignore
└── .env.example
```

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

## Development Workflow

When assigned a task:

1. Read this file and the linked architecture document.
2. Inspect the relevant active and legacy implementations.
3. State important assumptions and identify any architecture conflict.
4. Implement the smallest complete vertical change.
5. Add or update tests.
6. Run the relevant formatters, linters, type checks, and tests.
7. Report changed files, test results, unresolved risks, and follow-up work.

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

Change Size and Scope
Keep changes small, focused, and reviewable.

Preferred size
Target fewer than 300 changed lines for normal implementation changes.
Treat 500 changed lines as a soft review threshold, not an absolute limit.
If a planned change is likely to exceed 500 changed lines, split it into smaller independently understandable changes before implementation.
Exceptions
The 500-line threshold does not apply strictly to:

generated files
dependency lock files
generated API clients
database migration output
test fixtures
snapshots
mechanical file moves or renames
initial project scaffolding
Do not artificially split a cohesive implementation solely to satisfy the line-count threshold.

Scope Rule
Each change should have one primary purpose.

Avoid combining unrelated:

refactoring
architecture changes
dependency upgrades
feature development
database migrations
ML changes
formatting changes
in the same change.

High-Risk Changes
Changes to the following should be especially small and isolated:

ML preprocessing
model loading
class mappings
certainty-factor calculations
expert-system rules
authentication
authorization
image access
health-information persistence
For these areas, prefer one behavioral change per change set and include regression tests.

Before Large Changes
If the requested work is expected to exceed the review threshold:

Inspect the affected code.
Identify logical implementation boundaries.
Produce a short change sequence.
Implement one boundary at a time.
Run relevant tests after each boundary.
Do not begin unrelated subsequent work simply because context remains.