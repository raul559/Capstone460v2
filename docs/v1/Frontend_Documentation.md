# Frontend Documentation

## Table of Contents

- [Installation & Setup](#installation--setup)
  - [Prerequisites](#prerequisites)
  - [Guide](#guide)
- [Application Overview](#application-overview)
  - [Routes](#routes)
  - [API Communication](#api-communication)
  - [Data Persistence](#data-persistence)
  - [Styling](#styling)
- [Pages](#pages)
  - [Home](#home)
  - [Upload](#upload)
  - [Reports](#reports)
  - [Login](#login)
  - [Team](#team)
  - [About](#about)
- [Shared Components](#shared-components)
  - [Navbar](#navbar)
  - [Footer](#footer)
  - [ChatbotWidget](#chatbotwidget)

---

## Installation & Setup

### Prerequisites

To use the React/Vite frontend you should be familiar with:
- JavaScript / JSX
- HTML and CSS
- React component basics

To install the frontend on your local system you need:
- **Node.js** (LTS version recommended) — download from [nodejs.org](https://nodejs.org/en)
- **npm** — installed automatically with Node.js. Verify with `npm -v`.

### Guide

**1. Verify npm is installed:**

```bash
npm -v
```

If this errors, reinstall Node.js and ensure it is added to your PATH.

**2. Navigate to the frontend directory:**

```bash
cd apps/web-v1
```

**3. Install dependencies:**

```bash
npm install
```

This installs all packages listed in `package.json` and `package-lock.json`. It may take a minute to complete.

**4. Configure the API base URL (optional):**

Create a `.env` file inside `apps/web-v1/` if you need to override the default Flask backend URL:

```
VITE_API_BASE_URL=http://localhost:3720
```

If this variable is not set, the frontend defaults to `http://localhost:3720`.

**5. Start the development server:**

```bash
npm run dev
```

The terminal will display:
```
Local: http://localhost:5173/
```

Open that URL in your browser. The dev server hot-reloads on every file save.

**6. Build for production:**

```bash
npm run build
```

The compiled output goes to `apps/web-v1/dist/`. The Node.js server (`server.js` in legacy/v1-node/) serves this directory automatically when running in production mode.

### Key dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | UI framework |
| react-dom | 19.2.0 | DOM rendering |
| react-router-dom | 7.11.0 | Client-side routing |
| jspdf | 3.0.2 | PDF report generation |
| vite | 7.2.4 | Build tool with HMR |

---

## Application Overview

The frontend is a **React 19 single-page application (SPA)** built with Vite. Execution starts in `apps/web-v1/src/main.jsx`, which mounts the root `App` component inside a `BrowserRouter`:

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

`App.jsx` wraps all routes with the `Navbar`, `Footer`, and `ChatbotWidget` components so they appear on every page:

```jsx
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/upload"  element={<Upload />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/team"    element={<Team />} />
        <Route path="/about"   element={<About />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
```

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with hero section and call-to-action |
| `/upload` | `Upload` | Multi-image upload, patient intake form, risk results |
| `/reports` | `Reports` | Analysis history; doctor annotation mode |
| `/login` | `Login` | Register and login for patient and doctor accounts |
| `/team` | `Team` | Team member cards with flip animation |
| `/about` | `About` | Project description |
| `*` | Redirect | Any unknown path redirects to `/` |

---

### API Communication

All API calls use the browser `fetch()` API. There are no dedicated service files — each page component makes its own requests inline.

**API base URL resolution:**

```javascript
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3720"
).replace(/\/$/, "");
```

**Vite dev proxy** (configured in `vite.config.js`):

During local development the Vite server proxies `/api` and `/chat` to `http://localhost:3000` (the Node.js server):

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api":  { target: "http://localhost:3000", changeOrigin: true },
      "/chat": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
```

In production (or when `VITE_API_BASE_URL` is set) the full URL is used directly.

---

### Data Persistence

The frontend uses `localStorage` as its primary persistence layer (offline-first). All keys are namespaced to avoid collisions:

| Key | Content |
|-----|---------|
| `skinai_user` | Logged-in patient email |
| `skinai_role` | `"patient"` or `"doctor"` |
| `skinai_sid` | Session ID shared with the Flask chatbot |
| `skinai_upload_form` | Draft intake form fields (auto-saved on change) |
| `lastAnalysis` | Most recent analysis result from `/analyze_skin` |
| `skinai_reports_<email>` | Per-patient report history array |
| `skinai_doctor_notes` | Doctor note drafts keyed by report ID |

When the Flask backend is reachable, reports are also persisted to MongoDB via `POST /reports/save`. On load, `GET /reports` fetches the persisted history and merges it with localStorage.

---

### Styling

The application uses a dark theme with Purdue gold accents, implemented with plain CSS.

**CSS files:**

| File | Purpose |
|------|---------|
| `src/styles/styles.css` | Global styles: header, nav, forms, cards, hero section |
| `src/styles/upload.css` | Upload page: dropzone, image preview grid, form layout |
| `src/styles/chatbot.css` | ChatbotWidget: floating button, message bubbles, input area |

**Key CSS custom properties (defined in `styles.css`):**

```css
--bg:          #0a0a0a     /* Page background */
--panel:       #0e0e0e     /* Card / panel background */
--text:        #ededed     /* Primary text */
--muted:       #c9c9c9     /* Secondary text */
--gold:        #e0c98d     /* Primary accent (Purdue gold) */
--gold-strong: #c7a64a     /* Darker gold for hover states */
--border:      #1d1d1d     /* Border color */
--shadow:      0 12px 40px rgba(0,0,0,0.35)
```

---

## Pages

### Home

**File:** `apps/web-v1/src/pages/Home.jsx`

The landing page. Displays a full-width hero image with a title, brief project description, and a **Get Started** button that navigates to `/upload`.

Key elements:
- Hero image (`src/assets/hero.jpg`)
- Project tagline and disclaimer ("not a substitute for professional medical advice")
- CTA button linking to the Upload page

---

### Upload

**File:** `apps/web-v1/src/pages/Upload.jsx`

The primary feature page. Allows patients to upload skin lesion images and fill out a patient intake form, then displays the AI risk assessment.

#### Image upload

- Drag-and-drop or file picker (supports multiple files, max 20 images)
- Shows thumbnail previews for each uploaded image
- Supported formats: JPEG, JPG, PNG

#### Patient intake form

The form collects the following fields. All fields are optional but improve analysis accuracy:

| Field | Type | Description |
|-------|------|-------------|
| `name` | text | Patient name |
| `age` | number | Patient age |
| `sex_at_birth` | select | `M`, `F`, or `Other` |
| `fitzpatrickType` | select | Fitzpatrick skin type I–VI |
| `location` | text | Lesion body location (e.g., "back", "arm") |
| `duration_days` | number | How long the lesion has been present |
| `rapid_change` | checkbox | Lesion rapidly changing |
| `bleeding` | checkbox | Lesion bleeding |
| `itching` | checkbox | Lesion itching |
| `pain` | checkbox | Lesion painful |
| `medicalHistory` | textarea | Relevant medical history |
| `medications` | textarea | Current medications |
| `sunExposure` | select | Sun exposure level |

Form fields are auto-saved to `localStorage` under `skinai_upload_form` on every change.

#### Analysis flow

When the user submits:

1. Each image is sent to `POST /analyze_skin?sid=<sid>` as `multipart/form-data` along with the intake fields.
2. The response `risk_score`, `top_predictions`, and `explanation_summary` are stored in `localStorage` as `lastAnalysis`.
3. A custom DOM event `skinai:open` is dispatched to open the `ChatbotWidget`.
4. Another event `skinai:assistantMessage` fires with the `assistant_seed` text so the chatbot shows the analysis summary immediately.
5. Results are also saved to the backend via `POST /reports/save` and `POST /api/health-info`.

#### Risk display

Each image result shows:
- A color-coded risk badge (`high_risk` → red, `moderate_risk` → orange, `low_risk` → green, `clinician_review` → purple)
- The top 3 disease predictions with confidence percentages
- A patient-friendly description of the top predicted condition

#### PDF export

The user can download the analysis results as a PDF. The PDF is generated client-side using **jsPDF** and includes the risk assessment, top predictions, intake form summary, and a disclaimer.

---

### Reports

**File:** `apps/web-v1/src/pages/Reports.jsx`

Displays saved analysis reports. Behavior differs based on the user's role:

#### Patient mode (`skinai_role === "patient"`)

- Shows only reports belonging to the logged-in patient (`user_email`)
- Fetches from `GET /reports?user_email=<email>` and merges with `localStorage`
- Displays: date, risk score, top predictions, image thumbnails
- Shows doctor notes if a doctor has annotated the report

#### Doctor mode (`skinai_role === "doctor"`)

- Fetches all reports from `GET /reports` (no email filter)
- Provides a patient email filter dropdown to narrow results
- Allows adding or editing doctor notes via `POST /reports/note`
- Notes are saved optimistically to `localStorage` and persisted to the backend

#### Report card contents

Each report card shows:
- Patient email and analysis date
- Risk score badge
- Top disease predictions
- Doctor note (if any)
- A link to download the full report as PDF

---

### Login

**File:** `apps/web-v1/src/pages/Login.jsx`

Handles both new account registration and existing account login.

#### Registration

Submits `email` and `password` to `POST /api/auth/register`. On success, stores `skinai_user` and `skinai_role: "patient"` in localStorage and redirects to `/upload`.

#### Login

Submits credentials to `POST /api/auth/login`. On success, sets localStorage keys and redirects.

#### Doctor login

The doctor account is hardcoded on the frontend (no API call):
- **Email:** `doctor@skinai.com`
- **Password:** `doctor123`

When the doctor logs in, `skinai_role` is set to `"doctor"`, unlocking doctor-specific features in the Reports page.

#### Form validation

- Email must be a non-empty string with `@` character
- Password must be at least 6 characters
- Error messages display inline below the relevant field

---

### Team

**File:** `apps/web-v1/src/pages/Team.jsx`

Displays team member cards. Each card features:
- Front face: team member photo and name
- Back face: role description revealed on hover (CSS flip animation)

Team member photos are stored in `src/assets/` (`damianpic.jpeg`, `sripic.jpeg`, `savpic.jpeg`, `mannypic.jpeg`, `maddiepic.jpeg`).

---

### About

**File:** `apps/web-v1/src/pages/About.jsx`

Static informational page describing:
- The project goal (AI-assisted dermatology screening)
- The underlying technology (ResNet50, MYCIN expert system, Gemini)
- The dataset (HAM10000)
- A disclaimer about the tool's educational nature

---

## Shared Components

### Navbar

**File:** `apps/web-v1/src/components/Navbar.jsx`

Sticky header rendered on all pages. Contains:
- Application logo / name ("SkinAI")
- Navigation links: Home, Upload, Reports, Team, About
- User avatar or login button (reads `skinai_user` from localStorage)
- Logout button (clears localStorage keys and redirects to `/login`)

---

### Footer

**File:** `apps/web-v1/src/components/Footer.jsx`

Simple footer rendered on all pages. Displays copyright text and a project credit line. No interactive functionality.

---

### ChatbotWidget

**File:** `apps/web-v1/src/components/ChatbotWidget.jsx`

A floating AI chatbot ("Skinderella") that persists on every page. It integrates with the Flask `/chat` endpoint and is context-aware of the most recent analysis results.

#### UI

- A floating button in the bottom-right corner of the screen
- Clicking the button opens a chat panel with message history
- Input area supports text and optional image attachment
- Messages display with role-differentiated styling (user vs. assistant)

#### Session management

The chatbot shares the session ID (`skinai_sid`) with the Upload page. This means the chatbot has access to the analysis results seeded into the session by `/analyze_skin`.

```javascript
const sid = localStorage.getItem("skinai_sid") || crypto.randomUUID();
localStorage.setItem("skinai_sid", sid);
```

#### Sending a message

Each message is sent as `multipart/form-data` to `POST /chat?sid=<sid>`:

```javascript
const formData = new FormData();
formData.append("text", userMessage);
if (attachedImage) formData.append("image", attachedImage);
// Append any health data from localStorage
for (const [key, value] of Object.entries(healthData)) {
  formData.append(key, value);
}
fetch(`${API_BASE}/chat?sid=${sid}`, { method: "POST", body: formData });
```

#### Rate limit handling

If the backend returns `error_code: "RATE_LIMIT_DEBOUNCE"` or `"RATE_LIMIT_BURST"`, the widget displays the error message in the chat and enables a **Reset conversation** button. Clicking reset calls `POST /chat/reset?sid=<sid>` to clear the session history.

#### Cross-component communication

The widget listens for two custom DOM events:

| Event | Payload | Effect |
|-------|---------|--------|
| `skinai:open` | none | Opens the chat panel |
| `skinai:assistantMessage` | `{ text: string }` | Injects a message into the chat as if the assistant said it |

The Upload page dispatches these events after a completed analysis so the chatbot immediately shows the risk summary without the patient needing to type anything.

#### Image attachment

Users can attach an image to any chat message. The image is previewed inline before sending. The Flask chatbot receives it and can use it for context (e.g., asking follow-up questions about the image).
