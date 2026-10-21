# SkinAI V2 Implementation Plan

**Current objective:** build SkinAI V2 incrementally while preserving
student understanding, testability, and V1 behavioral reference.

> Update the "Current State" section and each milestone's Status line
> whenever a revision changes repository structure or completes a milestone
> step, per `CLAUDE.md`'s Documentation Rules. This file goes stale the
> moment it stops matching the repository — check it against reality before
> trusting it.

## Current State

SkinAI V1 is complete and retained as reference under `legacy/v1-flask/`,
`legacy/v1-node/`, and `apps/web-v1/`.

V2 development is beginning. Milestone 1 is partially complete:

- Done: V2 repository structure, V1 imported as legacy reference, `CLAUDE.md`,
  `docs/architecture/V2_ARCHITECTURE.md`, `docs/architecture/REPOSITORY_STRUCTURE.md`.
- Done (pre-existing): `apps/mobile/` is an initialized Expo + TypeScript
  application (Expo Router, `src/app/` routes) — not yet wired to any backend.
- Not started: Python environment for `services/api/`, FastAPI application,
  V2 test infrastructure beyond the placeholder directories in `tests/`.

V1 provides reusable implementations for:

- ResNet50 inference
- image preprocessing
- class mappings
- certainty-factor engine
- expert-system rules
- analysis pipeline
- Gemini integration
- FAISS similarity search

V2 must migrate capabilities incrementally rather than rewrite working
intelligence without behavioral tests.

## Target MVP

The first V2 vertical slice is:

```text
React Native → FastAPI → existing image preprocessing → existing ResNet50 model
  → existing expert system → structured JSON result → mobile result screen
```

The following are **not** required for the first vertical slice:

- PostgreSQL persistence
- production authentication
- Gemini assistant
- FAISS similarity
- push notifications
- clinician dashboard
- asynchronous processing
- Redis
- job queues

## Milestone 1 — Repository Foundation

**Status: in progress**

- [x] Create V2 repository structure
- [x] Import V1 as legacy/reference code
- [x] Add CLAUDE.md
- [x] Add architecture documentation
- [ ] Configure Python environment
- [x] Initialize Expo TypeScript application (pre-existing)
- [ ] Initialize FastAPI application
- [ ] Configure test infrastructure

Definition of Done:

- [ ] Expo application runs
- [ ] FastAPI starts locally
- [ ] FastAPI health endpoint responds
- [x] V1 remains unchanged
- [ ] unit test commands run successfully (no V2 unit tests exist yet)

Student focus: understand repository boundaries, local development
processes, and the first FastAPI request.

## Milestone 2 — Intelligence Migration

**Status: not started**

- [ ] Locate V1 image preprocessing
- [ ] Create regression fixtures
- [ ] Port preprocessing into `intelligence/ml`
- [ ] Port model loading
- [ ] Port prediction logic
- [ ] Preserve seven-class ordering
- [ ] Port certainty-factor calculations
- [ ] Port expert rules
- [ ] Port deterministic analysis pipeline

Definition of Done: known test inputs produce expected V1-equivalent results
within documented tolerances.

Student focus: personally explain and implement/reconstruct the
behavior-sensitive core — preprocessing, class ordering, certainty-factor
math, and rule evaluation — rather than having it ported wholesale.

## Milestone 3 — Analysis API

**Status: not started**

Implement `POST /api/v2/analyses`.

Flow: `request → validation → image preprocessing → ML inference → expert-system evaluation → AnalysisResponse`

Do not introduce persistence yet unless required.

Definition of Done: a test image and intake payload can travel through the
entire backend and return a typed analysis result.

Student focus: understand how the route, schema, service, intelligence
layer, and response boundaries connect.

## Milestone 4 — Mobile Vertical Slice

**Status: not started**

Build:

- home screen
- new-analysis screen
- image selection/capture
- intake form
- analysis submission
- loading state
- result screen
- error state

Connect the real mobile application to the real FastAPI analysis endpoint.

Definition of Done: phone → image → intake → FastAPI → ResNet50 → expert
system → result → phone works end-to-end.

Student focus: implement and be able to explain the full mobile-to-backend
flow, not just assemble screens around a working API call.

## Milestone 5 — Persistence

**Status: not started**

Add:

- PostgreSQL
- SQLAlchemy
- Alembic
- Analysis records
- Intake records
- Predictions
- Expert results
- Object storage integration

Definition of Done: completed analyses can be retrieved after application
restart.

## Milestone 6 — Identity and Authorization

**Status: not started**

Add the selected managed identity provider.

Implement server-side:

- authentication
- analysis ownership
- authorization
- user history isolation

Definition of Done: User A cannot access User B's analysis.

## Milestone 7 — AI Explanation

**Status: not started**

Add `AssistantService`.

Flow: `deterministic result → structured assistant context → Gemini → explanation`

Gemini must remain downstream of deterministic decisioning.

## Milestone 8 — Demo Candidate

**Status: not started**

Polish:

- camera experience
- validation
- loading states
- failures/retries
- history
- analysis detail screen
- technical reasoning view
- presentation demo mode
- prepared non-identifying demo fixtures

## Deferred Until Measured Need

Do not implement without demonstrated need:

- Redis
- background queue
- independent inference service
- Kubernetes
- microservices
- on-device inference
- dedicated vector database

FAISS should be migrated only after the primary V2 analysis workflow is
working.

## Completion Standard

A milestone is complete only when functionality, student understanding,
verification, documentation, and known limitations are all recorded —
checking every box in a milestone's task list without the corresponding
understanding and verification does not count as done. See
`docs/v2/LEARNING_AND_COLLABORATION.md` for the checkpoint-document format
to use when closing out a milestone.
