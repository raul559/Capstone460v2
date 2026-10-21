# SkinAI V2 Mobile Application Architecture Brief

## Purpose

Use this document as the architecture and implementation context for an AI coding agent working on **SkinAI V2**.

SkinAI V1 is a web application. SkinAI V2 will introduce a native mobile application while preserving and improving the existing machine-learning and expert-system capabilities.

The implementation should prioritize:

- A practical architecture for a small development team
- Reuse of the existing Python ML and expert-system logic
- A strong mobile camera and image-upload experience
- Clear separation between ML classification, expert reasoning, and LLM-generated explanations
- Secure handling of authentication, skin images, intake information, and reports
- An architecture that can evolve without premature microservices

---

## Existing V1 Architecture

### Frontend

- React 19
- Vite
- React Router
- JavaScript and JSX
- Browser `localStorage` for session, intake drafts, reports, and recent analysis data
- Client-side PDF generation with jsPDF

### Backend

V1 uses two backend servers:

1. **Node.js / Express**
   - User registration and login
   - Password hashing
   - Image storage
   - SPA hosting
   - Lightweight chatbot route

2. **Python / Flask**
   - ML inference
   - Expert-system reasoning
   - Full Gemini chatbot
   - Analysis reports
   - Health information
   - FAISS image-similarity search

### Intelligence Pipeline

The existing analysis pipeline combines:

1. A fine-tuned Keras ResNet50 model trained against seven HAM10000 lesion categories
2. A MYCIN-style certainty-factor expert system
3. Patient intake signals such as rapid change, bleeding, itching, and pain
4. A Gemini assistant that explains the analysis and supports follow-up conversation

The existing model file is approximately 217 MB and accepts 224 x 224 RGB images.

### Important Existing Boundary

The existing Python function `run_expert_pipeline()` is the primary reusable domain boundary. It accepts image bytes and intake fields and returns structured ML predictions, expert-system reasoning, risk assessment, and explanation data.

Preserve and refactor this capability rather than rewriting it without a concrete reason.

---

## Recommended V2 Technology Stack

### Mobile Application

- **React Native**
- **Expo**
- **TypeScript**
- **Expo Router**
- **TanStack Query** for server-state management
- **React Hook Form** with a schema validator such as Zod
- **Expo Camera** for image capture
- **Expo Image Picker** for selecting an existing image
- **Expo SecureStore** for authentication tokens and small sensitive values

### Backend

- **Python 3.12 or later**
- **FastAPI**
- **Pydantic** for request and response contracts
- **SQLAlchemy 2.x**
- **Alembic** for database migrations
- A production ASGI server configuration

### Data and Storage

Preferred production-oriented design:

- **PostgreSQL** for structured application data
- **Object storage** for uploaded skin images
  - Amazon S3, Azure Blob Storage, or Google Cloud Storage
- **Redis** only when needed for caching, rate limits, temporary conversation state, or task queues

Acceptable prototype alternative:

- MongoDB Atlas may remain in use for an early V2 prototype if minimizing migration effort is the overriding constraint.
- Do not store security-sensitive configuration or mobile application secrets in MongoDB documents.
- Prefer object storage over storing raw image binaries directly in ordinary database records.

### Machine Learning and Reasoning

- Keep TensorFlow/Keras and the existing ResNet50 model for the first V2 release
- Keep inference server-side initially
- Preserve the certainty-factor expert system
- Keep FAISS initially for optional image-similarity search
- Add explicit model and rule-set version tracking to every analysis

### AI Assistant

- Retain Gemini initially if it is already integrated and working
- Place the provider behind an `AssistantService` interface
- The LLM may explain deterministic results and guide the user through follow-up information
- The LLM must not independently determine the final risk classification

### Authentication

Use a managed OIDC/OAuth identity provider rather than custom mobile password storage.

Possible providers include:

- Auth0
- Firebase Authentication
- AWS Cognito
- Microsoft Entra External ID
- Supabase Auth

