# SkinAI V2 Repository Structure

## Purpose

This document defines the intended repository organization for SkinAI V2 and explains where new code belongs.

This is not a replacement for `docs/architecture/V2_ARCHITECTURE.md`. The architecture document describes the system design and technology decisions. This document describes the physical source-code organization that implements that architecture.

## Documentation Placement

Store this file at:

`docs/architecture/REPOSITORY_STRUCTURE.md`

The recommended documentation hierarchy is:

```text
skinai/
├── CLAUDE.md
├── README.md
└── docs/
    ├── architecture/
    │   ├── V2_ARCHITECTURE.md
    │   ├── REPOSITORY_STRUCTURE.md
    │   └── decisions/
    ├── v1/
    └── v2/
        └── IMPLEMENTATION_PLAN.md
```

Use each document for one purpose:

- `CLAUDE.md`: persistent agent instructions and repository guardrails.
- `README.md`: human entry point, development setup, and common commands.
- `V2_ARCHITECTURE.md`: V2 system design and technology architecture.
- `REPOSITORY_STRUCTURE.md`: source-code ownership, directory structure, and dependency boundaries.
- `IMPLEMENTATION_PLAN.md`: current migration/build sequence and milestone status.
- `docs/architecture/decisions/`: architecture decision records for important choices and reversals.

Do not create a second generic handoff document containing copies of these documents. A future handoff should reference these sources and contain only current-state information that changes frequently.

---

# Target Repository

```text
skinai/
│
├── CLAUDE.md
├── README.md
├── .gitignore
├── .env.example
│
├── apps/
│   ├── mobile/
│   │   ├── src/
│   │   │   ├── app/                   # Expo Router routes (src-relative root, see tsconfig "@/*")
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── login.tsx
│   │   │   │   │   └── register.tsx
│   │   │   │   ├── (tabs)/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── scan.tsx
│   │   │   │   │   ├── history.tsx
│   │   │   │   │   └── profile.tsx
│   │   │   │   └── analysis/
│   │   │   │       ├── new.tsx
│   │   │   │       └── [analysisId].tsx
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── camera/
│   │   │   │   ├── intake/
│   │   │   │   ├── analysis/
│   │   │   │   ├── history/
│   │   │   │   └── assistant/
│   │   │   ├── hooks/
│   │   │   ├── providers/
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   ├── assets/
│   │   ├── __tests__/
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web-v1/
│       ├── README.md
│       └── ...
│
├── services/
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   │   ├── dependencies.py
│       │   │   └── routes/
│       │   │       ├── health.py
│       │   │       ├── analyses.py
│       │   │       ├── reports.py
│       │   │       ├── conversations.py
│       │   │       └── users.py
│       │   ├── schemas/
│       │   │   ├── analysis.py
│       │   │   ├── intake.py
│       │   │   ├── prediction.py
│       │   │   ├── report.py
│       │   │   ├── conversation.py
│       │   │   └── common.py
│       │   ├── services/
│       │   │   ├── analysis_service.py
│       │   │   ├── report_service.py
│       │   │   ├── assistant_service.py
│       │   │   └── storage_service.py
│       │   ├── repositories/
│       │   │   ├── analysis_repository.py
│       │   │   ├── prediction_repository.py
│       │   │   ├── user_repository.py
│       │   │   ├── report_repository.py
│       │   │   └── conversation_repository.py
│       │   ├── db/
│       │   │   ├── base.py
│       │   │   ├── session.py
│       │   │   └── models/
│       │   │       ├── user.py
│       │   │       ├── analysis.py
│       │   │       ├── intake.py
│       │   │       ├── prediction.py
│       │   │       ├── expert_result.py
│       │   │       ├── report.py
│       │   │       ├── conversation.py
│       │   │       └── conversation_message.py
│       │   ├── core/
│       │   │   ├── config.py
│       │   │   ├── security.py
│       │   │   ├── logging.py
│       │   │   ├── exceptions.py
│       │   │   └── constants.py
│       │   └── integrations/
│       │       ├── identity/
│       │       ├── storage/
│       │       └── assistant/
│       ├── migrations/
│       │   └── versions/
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       ├── Dockerfile
│       ├── alembic.ini
│       └── pyproject.toml
│
├── intelligence/
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── predictor.py
│   │   ├── preprocessing.py
│   │   ├── labels.py
│   │   ├── model_registry.py
│   │   ├── types.py
│   │   └── exceptions.py
│   └── expert/
│       ├── __init__.py
│       ├── engine.py
│       ├── evaluator.py
│       ├── certainty_factors.py
│       ├── rules.py
│       ├── evidence.py
│       ├── types.py
│       └── exceptions.py
│
├── models/
│   ├── README.md
│   └── manifest.json
│
├── legacy/
│   ├── README.md
│   ├── v1-node/
│   │   ├── README.md
│   │   └── ...
│   └── v1-flask/
│       ├── README.md
│       └── ...
│
├── tests/
│   ├── contract/
│   ├── regression/
│   │   ├── ml/
│   │   └── expert/
│   ├── e2e/
│   └── fixtures/
│       ├── images/
│       └── analyses/
│
├── docs/
│   ├── architecture/
│   │   ├── V2_ARCHITECTURE.md
│   │   ├── REPOSITORY_STRUCTURE.md
│   │   └── decisions/
│   ├── v1/
│   └── v2/
│       ├── IMPLEMENTATION_PLAN.md
│       ├── API.md
│       ├── DEVELOPMENT.md
│       └── DEMO.md
│
├── scripts/
│   ├── setup/
│   ├── development/
│   ├── testing/
│   └── models/
│
└── .github/
    ├── workflows/
    │   ├── mobile-ci.yml
    │   ├── api-ci.yml
    │   └── regression-tests.yml
    └── pull_request_template.md
```

