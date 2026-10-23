# Google Cloud Deployment Guide

Your app has **two backend services**, each deployed as a separate Cloud Run service:

| Service | Dockerfile | Purpose |
| --- | --- | --- |
| `skinai-python` | `legacy/v1-flask/Dockerfile` | Python Flask – AI analysis & chatbot |
| `skinai-node` | `legacy/v1-node/Dockerfile.node` | Node.js – auth, MongoDB, image uploads + serves frontend |

---

## Prerequisites

1. **Google Cloud Project** — create one at https://console.cloud.google.com and note your `PROJECT_ID`

2. **Google Cloud CLI**
   ```bash
   # Install from: https://cloud.google.com/sdk/docs/install
   gcloud --version
   ```

3. **Authentication**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

---

## Step 1 — Deploy the Python service first

The Python service must be deployed first so its URL can be embedded into the frontend bundle.

```bash
# From the repo root
# Build Python image using cloudbuild.yaml, which points -f at
# legacy/v1-flask/Dockerfile (edit the image names in cloudbuild.yaml
# if you want them to say skinai-python instead of capstone)
gcloud builds submit --config cloudbuild.yaml .

# Deploy Python image to Cloud Run
gcloud run deploy skinai-python \
  --image gcr.io/YOUR_PROJECT_ID/capstone:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 600 \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY" \
  --max-instances 5
```

After it finishes, get the service URL:

```bash
gcloud run services describe skinai-python \
  --region us-central1 \
  --format "value(status.url)"
```

You'll get something like `https://skinai-python-xxxx-uc.a.run.app`. **Copy this URL — you need it in Step 2.**

---

## Step 2 — Deploy the Node.js + frontend service

The React frontend is built inside the Docker image, so `VITE_API_BASE_URL` must point to the Python URL from Step 1 **at build time**.

```bash
# From the repo root — replace the Python URL below
# Build Node image with Dockerfile.node through Cloud Build
gcloud builds submit \
  --config cloudbuild.node.yaml \
  --substitutions _IMAGE=gcr.io/YOUR_PROJECT_ID/skinai-node:latest,_PYTHON_URL=https://skinai-python-xxxx-uc.a.run.app

# Deploy Node image to Cloud Run
gcloud run deploy skinai-node \
  --image gcr.io/YOUR_PROJECT_ID/skinai-node:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 120 \
  --set-env-vars "MONGODB_URI=YOUR_MONGODB_URI,GEMINI_API_KEY=YOUR_GEMINI_API_KEY" \
  --max-instances 10
```

After deploy, the `skinai-node` URL is the address your users open in the browser.

---

## CORS — required after deploying Python

The browser calls the Python service directly (upload analysis, chatbot). Make sure the Python Flask app allows the Node service URL as an origin. In `legacy/v1-flask/src/expertSystem/app.py`, verify the CORS config includes the Node service URL or set it via an env var.

---

## Environment Variables Reference

| Variable | Service | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Python + Node | Google Gemini API key |
| `MONGODB_URI` | Node | MongoDB Atlas connection string |
| `GEMINI_MODEL` | Node (optional) | Defaults to `gemini-2.0-flash` |
| `VITE_API_BASE_URL` | Node (build arg) | Python service URL, baked into frontend at build time |

---

## Updating deployments

**Python only** (AI/chatbot changes):
```bash
gcloud builds submit --config cloudbuild.yaml .

gcloud run deploy skinai-python \
  --image gcr.io/YOUR_PROJECT_ID/capstone:latest \
  --region us-central1 \
  --set-env-vars "GEMINI_API_KEY=YOUR_GEMINI_API_KEY"
```

**Node + frontend** (UI or server changes):
```bash
gcloud builds submit \
  --config cloudbuild.node.yaml \
  --substitutions _IMAGE=gcr.io/YOUR_PROJECT_ID/skinai-node:latest,_PYTHON_URL=https://skinai-python-xxxx-uc.a.run.app

gcloud run deploy skinai-node \
  --image gcr.io/YOUR_PROJECT_ID/skinai-node:latest \
  --region us-central1 \
  --set-env-vars "MONGODB_URI=YOUR_MONGODB_URI,GEMINI_API_KEY=YOUR_GEMINI_API_KEY"
```

---

## Monitoring and Logs

```bash
# Python service logs
gcloud run services logs read skinai-python --region us-central1 --tail 50

# Node service logs
gcloud run services logs read skinai-node --region us-central1 --tail 50
```

Dashboard: https://console.cloud.google.com/run

---

## GitHub Actions (optional, automated CI/CD)

Add GitHub Secrets: `GCP_PROJECT_ID`, `GCP_SA_KEY` (service account JSON), `GEMINI_API_KEY`, `MONGODB_URI`.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: |
          gcloud builds submit --config cloudbuild.yaml .

          gcloud run deploy skinai-python \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/capstone:latest \
            --platform managed --region us-central1 \
            --allow-unauthenticated --memory 2Gi --timeout 600 \
            --project ${{ secrets.GCP_PROJECT_ID }} \
            --set-env-vars "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}"

  deploy-node:
    runs-on: ubuntu-latest
    needs: deploy-python
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      - run: |
          PYTHON_URL=$(gcloud run services describe skinai-python \
            --region us-central1 \
            --project ${{ secrets.GCP_PROJECT_ID }} \
            --format "value(status.url)")

          gcloud builds submit \
            --config cloudbuild.node.yaml \
            --substitutions _IMAGE=gcr.io/${{ secrets.GCP_PROJECT_ID }}/skinai-node:latest,_PYTHON_URL=${PYTHON_URL}

          gcloud run deploy skinai-node \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/skinai-node:latest \
            --platform managed --region us-central1 \
            --allow-unauthenticated --memory 1Gi \
            --project ${{ secrets.GCP_PROJECT_ID }} \
            --set-env-vars "MONGODB_URI=${{ secrets.MONGODB_URI }},GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}"
```

---

## Costs

- **Free tier**: 2 million requests/month, 360k GB-seconds/month
- **Beyond free**: ~$0.40 per million requests + compute time
- **Typical estimate**: ~$5–15/month for two services

---

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