The mobile application should store access and refresh tokens only in OS-backed secure storage. Never place provider secrets, Gemini keys, database credentials, or storage keys in the mobile application bundle.

---

## Target Architecture

```text
React Native / Expo Mobile App
            |
            | HTTPS REST API
            v
+--------------------------------+
|             FastAPI            |
|                                |
|  Auth  Analysis  Reports  Chat |
+--------------------------------+
            |
            v
+--------------------------------+
|      Application Services      |
|                                |
| AnalysisService                |
| MLInferenceService             |
| ExpertSystemService            |
| ReportService                  |
| StorageService                 |
| AssistantService               |
+--------------------------------+
       |              |
       v              v
 PostgreSQL       Object Storage
 structured       uploaded lesion
 records          images

Optional later:

Redis -> cache, rate limits, temporary sessions
Queue -> asynchronous inference jobs
Worker -> independently scalable ML inference
FAISS/vector store -> similarity retrieval
```

---

## Architecture Style

Build V2 as a **modular monolith**.

Do not begin with separate microservices for authentication, analysis, reports, chat, storage, and inference. Maintain clear internal module boundaries so that ML inference can be extracted later if independent GPU or workload scaling becomes necessary.

Suggested backend structure:

```text
backend/
  app/
    main.py

    api/
      dependencies.py
      routes/
        analyses.py
        reports.py
        assistant.py
        users.py
        health.py

    core/
      config.py
      security.py
      logging.py
      errors.py

    domain/
      analysis/
      expert_system/
      reports/
      conversations/

    services/
      analysis_service.py
      ml_inference_service.py
      expert_system_service.py
      report_service.py
      storage_service.py
      assistant_service.py

    ml/
      predictor.py
      preprocessing.py
      models/

    expert/
      certainty_factors.py
      rules.py
      evaluator.py

    db/
      session.py
      models/
      repositories/
      migrations/

    schemas/
      analysis.py
      report.py
      assistant.py
      common.py

  tests/
    unit/
    integration/
    contract/
```

Suggested mobile structure:

```text
mobile/
  app/
    _layout.tsx

    (auth)/
      login.tsx
      register.tsx

    (tabs)/
      index.tsx
      scan.tsx
      reports.tsx
      profile.tsx

    analysis/
      [analysisId].tsx

  src/
    components/
    features/
      auth/
      camera/
      intake/
      analysis/
      reports/
      assistant/

    services/
      api-client.ts
      auth-client.ts

    hooks/
    schemas/
    types/
    utils/
```

---

## Domain Rules and Non-Negotiable Boundaries

### 1. Separate Prediction from Risk Reasoning

The ML model returns class probabilities. It does not directly produce the complete user-facing medical-risk conclusion.

```text
Image
  -> ML prediction
  -> top-K probabilities
  -> expert-system evaluation with intake evidence
  -> deterministic risk assessment
  -> optional LLM explanation
```

### 2. Keep the LLM Outside the Decision Boundary

The LLM may:

- Explain the structured result
- Rephrase approved medical facts
- Ask relevant follow-up questions
- Help navigate the application

The LLM must not:

- Override ML probabilities
- Alter expert-system conclusions
- Invent a diagnosis
- Generate an uncited medical conclusion as if it came from the deterministic pipeline

### 3. Preserve Traceability

Each analysis should record:

- Model version
- Rule-set version
- Preprocessing version
- Analysis timestamp
- Top-K predictions
- Intake evidence used
- Expert-system result
- Relevant reasoning trace
- Any generated explanation separately from the deterministic result

### 4. Maintain Medical-Safety Language

The product should present itself as an educational or screening-support tool, not a diagnostic system, unless a future validated and regulated scope explicitly changes that status.

High-risk, uncertain, or technically invalid analyses should direct the user toward qualified clinical evaluation rather than reassuring the user.

---

## Recommended Data Model

Use UUIDs for externally visible identifiers.

### User

```text
id
identity_provider_subject
email
role
created_at
updated_at
```

Do not use a role value supplied solely by the mobile client as authorization proof.

