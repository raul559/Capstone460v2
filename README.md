# SkinAI Classifier (Capstone)

SkinAI Classifier is a demo web application designed to assist with the analysis of skin lesion images and provide AI-assisted conversational guidance. The system is intended for **educational and demonstration purposes only** and is **not a medical diagnosis tool**.

This project was developed as part of a Senior Capstone at Purdue University Fort Wayne.

---

## Tech Stack

- **Frontend:** React, Vite, React Router
- **Backend:** Python, Flask
- **AI Integration:** Google Gemini API
- **Styling:** Custom CSS (dark theme with gold accents)

---

## Project Structure

```
apps/
  mobile/        React Native (Expo) mobile app — active V2 development
  web-v1/        React/Vite web frontend (V1, served by legacy/v1-node)
legacy/
  v1-node/       Node/Express server: auth, image storage, serves apps/web-v1
  v1-flask/      Python/Flask API: ML inference, expert system, chatbot
services/        FastAPI backend for V2 (see docs/architecture)
intelligence/    V2 ML and expert-system modules (see docs/architecture)
tests/           V2 unit/integration/contract/regression tests
docs/
  architecture/  V2 architecture brief
  v1/            V1 implementation and deployment docs
scripts/         Repo-wide maintenance scripts
```

See `CLAUDE.md` and `docs/architecture/V2_ARCHITECTURE.md` for the full
rationale and the target V2 architecture.

---

## Features

- Image upload interface for skin lesion analysis
- AI-powered chatbot for guided interaction
- Session-based chat history
- Modular frontend and backend architecture

---

## Disease Trained On
akiec   - Actinic keratosis
bcc     - Basal cell carcinoma
bkl     - Benign keratosis
df      - Dermatofibroma
mel     - Melanoma
nv      - Melanocytic nevi
vasc    - Vascular lesions

## Running the Project

See **`RUN.md`** for step-by-step instructions on running the project locally.

---

⚠️ **Disclaimer:**  
This application is for demonstration and academic purposes only. It should not be used for real medical diagnosis or treatment decisions.