---

# Directory Responsibilities

## `apps/mobile/`

The active SkinAI V2 mobile client.

Responsibilities:

- Native mobile presentation and navigation
- Camera and image-selection UX
- Intake forms
- API communication
- Authentication interaction
- Analysis result presentation
- History/report presentation
- Assistant/chat UX

Do not place server authorization, ML inference, expert-system rules, database credentials, or provider secrets here.

### `apps/mobile/src/app/`

Contains route and screen composition (Expo Router, resolved relative to
`src/` per `tsconfig.json`'s `@/*` path mapping). Keep route files relatively
thin.

### `apps/mobile/src/features/`

Contains feature-oriented mobile behavior. Prefer feature ownership over a large global collection of unrelated components.

### `apps/mobile/src/api/`

Contains the centralized client for communicating with `/api/v2`. Individual feature components should not scatter raw HTTP behavior throughout the application.

---

## `apps/web-v1/`

The original V1 React web application.

Purpose:

- Migration reference
- Behavioral comparison
- Historical implementation

Do not add V2 features here.

---

## `services/api/`

The active FastAPI application and external backend boundary.

Responsibilities:

- HTTP routes
- Request/response validation
- Authentication dependencies
- Authorization enforcement
- Application-service orchestration
- Persistence access
- External provider adapters

FastAPI route handlers should remain thin. They should delegate domain/application behavior rather than implement ML or expert-system logic directly.

### `app/api/routes/`

HTTP resource endpoints such as analyses, reports, users, conversations, and health checks.

### `app/schemas/`

Pydantic API request/response contracts. API schemas are not database models.

### `app/services/`

Coordinates application workflows. `analysis_service.py` is expected to coordinate storage, inference, expert evaluation, persistence, and response assembly.

### `app/repositories/`

Persistence boundary between application services and database access.

### `app/db/models/`

SQLAlchemy persistence models.

### `app/integrations/`

Provider-specific adapters for identity, object storage, and generative-AI providers. Provider SDK details should not be scattered through routes or domain code.

---

## `intelligence/`

The source-of-truth analysis logic. This is the most important boundary to keep independent from the API framework.

The intelligence layer must not depend on React Native and should not require FastAPI in order to execute its unit/regression tests.

### `intelligence/ml/`

Responsibilities:

- Model loading
- Image preprocessing
- Exact class ordering
- Inference
- Prediction types
- Model version selection

`preprocessing.py` and `labels.py` are behavior-sensitive. Changes require regression testing and explicit version consideration.

### `intelligence/expert/`

Responsibilities:

- Certainty-factor math
- Evidence representation
- Rule definitions
- Rule execution
- Deterministic risk evaluation
- Reasoning trace

The expert system consumes model predictions and intake evidence. It should not manipulate TensorFlow internals or call generative AI.

---

## `models/`

Contains model metadata, manifests, checksums, and retrieval documentation.

Do not store large trained model binaries in ordinary Git history. The actual artifact should use the repository's approved artifact-storage or Git LFS strategy.

---

## `legacy/`

Historical V1 server implementations.

- `legacy/v1-node/`: original Node/Express server.
- `legacy/v1-flask/`: original Flask/Python backend and related implementation.

These directories exist so V2 behavior can be checked against V1 during migration. Treat them as read-only unless a task explicitly targets V1.

Each legacy directory should contain a README stating that V2 work belongs elsewhere.

---

## `tests/`

Contains cross-system tests that do not belong solely to the mobile or API project.

### `tests/contract/`

Verifies stable client/API contracts.

### `tests/regression/ml/`

Protects model preprocessing, class ordering, model loading, output shape, and expected prediction behavior.

### `tests/regression/expert/`

Protects certainty-factor math, evidence mapping, rule execution, risk selection, and reasoning behavior.

### `tests/e2e/`

End-to-end workflows across multiple system boundaries.

### `tests/fixtures/`

Controlled, authorized, non-sensitive test inputs and expected outputs. Do not place real patient medical images or unnecessary personal information in fixtures.

---

## `docs/`

Durable project knowledge.

### `docs/architecture/`

Stable system design and architecture rules.

### `docs/architecture/decisions/`

Architecture Decision Records. Use these to record important choices such as mobile framework, backend framework, persistence technology, inference placement, or later reversals.

### `docs/v1/`

V1 documentation used during migration.

### `docs/v2/`

Implementation-facing V2 documents including current implementation plan, API notes, development instructions, and demo guidance.

---

## `scripts/`

Repository automation only. Organize scripts by purpose rather than using this directory as miscellaneous source-code storage.

---

## `.github/`

Repository governance, CI workflows, and pull-request templates.

CI should evolve with the codebase rather than creating inactive workflows for unimplemented subsystems.

---

# Dependency Direction

The intended dependency flow is:

```text
apps/mobile
    |
    | HTTPS
    v
services/api
    |
    v
application services
    |
    +-------------------+
    |                   |
    v                   v
intelligence        repositories
    |                   |
 +--+--+                v
 |     |             PostgreSQL
 v     v
 ML  Expert
```

Provider integrations are called through application/infrastructure abstractions:

```text
application services
        |
        +--> identity integration
        +--> object-storage integration
        +--> assistant integration
```

Forbidden coupling examples:

- `intelligence/ml` importing FastAPI route code.
- `intelligence/expert` directly querying PostgreSQL.
- Database models being used as the public mobile API contract.
- React Native making authorization decisions trusted by the server.
- Gemini directly changing deterministic expert-system conclusions.
- Expert-system rules depending on Gemini-generated output.

---

# Where New Code Goes

Use this decision rule:

**Mobile user interaction?**

`apps/mobile/`

**HTTP/API orchestration, authentication, persistence, provider integration?**

`services/api/`

**Skin-image prediction or preprocessing?**

`intelligence/ml/`

**Certainty-factor math or deterministic risk reasoning?**

`intelligence/expert/`

**V1 historical implementation?**

`apps/web-v1/` or `legacy/`

**Cross-system verification?**

`tests/`

**Architecture or implementation documentation?**

`docs/`

**Model metadata/artifact manifest?**

`models/`

---

# Initial Repository Scaffold

Do not generate every directory and placeholder file from the target structure on day one.

Start with:

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
│   └── regression/
├── docs/
│   ├── architecture/
│   │   ├── V2_ARCHITECTURE.md
│   │   └── REPOSITORY_STRUCTURE.md
│   ├── v1/
│   └── v2/
│       └── IMPLEMENTATION_PLAN.md
├── .github/
│   └── workflows/
├── .gitignore
└── .env.example
```

Create deeper directories when the corresponding functionality is implemented.

---

# V1 to V2 Migration Rule

V2 is not a mutation of the V1 folders.

The migration pattern is:

```text
V1 reference
    |
    | inspect behavior
    v
regression tests
    |
    v
V2 implementation
    |
    v
compare results
```

For ML preprocessing, label order, certainty-factor calculations, expert rules, and deterministic analysis selection, preserve existing intended behavior with regression tests before refactoring.

---

# Repository Governance

Keep changes focused and reviewable.

- One change should have one primary purpose.
- Prefer smaller reviewable changes over large mixed refactors.
- Treat approximately 500 changed lines as a soft review threshold rather than an absolute restriction.
- Generated files, lockfiles, migrations, fixtures, mechanical moves, and initial scaffolding may justify larger diffs.
- Separate behavioral ML/expert changes from architectural refactors whenever practical.
- Never weaken tests merely to make a refactor pass.

---

# Final Mental Model

The repository structure should make the runtime architecture visible:

```text
apps/mobile
    = user experience

services/api
    = API and orchestration

intelligence/ml
    = prediction

intelligence/expert
    = deterministic reasoning

repositories + db
    = structured persistence

integrations/storage
    = image/object persistence

integrations/assistant
    = generative explanation

legacy
    = V1 migration reference

tests
    = behavioral protection

docs
    = durable design knowledge
```

The repository is successful when a developer or coding agent can look at a piece of functionality, determine its responsibility, and identify one obvious place where that functionality belongs.