### Analysis

```text
id
user_id
status
risk_level
model_version
rule_set_version
preprocessing_version
image_object_key
image_mime_type
image_checksum
created_at
completed_at
failure_code
```

### Intake Response

```text
id
analysis_id
age
sex_at_birth
body_location
duration_days
rapid_change
bleeding
itching
pain
fitzpatrick_type
medical_history
medications
sun_exposure
created_at
```

Only collect and store fields that are necessary for the stated product purpose.

### Prediction

```text
id
analysis_id
label
probability
rank
```

### Expert-System Result

```text
id
analysis_id
primary_result
needs_clinician_review_cf
high_risk_cf
moderate_risk_cf
low_risk_cf
reasoning_trace_json
created_at
```

### Report

```text
id
analysis_id
user_id
status
clinician_note
clinician_note_author_id
clinician_note_updated_at
created_at
```

### Conversation

```text
id
user_id
analysis_id
status
created_at
updated_at
```

### Conversation Message

```text
id
conversation_id
role
content
provider
model
created_at
```

Do not rely on an in-memory Python dictionary as the durable conversation store.

---

## API Design

Use a versioned API prefix:

```text
/api/v2
```

Recommended endpoints:

```text
POST   /api/v2/analyses
GET    /api/v2/analyses
GET    /api/v2/analyses/{analysis_id}
DELETE /api/v2/analyses/{analysis_id}

GET    /api/v2/analyses/{analysis_id}/report

POST   /api/v2/conversations
POST   /api/v2/conversations/{conversation_id}/messages
GET    /api/v2/conversations/{conversation_id}/messages

GET    /api/v2/health
GET    /api/v2/ready
```

For the first V2 release, `POST /analyses` may perform synchronous inference if measured latency is acceptable.

Example multipart request fields:

```text
image
age
sex_at_birth
body_location
duration_days
rapid_change
bleeding
itching
pain
fitzpatrick_type
```

Example response shape:

```json
{
  "analysis_id": "uuid",
  "status": "completed",
  "risk_level": "clinician_review",
  "predictions": [
    {
      "label": "mel",
      "probability": 0.62,
      "rank": 1
    }
  ],
  "explanation": {
    "summary": "...",
    "disclaimer": "..."
  },
  "model_version": "resnet50-v4",
  "rule_set_version": "skinai-cf-v1"
}
```

Do not expose internal stack traces, storage credentials, model paths, or raw exception details through API responses.

---

## Mobile Workflow

The primary V2 workflow should be optimized for a phone:

```text
Authenticate
  -> Start scan
  -> Capture or select image
  -> Review image
  -> Run local quality checks
  -> Complete intake
  -> Submit analysis
  -> Display progress
  -> Display structured result
  -> View report or ask follow-up questions
```

### Camera Experience

The camera flow should include:

- Explicit camera permission handling
- Guidance for lighting, distance, focus, and framing
- Image preview before upload
- Retake option
- Upload progress
- Clear failure and retry states
- Removal of unnecessary image metadata before upload when feasible

### Image Quality Gate

Before sending an image to the model, check at minimum:

- Supported MIME type
- Maximum file size
- Minimum image dimensions
- Corrupt or unreadable image
- Extreme blur or darkness if a practical quality check is implemented

A failed quality gate should produce an actionable user message rather than a model prediction.

---

## Authentication and Authorization

Requirements:

- Use managed OIDC/OAuth authentication
- Validate access tokens in FastAPI
- Enforce record ownership server-side
- Enforce clinician or administrative capabilities server-side
- Never use a hardcoded clinician account in the mobile application
- Never treat a client-side role flag as authorization
- Store tokens in Expo SecureStore
- Implement token expiration and refresh handling
- Do not put provider secrets or API keys in Expo environment variables that are bundled into the client

---

## Storage and Privacy

### Database

Store structured records and relationships in PostgreSQL.

### Images

Store lesion images in private object storage.

Use:

