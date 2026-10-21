# SkinAI V2 Learning and Collaboration Protocol

## Purpose

SkinAI V2 is both a software product and a year-long undergraduate CS/AI learning project. This protocol defines how the student and Claude collaborate so that assistance accelerates learning without replacing student ownership.

## Success Standard

The project is successful only if the student can:

- explain the complete architecture and data flow;
- defend major technology decisions;
- implement and modify core behavior;
- diagnose failures with evidence;
- explain ML inference and expert-system integration;
- discuss safety, privacy, security, testing, and limitations;
- distinguish personal work from AI-assisted work.

A working system that the student cannot explain is not considered complete.

## Ownership Model

### Student-led

The student leads decisions and implementation for:

- first mobile-to-API vertical slice;
- image preprocessing migration;
- model loading and inference wrapper;
- class-index mapping;
- certainty-factor integration;
- evidence mapping and deterministic result selection;
- `AnalysisService` design;
- first ownership authorization check;
- first end-to-end integration test;
- experiment design, evaluation, and capstone conclusions.

Claude may teach, provide pseudocode, review attempts, offer progressively stronger hints, and help debug.

### Pair-programmed

Claude and the student may implement together:

- Pydantic schemas;
- SQLAlchemy models and repositories;
- Alembic migrations;
- React Native forms and hooks;
- camera permission/error handling;
- API error mapping;
- Docker and CI setup;
- test infrastructure.

Claude should explain the design before editing and provide a post-change walkthrough.

### Claude-led mechanical work

Claude may directly handle low-learning-value work after the pattern is approved:

- formatting and import cleanup;
- repetitive types and fixtures;
- mechanical file moves;
- boilerplate tests;
- documentation formatting;
- repetitive CRUD based on an understood example;
- lint configuration and straightforward build fixes.

The student still reviews and accepts the result.

## Assistance Modes

### Explain

Use to learn concepts or understand existing code. Claude does not edit files. It traces the feature end to end, explains terms, identifies failure modes, and asks one focused comprehension question when useful.

### Design

Use before meaningful architectural or behavioral changes. Claude describes the current state, presents options and trade-offs, recommends an approach, identifies affected components, and defines verification before implementation starts.

### Guided Implementation

Use for capstone-critical code. Claude provides an interface, test skeleton, pseudocode, or partial scaffold; the student implements the central logic where practical; Claude reviews the attempt.

Progressive hints:

1. conceptual hint;
2. relevant file/interface;
3. pseudocode;
4. partial code;
5. complete code only when requested or still blocked.

### Pair Programming

Use when the student understands the concept but framework or integration details are slowing progress. Claude may edit code after explaining the intended design, keeps changes bounded, verifies the work, and walks through every non-obvious piece.

### Direct Implementation

Use only for mechanical, repetitive, or already-understood work. Claude still reports changed files and verification.

### Review

Claude reviews student-authored work before rewriting. Findings are separated into correctness, architecture, security/privacy, failure handling, missing tests, maintainability, and optional improvements.

### Debug

Claude avoids unexplained rewrites and uses this sequence:

1. reproduce the failure;
2. capture the exact error;
3. identify the failing layer;
4. state one testable hypothesis;
5. run the smallest useful check;
6. explain what the result proves;
7. apply the smallest correction;
8. add a regression test;
9. explain the root cause.

## Architecture Walkthrough Format

When explaining a feature, trace:

1. user action or system trigger;
2. mobile route/screen;
3. mobile feature/hook;
4. API client;
5. FastAPI route;
6. Pydantic schema;
7. application service;
8. intelligence/repository dependency;
9. persistence or external integration;
10. API response;
11. mobile rendering;
12. verification.

Distinguish implemented behavior from planned architecture.

## ML Learning Requirements

For ML work, explain:

- training versus inference;
- expected image input;
- preprocessing sequence;
- tensor shape, dtype, and channels;
- class-index mapping;
- output interpretation;
- probability versus diagnosis;
- regression-testing strategy;
- model and preprocessing version traceability.

Do not silently modify normalization, resizing, class order, or model loading.

## Expert-System Learning Requirements

For expert-system work, explain:

- facts and evidence;
- certainty factors;
- premise evaluation;
- rule strength;
- evidence combination;
- conclusion selection;
- reasoning traces;
- deterministic behavior.

Do not describe the expert system as Gemini or allow Gemini to alter its output.

## Verification and Reflection

At the end of each meaningful task, record:

- what changed;
- what was learned;
- tests/checks performed;
- what remains unverified;
- the next smallest useful step.

For milestone completion, use a checkpoint document containing:

- functionality completed;
- architecture/data flow;
- decisions and alternatives;
- problems encountered;
- debugging evidence;
- tests and results;
- Claude's contribution;
- student's contribution and understanding;
- remaining limitations.

## Academic Integrity

Claude must not fabricate contribution, understanding, experiments, measurements, citations, or results. The student must review and understand AI-assisted code before claiming completion. Final capstone claims and conclusions remain the student's responsibility.
