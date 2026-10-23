# Backend Server Documentation

## Table of Contents

- [Server Design](#server-design)
  - [Dual-Backend Architecture](#dual-backend-architecture)
  - [File Architecture](#file-architecture)
  - [Response Format](#response-format)
- [Environment Variables](#environment-variables)
- [Node.js API Routes](#nodejs-api-routes)
  - [Health Check](#health-check)
  - [Image Upload](#image-upload)
  - [Image Retrieval](#image-retrieval)
  - [Register](#register)
  - [Login](#login)
  - [Chat (Node.js)](#chat-nodejs)
  - [SPA Fallback](#spa-fallback)
- [Flask / Python API Routes](#flask--python-api-routes)
  - [Analyze Skin](#analyze-skin)
  - [Chat (Flask)](#chat-flask)
  - [Chat Reset](#chat-reset)
  - [Image Similarity Query](#image-similarity-query)
  - [Save Report](#save-report)
  - [List Reports](#list-reports)
  - [Update Report Note](#update-report-note)
  - [Save Health Info](#save-health-info)
  - [Dataset Image Serving](#dataset-image-serving)
- [Data Models](#data-models)
- [Installation & Setup](#installation--setup)

---

## Server Design

### Dual-Backend Architecture

SkinAI uses two backend servers that run simultaneously:

| Server | Language | Default Port | Responsibility |
|--------|----------|-------------|----------------|
| **Node.js / Express** | JavaScript | 3000 (dev) / 8080 (prod) | User authentication, image storage, SPA serving, lightweight Gemini chatbot |
| **Flask / Python** | Python | 3720 | ML inference, expert system reasoning, report storage, full Gemini intake chatbot |

The React frontend talks to both backends:
- Authentication, image storage → Node.js (`/api/*`)
- Skin analysis, chatbot, reports → Flask (`/analyze_skin`, `/chat`, `/reports/*`)

The frontend resolves the Flask base URL from the environment variable `VITE_API_BASE_URL` (default: `http://localhost:3720`).

---

### File Architecture

```
Capstone460v2/
│
├── .env                            # Environment variables (secret)
├── .env.example                    # Environment variable template
│
├── apps/
│   └── web-v1/                     # React/Vite frontend (see Frontend Docs)
│       └── dist/                   # Built frontend served by the Node.js server in production
│
└── legacy/
    ├── v1-node/
    │   ├── server.js                # Node.js/Express entry point
    │   └── package.json             # Node.js dependencies
    │
    └── v1-flask/
        └── src/
            ├── expert_pipeline.py     # Pipeline orchestration (main entry point)
            ├── keras_predictor.py     # ResNet50 model wrapper
            ├── skinai_analyzer.py     # High-level CF analysis interface
            ├── certainty_factors.py   # MYCIN CF engine + rule definitions
            ├── query.py               # FAISS image similarity search
            ├── requirements.txt       # Python dependencies
            │
            ├── models/
            │   └── resnet50_skin_disease_finetuned_v4.keras  # Pre-trained model (217MB)
            │
            └── expertSystem/
                ├── app.py             # Flask web server (main Python entry point)
                ├── chat.py            # Gemini intake chatbot logic
                ├── disease_facts.py   # Medical reference data
                ├── disease_prediction.py  # Expert fusion logic
                ├── rules.py           # ABCDE scoring / class bonus rules
                ├── schema.py          # Data models (Facts, ExpertOutput)
                └── normalize.py       # Input normalization helpers
```

---

### Response Format

Both backends return JSON responses. The Node.js server uses a flat structure; the Flask server returns domain-specific objects.

**Node.js success example:**
```json
{
  "message": "Login successful",
  "email": "user@example.com"
}
```

**Node.js error example:**
```json
{
  "error": "Email and password are required"
}
```

**Flask success example (`/analyze_skin`):**
```json
{
  "top_predictions": [
    { "label": "mel", "confidence": 0.620 },
    { "label": "nv",  "confidence": 0.270 }
  ],
  "risk_score": "high_risk",
  "explanation_summary": { ... },
  "assistant_seed": "Preliminary result: high risk\nTop predictions: ...",
  "follow_up_questions": [ "Has this lesion been changing?", ... ]
}
```

**Flask rate-limit response:**
```json
{
  "reply": "You're sending messages too quickly. Please wait 0.8s and try again.",
  "error_code": "RATE_LIMIT_DEBOUNCE"
}
```

---

## Environment Variables

Create a `.env` file in the project root. The `.env.example` template shows the required keys:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | Yes | Google Gemini API key (also accepted as `GEMINI_API_KEY`) |
| `GEMINI_MODEL` | No | Gemini model name. Default: `gemini-2.0-flash` |
| `MONGODB_URI` | Yes | Full MongoDB connection string including credentials |
| `PORT` | No | Node.js server port. Default: `8080` |
| `BACKEND_PORT` | No | Flask server port. Default: `3720` |
| `NODE_DNS_SERVERS` | No | Comma-separated custom DNS servers for the Node.js process |
| `CHAT_MIN_INTERVAL` | No | Seconds between consecutive chat requests per session. Default: `1.0` |
| `CHAT_MAX_PER_MINUTE` | No | Maximum chat requests per minute per session. Default: `20` |

Example `.env`:
```
GOOGLE_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
PORT=3000
```

---

## Node.js API Routes

All Node.js routes are prefixed with `/api/` except the chatbot (`/chat`) and the SPA fallback.

---

### Health Check

**`GET /api/health`**

Pings the MongoDB database and reports connectivity status. Used by load balancers and monitoring tools.

**Request:** No body or parameters required.

**Success response (200):**
```json
{
  "status": "healthy",
  "message": "Database connected successfully",
  "database": "skin-images"
}
```

**Error response (503):**
```json
{
  "status": "unhealthy",
  "message": "Database connection failed"
}
```

---

### Image Upload

**`POST /api/upload`**

Stores a skin lesion image in MongoDB. Accepts `multipart/form-data`.

**Request fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Image file (jpeg, jpg, or png). Max 10MB. |
| `patientInfo` | Object | No | Arbitrary patient metadata stored alongside the image. |

**Success response (201):**
```json
{
  "message": "Image uploaded successfully",
  "imageId": "64f2a1b3c8e4d50012345678"
}
```

**Error responses:**

| Status | Condition |
|--------|-----------|
| 400 | No image file provided |
| 400 | File type not jpeg/jpg/png |
| 503 | Database unavailable |

---

### Image Retrieval

**`GET /api/images/:id`**

Returns the raw binary image stored for a given MongoDB ObjectId.

**URL parameter:**

| Parameter | Description |
|-----------|-------------|
| `id` | MongoDB ObjectId of the image document |

**Success response (200):** Raw image bytes with the appropriate `Content-Type` header set.

**Error response (404):**
```json
{ "error": "Image not found" }
```

---

### Register

**`POST /api/auth/register`**

Creates a new patient account. Passwords are hashed with bcrypt (10 rounds) before storage.

**Request body:**
```json
{
  "email": "patient@example.com",
  "password": "securepassword"
}
```

**Validation rules:**
- `email` must be a valid email format
- `password` must be at least 6 characters
- Email must not already exist in the database

**Success response (201):**
```json
{
  "message": "User created successfully",
  "userId": "64f2a1b3c8e4d50012345678",
  "email": "patient@example.com"
}
```

**Error responses:**

| Status | Message |
|--------|---------|
| 400 | `"Email and password are required"` |
| 400 | `"Please provide a valid email address"` |
| 400 | `"Password must be at least 6 characters"` |
| 409 | `"User already exists"` |

---

### Login

**`POST /api/auth/login`**

Authenticates an existing patient account by comparing the provided password against the stored bcrypt hash.

**Request body:**
```json
{
  "email": "patient@example.com",
  "password": "securepassword"
}
```

**Success response (200):**
```json
{
  "message": "Login successful",
  "email": "patient@example.com"
}
```

> **Note:** There is a hardcoded doctor account for demo purposes: email `doctor@skinai.com`, password `doctor123`. This bypasses the database and is handled on the frontend in `Login.jsx`.

**Error responses:**

| Status | Message |
|--------|---------|
| 400 | `"Email and password are required"` |
| 401 | `"Invalid email or password"` |

---

### Chat (Node.js)

**`POST /chat`**

Lightweight Gemini-powered chatbot for general questions about the application. This is the simpler of the two chat endpoints — it does not maintain session history and is not aware of analysis results. For the full intake-aware chatbot, see the [Flask Chat route](#chat-flask).

**Request body:**
```json
{
  "text": "What skin conditions can this system detect?"
}
```

**Success response (200):**
```json
{
  "reply": "SkinAI can classify seven types of skin lesions from the HAM10000 dataset..."
}
```

**Error response (400):**
```json
{ "reply": "Please provide a message." }
```

---

### SPA Fallback

**`GET /*`**

All non-API, non-chat GET requests return the built React SPA (`apps/web-v1/dist/index.html`). This allows React Router to handle client-side navigation after a full page load or refresh.

---

## Flask / Python API Routes

The Flask server runs on port **3720** by default. All routes support CORS.

---

### Analyze Skin

**`POST /analyze_skin`**

The primary analysis endpoint. Accepts a skin lesion image and patient intake fields, runs the full expert pipeline (ResNet50 prediction → MYCIN reasoning → explanation seed), seeds the Gemini chatbot session with the result, and returns a structured risk assessment.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | Yes | Skin lesion image (jpeg, jpg, png) |
| `age` | string/int | No | Patient age |
| `sex_at_birth` | string | No | `M`, `F`, or `other` |
| `location` | string | No | Lesion body location (e.g., `arm`, `back`) |
| `duration_days` | string/int | No | How long the lesion has been present |
| `rapid_change` | boolean string | No | `"true"` / `"false"` — lesion rapidly changing |
| `bleeding` | boolean string | No | `"true"` / `"false"` — lesion bleeding |
| `itching` | boolean string | No | `"true"` / `"false"` — lesion itching |
| `pain` | boolean string | No | `"true"` / `"false"` — lesion painful |

**Query parameter:**

| Parameter | Description |
|-----------|-------------|
| `sid` | Session ID string. Used to seed the chatbot session with analysis results so follow-up `/chat` calls are context-aware. |

**Success response (200):**
```json
{
  "top_predictions": [
    { "label": "mel",  "confidence": 0.620 },
    { "label": "nv",   "confidence": 0.270 },
    { "label": "bkl",  "confidence": 0.110 }
  ],
  "risk_score": "high_risk",
  "explanation_summary": {
    "primary_result": "high_risk",
    "top_prediction": { "label": "mel", "prob": 0.620 },
    "key_indicators": {
      "needs_clinician_review": 0.82,
      "high_risk_flag": 0.75,
      "moderate_risk_flag": 0.0,
      "low_risk_flag": 0.0
    },
    "intake_signals": {
      "rapid_change": true,
      "bleeding": false,
      "itching": true,
      "pain": false
    },
    "disclaimer": "This tool does not provide a medical diagnosis..."
  },
  "assistant_seed": "Preliminary result: high risk\nTop predictions: mel: 0.6200, ...",
  "follow_up_questions": [
    "Has this lesion been changing in size or color?",
    "Do you have a family history of skin cancer?",
    "When did you first notice this lesion?"
  ],
  "_debug": {
    "reasoning_facts": { "img_mel": 0.62, "high_risk_flag": 0.75, ... },
    "reasoning_trace": [ ... ]
  }
}
```

**Risk score values:**

| Value | Meaning |
|-------|---------|
| `high_risk` | High-risk classification; clinician consultation strongly recommended |
| `moderate_risk` | Moderate-risk; monitoring or professional evaluation advised |
| `low_risk` | Low-risk; benign lesion likely |
| `clinician_review` | System uncertainty is high enough to explicitly recommend a clinician |

**Error response (500):**
```json
{ "error": "Analysis failed: <error message>" }
```

---

### Chat (Flask)

**`POST /chat`**

Full session-aware intake chatbot powered by Gemini. Maintains conversation history per `sid`. After `/analyze_skin` seeds the session, subsequent `/chat` calls are aware of the analysis results and patient data.

**Query parameter:**

| Parameter | Description |
|-----------|-------------|
| `sid` | Session ID. Identifies the conversation session in server memory. |

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | User's chat message |
| `image` | File (optional) | Image attachment for the chat turn |
| Any intake field | string | Additional metadata (age, location, etc.) forwarded to the chatbot |

**Rate limiting:**
- **Debounce:** Requests from the same `sid` within `CHAT_MIN_INTERVAL` seconds (default 1.0s) are rejected with `error_code: RATE_LIMIT_DEBOUNCE`.
- **Burst limit:** More than `CHAT_MAX_PER_MINUTE` requests (default 20) within a 60-second sliding window are rejected with `error_code: RATE_LIMIT_BURST`.

**Success response (200):**
```json
{
  "reply": "Based on your analysis results, the lesion appears to have features consistent with melanoma...",
  "metadata": { "age": "45", "location": "back" }
}
```

**Rate limit response (200):**
```json
{
  "reply": "You're sending messages too quickly. Please wait 0.8s and try again.",
  "error_code": "RATE_LIMIT_DEBOUNCE"
}
```

---

### Chat Reset

**`POST /chat/reset`**

Clears the in-memory conversation history for a session. Useful when context grows too large and causes Gemini API errors (e.g., 429 Resource Exhausted).

**Query parameter:**

| Parameter | Description |
|-----------|-------------|
| `sid` | Session ID to reset |

**Success response (200):**
```json
{
  "message": "Chat session reset",
  "sid": "abc123"
}
```

**Error response (404):**
```json
{ "message": "Session not found or already cleared" }
```

---

### Image Similarity Query

**`POST /query`**

Finds visually similar images in the HAM10000 dataset using FAISS-based k-nearest-neighbor search. Requires that the FAISS index has been built beforehand.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `image` | File | Query image |
| `sex` | string (optional) | Filter by patient sex (`male` / `female`) |
| `localization` | string (optional) | Filter by lesion location |

**Success response (200):**
```json
{
  "results": [
    {
      "image_id": "ISIC_0024306",
      "dx": "mel",
      "age": 65,
      "sex": "male",
      "localization": "back",
      "url": "/ham/ISIC_0024306.jpg",
      "abs_url": "http://localhost:3720/ham/ISIC_0024306.jpg"
    }
  ]
}
```

---

### Save Report

**`POST /reports/save`**

Persists an analysis report to MongoDB (`skin-images.reports` collection).

**Request body (JSON):**
```json
{
  "user_email": "patient@example.com",
  "top_predictions": [ ... ],
  "risk_score": "high_risk",
  "createdAt": "2025-04-24T12:00:00Z"
}
```

The `user_email` field is required. If omitted, a 400 error is returned. The server attaches `createdAt` automatically if not provided.

**Success response (200):**
```json
{ "report_id": "64f2a1b3c8e4d50012345678" }
```

---

### List Reports

**`GET /reports`**

Returns up to 100 reports sorted by `createdAt` descending.

**Query parameter:**

| Parameter | Description |
|-----------|-------------|
| `user_email` | Filter reports by patient email. If omitted, returns all reports (doctor view). |

**Success response (200):**
```json
[
  {
    "id": "64f2a1b3c8e4d50012345678",
    "user_email": "patient@example.com",
    "risk_score": "high_risk",
    "createdAt": "2025-04-24T12:00:00Z",
    "doctor_note": "Follow up in 2 weeks."
  }
]
```

---

### Update Report Note

**`POST /reports/note`**

Adds or updates a doctor's annotation on an existing report.

**Request body (JSON):**
```json
{
  "report_id": "64f2a1b3c8e4d50012345678",
  "doctor_note": "Follow up in 2 weeks.",
  "doctor_email": "doctor@skinai.com"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `report_id` | Yes | MongoDB `_id` of the report to update |
| `doctor_note` | No | Text of the doctor's note |
| `doctor_email` | No | Defaults to `doctor@skinai.com` |

**Success response (200):**
```json
{ "ok": true }
```

**Error response (404):**
```json
{ "error": "Report not found" }
```

---

### Save Health Info

**`POST /api/health-info`**

Saves patient intake health information to the `patientInfo.healthInfo` MongoDB collection.

**Request body (JSON):**
```json
{
  "patientEmail": "patient@example.com",
  "healthInfo": {
    "name": "Jane Doe",
    "age": 45,
    "fitzpatrickType": "III",
    "medicalHistory": "No relevant history"
  },
  "analysisMeta": { "imageCount": 2 },
  "source": "upload-page"
}
```

**Success response (200):**
```json
{ "healthInfoId": "64f2a1b3c8e4d50012345678" }
```

---

### Dataset Image Serving

**`GET /ham/<image_id>.jpg`**

Serves images from the local HAM10000 dataset. Searches both `HAM10000_images_part_1` and `HAM10000_images_part_2` directories.

**Example:** `GET /ham/ISIC_0024306.jpg`

**Error response (404):**
```json
{ "error": "ISIC_0024306 not found" }
```

---

## Data Models

### users (MongoDB: `auth.users`)

Stores patient account credentials managed by the Node.js server.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `email` | string | Unique, lowercase email address |
| `password` | string | bcrypt-hashed password (10 rounds) |
| `createdAt` | Date | Account creation timestamp |
| `lastLogin` | Date | Timestamp of last successful login |

### images (MongoDB: `skin-images.images`)

Stores uploaded skin lesion image binaries.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `filename` | string | Original file name |
| `contentType` | string | MIME type (e.g., `image/jpeg`) |
| `size` | number | File size in bytes |
| `data` | Binary | Raw image bytes |
| `uploadDate` | Date | Upload timestamp |
| `patientInfo` | object | Optional patient metadata passed at upload time |

### reports (MongoDB: `skin-images.reports`)

Stores full analysis results saved from the frontend.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `user_email` | string | Lowercase patient email (required) |
| `top_predictions` | array | Model top-K predictions with confidence scores |
| `risk_score` | string | `high_risk`, `moderate_risk`, `low_risk`, or `clinician_review` |
| `explanation_summary` | object | Structured payload from the expert pipeline |
| `createdAt` | string | ISO 8601 timestamp |
| `doctor_note` | string | Doctor's annotation (added via `/reports/note`) |
| `doctor_note_by` | string | Email of doctor who wrote the note |
| `doctor_note_updated_at` | string | ISO 8601 timestamp of the note |

### healthInfo (MongoDB: `patientInfo.healthInfo`)

Stores patient intake form submissions.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `patientEmail` | string | Lowercase patient email |
| `healthInfo` | object | Full intake form data (name, age, Fitzpatrick type, history, etc.) |
| `analysisMeta` | object | Optional metadata about the associated analysis |
| `source` | string | Origin of the submission (default: `"upload-page"`) |
| `createdAt` | string | ISO 8601 timestamp |

---

## Installation & Setup

### Prerequisites

- **Node.js** (LTS) and **npm**
- **Python 3.10+**
- **MongoDB** (Atlas cloud cluster recommended)
- A **Google Gemini API key** (available at [ai.google.dev](https://ai.google.dev))

### Step 1 — Clone and configure environment

```bash
git clone <repo-url>
cd Capstone460
```

Copy `.env.example` to `.env` and fill in all values:

```
GOOGLE_API_KEY=AIza...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
PORT=3000
GEMINI_MODEL=gemini-2.0-flash
```

### Step 2 — Install Node.js dependencies

```bash
cd legacy/v1-node
npm install
```

### Step 3 — Install Python dependencies

```bash
pip install -r legacy/v1-flask/src/requirements.txt
```

### Step 4 — Run all three processes (three separate terminals)

**Terminal 1 — Python Flask backend:**
```bash
cd legacy/v1-flask/src
python -m expertSystem.app
```
Wait for: `Running on http://localhost:3720`

**Terminal 2 — React frontend dev server:**
```bash
cd apps/web-v1
npm run dev
```
Wait for: `Local: http://localhost:5173/`

**Terminal 3 — Node.js server:**
```bash
cd legacy/v1-node
node server.js
```
Wait for: `Server running on http://localhost:3000`

### Step 5 — Open in browser

Navigate to **http://localhost:5173/**

### Running Tests

```bash
cd legacy/v1-flask
python -m pytest tests/ -v
```

### Production Build

To serve the frontend through the Node.js server (single process):

```bash
cd apps/web-v1
npm run build
```

Then start only the Node.js server (`node server.js`) from `legacy/v1-node/`. It will serve the built frontend from `apps/web-v1/dist/` on the configured `PORT`.

### Deployed Application

The application is deployed at:
**https://skinai-node-877350604703.us-central1.run.app/**