- Private buckets or containers
- Short-lived signed access URLs when image access is necessary
- Server-side authorization before issuing access
- Encryption in transit and at rest
- Defined retention and deletion behavior
- Audit-capable access patterns for sensitive operations

Do not make uploaded images publicly accessible.

### Mobile Persistence

Store only the minimum necessary information on the device.

Use SecureStore for small secrets and tokens. Do not use ordinary unencrypted storage for access tokens, health histories, complete reports, or raw lesion images.

---

## Synchronous vs. Asynchronous Inference

### Initial V2

Use synchronous inference if:

- Inference latency remains acceptable in real device testing
- Traffic is low
- The deployment environment can handle the model's memory requirements
- Request timeouts remain reliable

### Later Scaling Path

Move to asynchronous processing when measured behavior justifies it:

```text
Mobile
  -> POST /analyses
  -> FastAPI creates pending analysis
  -> Queue receives analysis job
  -> Inference worker processes image
  -> Worker saves predictions and expert result
  -> Mobile polls or receives a notification
```

Potential technologies:

- Redis with Celery or RQ
- AWS SQS
- Azure Service Bus
- Google Cloud Tasks or Pub/Sub

Do not introduce a queue in the first implementation without a demonstrated need.

---

## Testing Strategy

### Unit Tests

Test:

- Image preprocessing
- Class-label ordering
- Certainty-factor combination functions
- Rule evaluation
- Risk selection logic
- Input normalization
- Authorization policies
- API schema validation

### Integration Tests

Test:

- Analysis submission through persisted result
- Object-storage upload and cleanup
- Database transactions
- Authentication and ownership enforcement
- Assistant context retrieval
- Report generation

### Contract Tests

Create stable fixtures for:

- `/analyses` request and response
- Analysis status values
- Risk-level values
- Prediction objects
- Error responses

The mobile application and backend should share generated or centrally maintained API types where practical.

### ML Regression Tests

Maintain a controlled image fixture set and verify:

- Preprocessing remains unchanged unless intentionally versioned
- Class ordering remains correct
- Output shape remains correct
- Predictions remain within expected tolerances
- The correct model artifact loads in the target deployment

### Expert-System Regression Tests

Create deterministic test cases for combinations such as:

- Melanoma probability with rapid change
- Melanoma probability with bleeding
- Nevus probability with rapid change
- BCC or AKIEC probabilities
- Low-risk classes without concerning symptoms
- Conflicting high-, moderate-, and low-risk facts
- Missing or unknown intake values

---

## Observability

Implement structured logging with correlation identifiers.

Record:

- Request identifier
- Analysis identifier
- Model version
- Rule-set version
- Processing duration
- Outcome status
- Error code

Do not log:

- Passwords or tokens
- Full medical histories
- Complete chat content by default
- Raw lesion images
- Unnecessary personally identifiable information

Track operational metrics such as:

- API latency
- Inference latency
- Analysis failure rate
- Image-quality rejection rate
- Model-loading failures
- Object-storage failures
- Assistant-provider failures

---

## Migration Plan

### Phase 1: Stabilize V1 Intelligence Boundary

- Add regression tests around `run_expert_pipeline()`
- Verify and document model preprocessing
- Verify the seven-class ordering
- Add explicit model and rule-set versions
- Separate Gemini explanation from deterministic risk reasoning

### Phase 2: Introduce FastAPI

- Create a FastAPI application
- Port the Flask analysis route first
- Wrap the current predictor and expert pipeline behind services
- Add typed Pydantic request and response models
- Add health and readiness checks

### Phase 3: Consolidate V1 Backends

- Move report operations to FastAPI
- Replace Node authentication with a managed identity provider
- Replace Node image storage with a storage service
- Remove duplicate chat routes
- Retire Express only after equivalent capabilities are tested

### Phase 4: Build Mobile Foundation

- Create the Expo TypeScript project
- Add routing and authentication
- Build camera and image-preview flows
- Add typed API client
- Implement secure token storage

### Phase 5: Build End-to-End Analysis

