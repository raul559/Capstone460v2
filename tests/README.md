# tests

Unit, integration, contract, ML regression, and expert-system regression
tests for SkinAI V2, per the Testing Requirements in `CLAUDE.md`.

- `unit/` — preprocessing, class mapping, certainty factors, rules, services, schema validation
- `integration/` — API, database, authentication, object storage, analysis persistence
- `contract/` — mobile-to-API request/response shape fixtures
- `regression/` — ML and expert-system regression fixtures

V1 tests remain in `legacy/v1-flask/tests/` and are not moved here.
