# SkinAI V2 Development and Testing

**Path:** `docs/v2/DEVELOPMENT.md`

How to install, run, and test V2 locally. Coding rules and the list of required
checks live in [`CODING_STANDARDS.md`](CODING_STANDARDS.md).

## Install

Mobile app (Node 22):

```bash
cd apps/mobile
npm ci
```

API (Python 3.12 or later):

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Automated tests

| What | Command | Where tests live |
|---|---|---|
| Mobile unit tests | `npm test` in `apps/mobile` (`npm run test:watch` while coding) | `apps/mobile/__tests__/`, mirroring `src/` |
| API tests | `pytest` in `services/api` | `services/api/tests/` |

Mobile tests use Jest with the `jest-expo` preset. React Native Testing Library
is installed for component tests. Name test files `<module>.test.ts` or
`<module>.test.tsx`.

CI runs these on every pull request, together with lint and type checks.

The root `tests/` folder is only for tests that span projects, such as API
contract and ML or expert-system regression tests.

## Manual testing of the analysis flow

The mobile app still calls the V1 Flask backend (`POST /analyze_skin`) until the
V2 analysis endpoint exists. To test upload and results end to end, run V1
locally.

### 1. Make the model available

The V1 server loads
`back-end/src/models/resnet50_skin_disease_finetuned_v4.keras` from the
repository root. The model is about 200 MB and is not in Git. Link your local
copy into that path; `*.keras` files are gitignored, so the link cannot be
committed.

```bash
mkdir -p back-end/src/models
ln -s /path/to/resnet50_skin_disease_finetuned_v4.keras back-end/src/models/
```

### 2. Start the V1 backend on port 3720

The root `.env` sets `PORT=3000` for the V1 Node server, so set `BACKEND_PORT`
explicitly. The Python environment needs TensorFlow and Flask (the repository's
root `.venv` has both).

```bash
cd legacy/v1-flask/src
BACKEND_PORT=3720 python -m expertSystem.app
```

The first analysis takes a few seconds while the model loads. MongoDB and
Gemini are optional; `/analyze_skin` works without them.

### 3. Point the app at the backend

Create `apps/mobile/.env` (gitignored) with the address for your device:

| Running the app on | `EXPO_PUBLIC_API_URL` |
|---|---|
| Web browser on the same computer | `http://localhost:3720` |
| Android emulator | `http://10.0.2.2:3720` (also the default when unset) |
| Phone with Expo Go on the same Wi-Fi | `http://<computer LAN IP>:3720` |

For a phone, the computer's firewall must allow port 3720.

### 4. Start the app

```bash
cd apps/mobile
npx expo start --clear
```

Restart with `--clear` after changing `.env`, because Expo bakes
`EXPO_PUBLIC_*` values into the bundle.

### What to check

- Upload: pick an image, analyze, see the results screen.
- Camera: open the camera, take a photo, use it, analyze.
- Errors: stop the backend and analyze; an error message appears and no result
  is shown.
- Chat: send a message, use the feedback buttons.
- Account: switch light, dark, and system themes.

**Known limitation:** V1 has no image quality check, so any image, even a blank
one, gets a confident prediction. Do not treat results from test images as
meaningful. The V2 analysis endpoint adds a quality gate.