- Submit image and intake to FastAPI
- Display loading, success, quality-failure, and system-failure states
- Add report history
- Add analysis detail view
- Add clinician-review messaging

### Phase 6: Add Assistant and Similarity Features

- Add persisted conversation sessions
- Connect assistant context to an analysis identifier
- Restore FAISS similarity only if it contributes to the V2 user experience
- Clearly distinguish retrieved similar examples from diagnostic evidence

### Phase 7: Harden and Release

- Complete security review
- Add retention and deletion behavior
- Add rate limits
- Complete accessibility testing
- Test on physical iOS and Android devices
- Add production monitoring
- Prepare App Store and Google Play privacy disclosures

---

## Explicitly Avoid

Do not:

- Wrap the existing website in a WebView and call it a native V2
- Add Node.js, Flask, and FastAPI as three permanent backend layers
- Begin with microservices
- Put the 217 MB Keras model into the mobile application for the first release
- Store backend secrets in the mobile bundle
- Retain hardcoded clinician credentials
- Store authentication or authorization state only in normal local storage
- Store raw images directly in ordinary relational columns without a deliberate storage strategy
- Allow the LLM to determine or alter risk scores
- Make uploaded lesion images public
- Treat an external service's healthcare-readiness statement as sufficient proof that the entire application is compliant
- Rewrite the expert system without regression tests

---

## Implementation Priorities

Use this order when making architectural decisions:

1. Patient safety and clear non-diagnostic communication
2. Security and privacy
3. Deterministic, testable analysis behavior
4. Correct model preprocessing and versioning
5. Maintainable mobile experience
6. Simple deployment and operations
7. Performance optimizations based on measurement
8. Advanced features such as on-device inference or independent inference services

---

## Definition of Done for V2 MVP

The V2 MVP is complete when a user can:

- Install and open the mobile application on iOS or Android
- Authenticate using the selected managed identity provider
- Capture or select a lesion image
- Complete the relevant intake fields
- Submit the image securely
- Receive the deterministic ML plus expert-system result
- View a clear explanation and disclaimer
- See past analyses belonging only to that user
- Delete an analysis and its associated image according to the implemented retention behavior
- Recover cleanly from permissions, network, image-quality, inference, and authentication errors

The backend must also:

- Use one FastAPI entry point
- Enforce authentication and authorization server-side
- Store structured data separately from image objects
- Record model and rule-set versions
- Pass unit, integration, contract, ML regression, and expert-system regression tests
- Avoid exposing secrets or internal exception details

---

## Agent Instructions

When implementing from this brief:

1. Inspect the V1 code before changing the ML preprocessing or certainty-factor logic.
2. Preserve behavior with tests before refactoring.
3. Prefer incremental migration over a full rewrite.
4. Keep the implementation as a modular monolith.
5. Use TypeScript for all new mobile code.
6. Use typed Pydantic schemas for all external API contracts.
7. Never place secrets in mobile code.
8. Never let an LLM-generated statement replace the deterministic analysis result.
9. Do not introduce Redis, queues, microservices, Kubernetes, or on-device inference without a measured requirement.
10. Document assumptions, unresolved decisions, and security-sensitive configuration.
11. If V1 behavior conflicts with this brief, preserve safety and traceability first, then document the conflict before making a breaking change.
12. Produce small, reviewable changes with tests.

---

## Final Stack Decision

```text
Mobile:
  React Native + Expo + TypeScript + Expo Router

Backend:
  Python + FastAPI + Pydantic + SQLAlchemy + Alembic

Database:
  PostgreSQL

Image Storage:
  Private cloud object storage

Machine Learning:
  Existing TensorFlow/Keras ResNet50, server-side initially

Expert Reasoning:
  Existing Python MYCIN-style certainty-factor engine

Assistant:
  Gemini behind an AssistantService abstraction

Authentication:
  Managed OIDC/OAuth provider

Optional Infrastructure:
  Redis and a job queue only after measured need

Architecture:
  Modular monolith with extractable inference boundary
```
