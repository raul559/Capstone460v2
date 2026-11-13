# SkinAI V2 Architecture Diagrams

**Path:** `docs/architecture/V2_ARCHITECTURE_DIAGRAMS.md`

Visual companion to [`V2_ARCHITECTURE.md`](V2_ARCHITECTURE.md). That brief is the
source of truth: if a diagram here disagrees with it, the brief wins and this
file should be fixed. Folder paths follow
[`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md).

Diagrams are [Mermaid](https://mermaid.js.org/) and render on GitHub and in most
Markdown previewers.

**Legend used in several diagrams**

| Style | Meaning |
|---|---|
| Solid box | Part of the V2 design |
| Dashed box | Optional or deferred until a measured need |
| "(built)" in a label | Exists in the repository today |

---

## 1. System context

Who and what SkinAI V2 talks to.

```mermaid
flowchart LR
    patient(["Patient<br/>phone user"])
    clinician(["Clinician<br/>reviewer role"])

    subgraph skinai["SkinAI V2"]
        mobile["Mobile app<br/>React Native + Expo"]
        api["FastAPI backend<br/>/api/v2"]
    end

    idp["Managed identity provider<br/>OIDC / OAuth"]
    gemini["Gemini API<br/>explanations only"]
    pg[("PostgreSQL<br/>structured records")]
    obj[("Private object storage<br/>lesion images")]

    patient --> mobile
    clinician --> mobile
    mobile -- "sign in" --> idp
    mobile -- "HTTPS + access token" --> api
    api -- "validate tokens" --> idp
    api --> pg
    api --> obj
    api -- "deterministic result as context" --> gemini
```

---

## 2. Layered architecture (modular monolith)

One deployable FastAPI app with internal layers. Intelligence code lives in the
top-level `intelligence/` package so it can be tested without the web layer.

```mermaid
flowchart TB
    subgraph client["Client · apps/mobile"]
        screens["Screens · Expo Router<br/>home · upload · camera · results · chat · account (built)<br/>intake · history"]
        apiclient["API client · src/api (built)<br/>TanStack Query planned"]
        secure["SecureStore<br/>tokens only"]
        screens --> apiclient
        apiclient --- secure
    end

    subgraph api["API · services/api/app"]
        routes["api/routes<br/>health (built) · analyses · reports · conversations · users"]
        deps["api/dependencies<br/>auth · current user · DB session"]
        schemas["schemas<br/>Pydantic request/response contracts"]
        services["services<br/>analysis · report · storage · assistant"]
        repos["repositories<br/>analysis · prediction · user · report · conversation"]
        core["core<br/>config · security · logging · exceptions"]
        integ["integrations<br/>identity · storage · assistant"]
        routes --> deps
        routes --> schemas
        routes --> services
        services --> repos
        services --> integ
        core -.-> routes
        core -.-> services
    end

    subgraph intel["Intelligence · intelligence/"]
        ml["ml<br/>preprocessing · labels · predictor · model_registry"]
        expert["expert<br/>evidence · rules · certainty_factors · engine"]
    end

    subgraph data["Data and external"]
        pg[("PostgreSQL<br/>SQLAlchemy + Alembic")]
        obj[("Object storage<br/>private bucket")]
        idp["Identity provider"]
        gemini["Gemini"]
        model[/"ResNet50 .keras<br/>tracked by models/manifest.json"/]
    end

    apiclient -- "HTTPS /api/v2" --> routes
    services --> ml
    services --> expert
    ml --> model
    repos --> pg
    integ --> obj
    integ --> idp
    integ --> gemini
```

---

## 3. Analysis request: `POST /api/v2/analyses`

The main flow, including the image quality gate and where Gemini is allowed to
act. First release runs this synchronously inside the request.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant M as Mobile app
    participant A as FastAPI route
    participant S as AnalysisService
    participant Q as Quality gate
    participant ML as ML inference<br/>(ResNet50)
    participant ES as Expert system<br/>(certainty factors)
    participant ST as Object storage
    participant DB as PostgreSQL
    participant G as AssistantService<br/>(Gemini)

    U->>M: Capture or pick photo, fill intake
    M->>M: Local checks (type, size, preview)
    M->>A: multipart: image + intake fields<br/>Authorization: Bearer token
    A->>A: Validate token and Pydantic schema
    A->>S: create_analysis(user, image, intake)
    S->>Q: check MIME, size, dimensions, readability
    alt image fails quality gate
        Q-->>S: rejected + reason
        S-->>A: quality failure
        A-->>M: 422 with actionable message
        M-->>U: "Retake the photo" guidance
    else image passes
        S->>ST: store image (private key)
        S->>ML: predict(image)
        ML-->>S: top-K probabilities + model_version
        S->>ES: evaluate(top-K, intake evidence)
        ES-->>S: risk level + CF scores + reasoning trace + rule_set_version
        S->>DB: save analysis, intake, predictions, expert result
        opt explanation enabled (Milestone 7)
            S->>G: explain(structured result)
            G-->>S: plain-language summary
            S->>DB: save explanation separately
        end
        S-->>A: AnalysisResponse
        A-->>M: 201 analysis_id, risk_level, predictions,<br/>explanation, versions
        M-->>U: Result screen + disclaimer
    end
```

---

## 4. Decision boundary

Only the deterministic path decides the risk level. The LLM is downstream and
cannot change it.

```mermaid
flowchart LR
    img["Lesion image"] --> qg{"Quality gate"}
    qg -- "fails" --> retake["Retake message<br/>no prediction"]
    qg -- "passes" --> pre["Preprocessing<br/>224×224 RGB"]
    pre --> net["ResNet50<br/>7 HAM10000 classes"]
    net --> topk["Top-K probabilities"]
    intake["Intake evidence<br/>rapid change · bleeding<br/>itching · pain · …"] --> cf
    topk --> cf["Certainty-factor<br/>expert system"]
    cf --> risk["Risk level<br/>+ reasoning trace"]

    subgraph deterministic["Deterministic · versioned · regression-tested"]
        qg
        pre
        net
        topk
        cf
        risk
    end

    risk --> llm["Gemini<br/>explains only"]
    llm --> text["Explanation text<br/>stored separately"]
    risk --> ui["Result screen"]
    text --> ui

    llm -. "may NOT change" .-> risk

    style deterministic fill:#e3eef2,stroke:#1f6f8b
    style llm stroke-dasharray: 5 5
```

---

## 5. Data model

From the brief's "Recommended Data Model". UUIDs for every externally visible
ID; images live in object storage and are referenced by key.

```mermaid
erDiagram
    USER ||--o{ ANALYSIS : owns
    USER ||--o{ CONVERSATION : starts
    ANALYSIS ||--|| INTAKE_RESPONSE : has
    ANALYSIS ||--o{ PREDICTION : "has top-K"
    ANALYSIS ||--o| EXPERT_SYSTEM_RESULT : produces
    ANALYSIS ||--o| REPORT : "summarized by"
    ANALYSIS ||--o{ CONVERSATION : "discussed in"
    CONVERSATION ||--o{ CONVERSATION_MESSAGE : contains

    USER {
        uuid id PK
        string identity_provider_subject
        string email
        string role
        datetime created_at
        datetime updated_at
    }
    ANALYSIS {
        uuid id PK
        uuid user_id FK
        string status
        string risk_level
        string model_version
        string rule_set_version
        string preprocessing_version
        string image_object_key
        string image_mime_type
        string image_checksum
        datetime created_at
        datetime completed_at
        string failure_code
    }
    INTAKE_RESPONSE {
        uuid id PK
        uuid analysis_id FK
        int age
        string sex_at_birth
        string body_location
        int duration_days
        bool rapid_change
        bool bleeding
        bool itching
        bool pain
        string fitzpatrick_type
        string medical_history
        string medications
        string sun_exposure
        datetime created_at
    }
    PREDICTION {
        uuid id PK
        uuid analysis_id FK
        string label
        float probability
        int rank
    }
    EXPERT_SYSTEM_RESULT {
        uuid id PK
        uuid analysis_id FK
        string primary_result
        float needs_clinician_review_cf
        float high_risk_cf
        float moderate_risk_cf
        float low_risk_cf
        json reasoning_trace_json
        datetime created_at
    }
    REPORT {
        uuid id PK
        uuid analysis_id FK
        uuid user_id FK
        string status
        string clinician_note
        uuid clinician_note_author_id
        datetime clinician_note_updated_at
        datetime created_at
    }
    CONVERSATION {
        uuid id PK
        uuid user_id FK
        uuid analysis_id FK
        string status
        datetime created_at
        datetime updated_at
    }
    CONVERSATION_MESSAGE {
        uuid id PK
        uuid conversation_id FK
        string role
        string content
        string provider
        string model
        datetime created_at
    }
```

---

## 6. Sign-in and authorization

Managed OIDC sign-in; the server is the only place roles and ownership are
enforced. The provider is not chosen yet (Auth0, Firebase, Cognito, Entra
External ID or Supabase are all candidates).

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant M as Mobile app
    participant KS as SecureStore
    participant IdP as Identity provider
    participant A as FastAPI
    participant DB as PostgreSQL

    U->>M: Tap "Sign in"
    M->>IdP: OIDC authorization (PKCE)
    IdP-->>U: Provider login page
    U->>IdP: Credentials
    IdP-->>M: Access token + refresh token
    M->>KS: Store tokens (OS-encrypted)
    M->>A: GET /api/v2/analyses<br/>Authorization: Bearer access token
    A->>IdP: Verify signature / keys (cached)
    A->>DB: Find or create USER by provider subject
    A->>DB: SELECT analyses WHERE user_id = current user
    A-->>M: Only this user's analyses
    Note over A: Clinician capabilities come from the<br/>server-side role, never from the client
    M->>IdP: Refresh token when access token expires
```

---

## 7. Image storage and access

Images never go into ordinary database columns and are never public.

```mermaid
flowchart LR
    M["Mobile app"] -- "upload with analysis request" --> A["FastAPI"]
    A -- "put object<br/>key = analysis UUID" --> O[("Private bucket<br/>encrypted at rest")]
    A -- "store key + checksum + MIME" --> P[("PostgreSQL")]
    M -- "request image for analysis X" --> A
    A -- "ownership check" --> P
    A -- "issue short-lived signed URL" --> M
    M -- "fetch via signed URL" --> O
    D["Delete analysis"] --> A
    A -- "delete row + object<br/>per retention policy" --> O
```

---

## 8. Inference: now and later

```mermaid
flowchart TB
    subgraph now["First release · synchronous"]
        direction LR
        m1["Mobile"] --> a1["POST /analyses"] --> r1["Model + rules<br/>in the request"] --> res1["Result in response"]
    end

    subgraph later["Later · only after measured need"]
        direction LR
        m2["Mobile"] --> a2["POST /analyses<br/>status = pending"] --> q[["Queue<br/>Redis + Celery/RQ<br/>or cloud tasks"]] --> w["Inference worker"] --> db2[("Save predictions<br/>+ expert result")]
        db2 --> poll["Mobile polls or<br/>gets a notification"]
    end

    now -. "switch when latency, timeouts<br/>or model memory become a problem" .-> later
    style later stroke-dasharray: 5 5
```

---

## 9. Mobile app structure

Current routes and features. "(built)" marks what exists today; dashed lines
are planned. How current routes map to the target routes is in
`REPOSITORY_STRUCTURE.md` under `apps/mobile/src/app/`.

```mermaid
flowchart TB
    root["_layout.tsx (built)<br/>theme · splash"]
    root --> tabs["(tabs) (built)"]
    root --> upload["upload.tsx (built)<br/>pick from library"]
    root --> camera["camera.tsx (built)<br/>take a photo"]
    root --> results["results.tsx (built)"]
    root -.-> auth["(auth)<br/>login · register"]

    tabs --> home["index · home (built)"]
    tabs --> chat["explore · chat (built)"]
    tabs --> account["account (built)"]
    tabs -.-> history["history"]

    subgraph features["src/features · screens, components, hooks, stores, utils"]
        fa["analysis (built)"]
        fc["camera (built)"]
        fs["assistant (built)"]
        fh["home (built)"]
        fac["account (built)"]
        fi["intake<br/>React Hook Form + Zod"]
        fau["auth"]
    end

    subgraph api["src/api"]
        c1["skin-analysis.ts (built)<br/>base URL from EXPO_PUBLIC_API_URL"]
    end

    upload --> fa
    results --> fa
    camera --> fc
    chat --> fs
    home --> fh
    account --> fac
    fa --> c1
    c1 -- "today: POST /analyze_skin" --> v1["V1 Flask"]
    c1 -. "Milestone 3: POST /api/v2/analyses" .-> backend["FastAPI"]
```

---

## 10. V1 → V2 migration map

What each V1 piece becomes. V1 code stays read-only under `legacy/`.

```mermaid
flowchart LR
    subgraph v1["V1 · legacy/ and apps/web-v1"]
        web["React web app<br/>apps/web-v1"]
        node["Node / Express<br/>legacy/v1-node"]
        flask["Flask<br/>legacy/v1-flask"]
        mongo[("MongoDB<br/>records + images")]
        ls["Browser localStorage<br/>session · reports"]
        doc["Hardcoded doctor login"]
        mem["In-memory chat sessions"]
    end

    subgraph v2["V2"]
        mobile["Expo mobile app"]
        fast["FastAPI"]
        intel["intelligence/ml + expert"]
        pg[("PostgreSQL")]
        obj[("Object storage")]
        idp["Managed identity provider"]
        ss["SecureStore"]
        conv["Persisted conversations"]
    end

    web --> mobile
    node -- "auth, images, chat" --> fast
    flask -- "routes" --> fast
    flask -- "predictor, CF engine<br/>behind regression tests" --> intel
    mongo -- "records" --> pg
    mongo -- "images" --> obj
    ls --> ss
    doc --> idp
    mem --> conv
```

---

## 11. Implementation status

What exists today versus the plan in
[`docs/v2/IMPLEMENTATION_PLAN.md`](../v2/IMPLEMENTATION_PLAN.md). Update this
diagram when a milestone step lands.

```mermaid
flowchart LR
    m1["M1 Repository foundation<br/>layout (built) docs (built)<br/>FastAPI /api/v2/health (built)<br/>Expo SDK 58 app (built)<br/>tests and CI (built)"]
    m2["M2 Intelligence migration"]
    m3["M3 Analysis API"]
    m4["M4 Mobile vertical slice<br/>screens built, calling V1<br/>intake form not started"]
    m5["M5 Persistence"]
    m6["M6 Identity and authorization"]
    m7["M7 AI explanation"]
    m8["M8 Demo candidate"]

    m1 --> m2 --> m3 --> m4 --> m5 --> m6 --> m7 --> m8

    style m1 fill:#1f6f8b,color:#ffffff
    style m4 fill:#f3d2bb
```
