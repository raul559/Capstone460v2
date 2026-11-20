# tests

Cross-system tests for SkinAI V2: tests that span more than one project or
protect shared behavior. See the `tests/` section of
`docs/architecture/REPOSITORY_STRUCTURE.md`.

- `contract/`: mobile-to-API request and response shapes
- `regression/`: ML and expert-system regression fixtures and tests
- `e2e/` and `fixtures/`: added when end-to-end tests exist

Tests for a single project live inside it: `apps/mobile/__tests__/` for the
mobile app and `services/api/tests/` for the API. V1 tests remain in
`legacy/v1-flask/tests/`.
