# File: expertSystem/app.py
# Role: Flask web server for the demo + APIs.

# Linked to:
# - expertSystem/chat.py → imports ConvState and step(...) to run the intake chat at POST /chat
# - src/query.py        → imports search(...) for image kNN at POST /query (optional)
# - expertSystem/indexdemo.html → served at GET / as the minimal demo UI
# - data/HAM10000_images_part_1|2 → served via GET /ham/<image_id>.jpg

# Endpoints:
# - GET  /                    → indexdemo.html
# - POST /chat                → runs the Gemini intake assistant (chat only)
# - POST /query               → (optional) image similarity search using FAISS (if index exists)
# - GET  /ham/<image_id>.jpg  → serve dataset images
# - GET  /<path>              → serve other static front-end files (if present)

# Env:
# - GEMINI_API_KEY (required), GEMINI_MODEL (default: gemini-2.0-flash)
# - PORT (optional; defaults to 3720)

# Notes:
# - Keeps an in-memory session dict for chat state during dev.
# - Adds absolute image URLs in responses for convenience.


import os
import sys
from pathlib import Path
from dotenv import load_dotenv
# --- Static path to .env in project root ---
# Resolves from: expertSystem/app.py -> back-end/src/ -> back-end/ -> Capstone/
APP_DIR = Path(__file__).resolve().parent
BACK_END_SRC = APP_DIR.parent
BACK_END = BACK_END_SRC.parent
PROJECT_ROOT = BACK_END.parent
ENV_FILE = PROJECT_ROOT / ".env"

# Load environment variables FIRST from explicit path, before any imports that need them
if ENV_FILE.exists():
    load_dotenv(str(ENV_FILE))
    print(f"[env] Loaded from {ENV_FILE}")
else:
    print(f"[env] WARNING: .env not found at {ENV_FILE}, using system env")
    load_dotenv()

from typing import Dict
from flask import Flask, request, jsonify, send_from_directory
from PIL import Image, ImageOps
from expertSystem.chat import ConvState, step as chat_step
import time
from collections import deque
from datetime import datetime

try:
    from bson import ObjectId
except Exception:
    ObjectId = None

# ---------- Chatbot wiring ----------

# hold per-session state in memory for dev; switch to a store later
_SESS: Dict[str, ConvState] = {}
_LAST_REQUEST: Dict[str, float] = {}
# Keep recent request timestamps per session for sliding-window rate limiting
_REQ_TIMES: Dict[str, deque] = {}

# Rate limit settings (configurable via env)
# Minimum seconds between consecutive requests from same session (debounce)
CHAT_MIN_INTERVAL = float(os.getenv("CHAT_MIN_INTERVAL", "1.0"))
# Maximum allowed requests per minute per session
CHAT_MAX_PER_MINUTE = int(os.getenv("CHAT_MAX_PER_MINUTE", "20"))
# --- Project roots & import path setup ---
ROOT = BACK_END
SRC_DIR = os.path.join(ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

# Import after sys.path is prepared

FRONT_DIR = os.path.join(ROOT, "front-end")
DATA_DIR = os.path.join(ROOT, "data")
EXP_DIR = os.path.join(ROOT, "expertSystem")


app = Flask(__name__, static_folder=FRONT_DIR, static_url_path="")

from flask_cors import CORS

CORS(app)

# --- MongoDB client for reports storage (optional) ---
mongo_client = None
reports_coll = None
health_info_coll = None
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
if MONGO_URI:
    try:
        from pymongo import MongoClient

        mongo_client = MongoClient(MONGO_URI)
        reports_coll = mongo_client.get_database("skin-images").get_collection(
            "reports"
        )
        health_info_coll = mongo_client.get_database("patientInfo").get_collection(
            "healthInfo"
        )
        print("[mongo] reports collection ready")
        print("[mongo] healthInfo collection ready")
    except Exception as e:
        print("[mongo] could not connect:", e)


def _strip_exif(img: Image.Image) -> Image.Image:
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    out = Image.new(img.mode, img.size)
    out.putdata(list(img.getdata()))
    
    
    return out


@app.get("/")
def index():
    return send_from_directory(FRONT_DIR, "index.html")


#   to run demo code:
#   return send_from_directory(EXP_DIR, "indexdemo.html")  # <- fixed indent


@app.get("/ham/<image_id>.jpg")
def ham(image_id: str):
    for sub in ("HAM10000_images_part_1", "HAM10000_images_part_2"):
        folder = os.path.join(DATA_DIR, sub)
        path = os.path.join(folder, f"{image_id}.jpg")
        if os.path.exists(path):
            return send_from_directory(folder, f"{image_id}.jpg")
    return jsonify(error=f"{image_id} not found"), 404


@app.post("/query")
def do_query():
    from query import search  # noqa: E402

    if "image" not in request.files:
        return jsonify(error="image file required (field name: 'image')"), 400
    f = request.files["image"]
    if not f.filename:
        return jsonify(error="empty filename"), 400
    try:
        img = Image.open(f.stream).convert("RGB")
        img = _strip_exif(img)
    except Exception as e:
        return jsonify(error=f"failed to read image: {e}"), 400

    out = search(img, dict(request.form.items()), top_k=5)

    # Add relative + absolute URLs to each result (handy for external front-ends)
    base = request.host_url.rstrip("/")  # e.g., http://127.0.0.1:5000
    for r in out.get("results", []) or []:
        rel = f"/ham/{r['image_id']}.jpg"
        r["url"] = rel
        r["abs_url"] = f"{base}{rel}"

    return jsonify(out)

def _analysis_to_chat_message(pipeline_result: dict) -> str:
    seed = pipeline_result.get("explanation_seed", {}) or {}
    topk = pipeline_result.get("ml", {}).get("topK", []) or []

    primary = (seed.get("primary_result") or "unknown").replace("_", " ")
    disclaimer = seed.get(
        "disclaimer",
        "This is not medical advice. This is a preliminary AI-assisted analysis."
    )

    preds = ", ".join(
        [f"{p['label']}: {p['prob']:.4f}" for p in topk]
    )

    return (
        f"{disclaimer}\n\n"
        f"Preliminary result: {primary}\n"
        f"Top predictions: {preds}"
    )

@app.post("/analyze_skin")
def analyze_skin():
    from keras_predictor import KerasResNetPredictor
    from expert_pipeline import run_expert_pipeline  # noqa: E402
    from expertSystem.disease_prediction import build_expert_fusion_output

    """
    Endpoint: POST /analyze_skin
    Required fields:
    - image (file): skin lesion image
    - age (int, optional)
    - sex_at_birth (str, optional): M/F/other
    - location (str, optional): lesion location
    - duration_days (int, optional)
    - rapid_change (bool, optional)
    - bleeding (bool, optional)
    - itching (bool, optional)
    - pain (bool, optional)

    Returns JSON with:
    - top_predictions: [{'label': 'mel', 'confidence': 0.62}, ...]
    - risk_score: 'high_risk' | 'moderate_risk' | 'low_risk'
    - explanation_summary: structured data for Gemini
    - follow_up_questions: array of suggested questions (from Gemini chat)
    """
    try:
        # Get image
        if "image" not in request.files:
            return jsonify(error="image file required (field name: 'image')"), 400
        f = request.files["image"]
        if not f.filename:
            return jsonify(error="empty filename"), 400

        image_bytes = f.read()

        # Extract patient intake fields
        upload_fields = {
            "age": request.form.get("age"),
            "sex_at_birth": request.form.get("sex_at_birth"),
            "location": request.form.get("location"),
            "duration_days": request.form.get("duration_days"),
        }
        

        # Extract chat/symptom flags
        chat_flags = {
            "rapid_change": request.form.get("rapid_change"),
            "bleeding": request.form.get("bleeding"),
            "itching": request.form.get("itching"),
            "pain": request.form.get("pain"),
        }

        # Run the expert pipeline
        pipeline_result = run_expert_pipeline(
            image_bytes=image_bytes,
            upload_fields=upload_fields,
            chat_flags=chat_flags,
            predictor=KerasResNetPredictor(),  
        )
        # ---- Seed chatbot with analysis explanation ----
        sid = request.args.get("sid") or request.form.get("sid") or "demo"
        st = _SESS.get(sid) or ConvState()

        chat_message = _analysis_to_chat_message(pipeline_result)

        # Seed canonical classifier probabilities into session state so later /chat turns
        # can keep image-informed predictions even if model_topk is not resent.
        topk_seed = (pipeline_result.get("ml", {}) or {}).get("topK", []) or []
        clf_seed = {}
        for p in topk_seed:
            if not isinstance(p, dict):
                continue
            key = str(p.get("label") or "").strip().lower()
            if not key:
                continue
            try:
                clf_seed[key] = float(p.get("prob", p.get("confidence", 0.0)) or 0.0)
            except Exception:
                continue
        if clf_seed:
            st.slots["classifier_probs"] = clf_seed

        # Seed intake fields when available for better continuity across chat turns.
        if upload_fields.get("location"):
            st.slots["body_site"] = upload_fields.get("location")
        if upload_fields.get("age") not in (None, ""):
            try:
                st.slots["patient_age"] = float(upload_fields.get("age"))
            except Exception:
                pass

        st.history.append({
            "role": "model",
            "parts": [{"text": chat_message}]
        })

        _SESS[sid] = st

        # Extract and structure the response
        topk = pipeline_result["ml"]["topK"]
        reasoning = pipeline_result["reasoning"]
        explanation_seed = pipeline_result["explanation_seed"]

        # Format top predictions with confidence scores
        top_predictions = [
            {"label": pred["label"], "confidence": round(pred["prob"], 3)}
            for pred in topk
        ]

        # Determine risk score
        risk_score = reasoning["primary_result"]

        # Derive CF score from the winning risk flag
        _facts = reasoning.get("facts", {})
        _cf_map = {
            "high_risk": "high_risk_flag",
            "moderate_risk": "moderate_risk_flag",
            "low_risk": "low_risk_flag",
            "clinician_review": "needs_clinician_review",
        }
        certainty_factor = round(float(_facts.get(_cf_map.get(risk_score, ""), 0.0) or 0.0), 4)

        # Build response
        response = {
            "top_predictions": top_predictions,
            "risk_score": risk_score,
            "certainty_factor": certainty_factor,
            "explanation_summary": explanation_seed,
            # include the assistant-friendly explanation text that was seeded into the session
            "assistant_seed": chat_message,
            "follow_up_questions": [
                "Has this lesion been changing in size or color?",
                "Do you have a family history of skin cancer?",
                "When did you first notice this lesion?",
            ],
            "_debug": {
                "reasoning_facts": reasoning["facts"],
                "reasoning_trace": reasoning["trace"],
            },
        }

        return jsonify(response)

    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(error=f"Analysis failed: {str(e)}"), 500



@app.post("/reports/save")
def save_report():
    """Save analysis JSON to MongoDB. Accepts JSON body with analysis and metadata."""
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify(error="JSON body required"), 400

        if reports_coll is None:
            return jsonify(error="Reports storage not configured"), 503

        user_email = (
            str(
                payload.get("user_email")
                or payload.get("userEmail")
                or (payload.get("input", {}) or {}).get("user_email")
                or (payload.get("input", {}) or {}).get("userEmail")
                or ""
            )
            .strip()
            .lower()
        )
        if not user_email:
            return jsonify(error="user_email is required"), 400

        payload["user_email"] = user_email
        payload.setdefault("input", {})
        if isinstance(payload["input"], dict):
            payload["input"]["user_email"] = user_email

        # attach timestamp
        payload["createdAt"] = (
            payload.get("createdAt")
            or __import__("datetime").datetime.utcnow().isoformat()
        )
        res = reports_coll.insert_one(payload)
        return jsonify({"report_id": str(res.inserted_id)})
    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(error=str(e)), 500


@app.post("/api/health-info")
def save_health_info():
    """Save intake health information to patientInfo.healthInfo."""
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify(error="JSON body required"), 400

        if health_info_coll is None:
            return jsonify(error="Health info storage not configured"), 503

        patient_email = (
            str(
                payload.get("patientEmail")
                or payload.get("patient_email")
                or (payload.get("healthInfo", {}) or {}).get("patientEmail")
                or (payload.get("healthInfo", {}) or {}).get("patient_email")
                or ""
            )
            .strip()
            .lower()
        )
        if not patient_email:
            return jsonify(error="patientEmail is required"), 400

        health_info = payload.get("healthInfo")
        if not isinstance(health_info, dict):
            return jsonify(error="healthInfo object is required"), 400

        doc = {
            "patientEmail": patient_email,
            "healthInfo": health_info,
            "analysisMeta": payload.get("analysisMeta")
            if isinstance(payload.get("analysisMeta"), dict)
            else {},
            "source": payload.get("source") or "upload-page",
            "createdAt": payload.get("createdAt")
            or __import__("datetime").datetime.utcnow().isoformat(),
        }

        res = health_info_coll.insert_one(doc)
        return jsonify({"healthInfoId": str(res.inserted_id)})
    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(error=str(e)), 500


@app.get("/reports")
def list_reports():
    try:
        if reports_coll is None:
            return jsonify([])

        user_email = str(request.args.get("user_email") or "").strip().lower()
        query = {}
        if user_email:
            query["user_email"] = user_email

        docs = list(reports_coll.find(query).sort("createdAt", -1).limit(100))
        out = []
        for d in docs:
            d["id"] = str(d.pop("_id"))
            out.append(d)
        return jsonify(out)
    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(error=str(e)), 500


@app.post("/reports/note")
def update_report_note():
    try:
        if reports_coll is None:
            return jsonify(error="Reports storage not configured"), 503

        payload = request.get_json(force=True) or {}
        report_id = str(payload.get("report_id") or "").strip()
        doctor_note = str(payload.get("doctor_note") or "")
        doctor_email = str(payload.get("doctor_email") or "doctor@skinai.com").strip().lower()

        if not report_id:
            return jsonify(error="report_id is required"), 400

        update_doc = {
            "$set": {
                "doctor_note": doctor_note,
                "doctor_note_by": doctor_email,
                "doctor_note_updated_at": datetime.utcnow().isoformat(),
            }
        }

        if ObjectId is not None:
            try:
                result = reports_coll.update_one({"_id": ObjectId(report_id)}, update_doc)
            except Exception:
                result = reports_coll.update_one({"id": report_id}, update_doc)
        else:
            result = reports_coll.update_one({"id": report_id}, update_doc)

        if result.matched_count == 0:
            return jsonify(error="Report not found"), 404

        return jsonify({"ok": True})
    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify(error=str(e)), 500


# Serve other front-end files (about.html, upload.html, team.html, etc.)
@app.get("/<path:path>")
def static_pages(path):
    try:
        return send_from_directory(FRONT_DIR, path)
    except Exception:
        return send_from_directory(FRONT_DIR, "index.html")




@app.post("/chat")
def chat():
    try:
        sid = request.args.get("sid", "demo")  # TODO: real session id later
        st = _SESS.get(sid) or ConvState()

        # --- simple per-session debounce/rate-limit ---
        now = time.time()
        last = _LAST_REQUEST.get(sid)
        if last is not None and (now - last) < CHAT_MIN_INTERVAL:
            wait = CHAT_MIN_INTERVAL - (now - last)
            msg = (
                f"You're sending messages too quickly. Please wait {wait:.1f}s and try again."
            )
            print(f"[CHAT][rate] Debounce: sid={sid} wait={wait:.2f}s")
            return (
                jsonify({
                    "reply": msg,
                    "message": "Rate limit: debounce",
                    "assistant": "[Slow down]",
                    "text": msg,
                    "error_code": "RATE_LIMIT_DEBOUNCE",
                }),
                200,
            )

        # sliding window per-minute counter
        dq = _REQ_TIMES.get(sid)
        if dq is None:
            dq = deque()
            _REQ_TIMES[sid] = dq
        # purge older than 60s
        cutoff = now - 60
        while dq and dq[0] < cutoff:
            dq.popleft()
        if len(dq) >= CHAT_MAX_PER_MINUTE:
            msg = (
                "Too many requests from this session in the last minute. Please wait a bit."
            )
            print(f"[CHAT][rate] Sliding-window limit exceeded: sid={sid} count={len(dq)}")
            return (
                jsonify({
                    "reply": msg,
                    "message": "Rate limit: burst",
                    "assistant": "[Try later]",
                    "text": msg,
                    "error_code": "RATE_LIMIT_BURST",
                }),
                200,
            )
        # record this request
        dq.append(now)
        _LAST_REQUEST[sid] = now

        # read text and image from upload form
        user_text = request.form.get("text")
        img_file = request.files.get("image")

        img = None
        if img_file and img_file.filename:
            img = Image.open(img_file.stream).convert("RGB")

        # capture all other metadata from the intake form
        metadata = {k: v for k, v in request.form.items() if k not in ("text",)}
        print("[CHAT] Session:", sid)
        print("[CHAT] Metadata received:", metadata)
        print("[CHAT] Text:", user_text)
        print("[CHAT] Image received:", bool(img))
        print(f"[CHAT] History size before: {len(st.history)} messages")

        #   call AI logic
        try:
            out = chat_step(st, user_text, img, metadata)
        except Exception as e:
            error_str = str(e)
            # Detect 429 (Resource exhausted / rate limit) errors
            if "429" in error_str or "Resource exhausted" in error_str:
                print(
                    f"[CHAT] 429 Resource exhausted (history size: {len(st.history)})"
                )
                print(f"[CHAT] Consider reducing context or using a faster model.")
                out = {
                    "reply": "The AI service is temporarily overloaded. Please wait a moment and try again.",
                    "message": "Service overloaded (429)",
                    "assistant": "[Retry later]",
                    "text": "[Service busy]",
                    "error_code": "RATE_LIMIT",
                }
            else:
                raise

        _SESS[sid] = st
        print(f"[CHAT] History size after: {len(st.history)} messages")

        # When the chatbot has enough information and produces a report bubble,
        # compute the full CF score from all collected session slots.
        if out.get("bubble_type") == "report":
            try:
                from skinai_analyzer import analyze_skin_lesion  # noqa: E402

                slots = st.slots or {}
                clf_probs = slots.get("classifier_probs") or {}
                topk = sorted(
                    [{"label": k, "prob": float(v)} for k, v in clf_probs.items() if v],
                    key=lambda x: x["prob"],
                    reverse=True,
                )[:3]

                intake = {
                    "rapid_change": bool(slots.get("rapid_change")),
                    "bleeding": bool(slots.get("bleeding")),
                    "itching": (float(slots.get("itching_0_10") or 0)) > 0,
                    "pain": (float(slots.get("pain_0_10") or 0)) > 0,
                }

                if topk:
                    reasoning = analyze_skin_lesion(topk, intake)
                    facts = reasoning.get("facts", {})
                    primary = reasoning.get("primary_result", "low_risk")
                    _cf_map = {
                        "high_risk": "high_risk_flag",
                        "moderate_risk": "moderate_risk_flag",
                        "low_risk": "low_risk_flag",
                        "clinician_review": "needs_clinician_review",
                    }
                    out["certainty_factor"] = round(
                        float(facts.get(_cf_map.get(primary, ""), 0.0) or 0.0), 4
                    )
                    out["cf_risk_level"] = primary
            except Exception as _cf_err:
                print(f"[CHAT] CF computation failed: {_cf_err}")

        # add absolute URLs for any image results
        out["metadata"] = metadata

        # add absolute URLs for any image results
        base = request.host_url.rstrip("/")
        for r in out.get("results", []) or []:
            image_id = r.get("image_id")
            if image_id:  # guard in case field missing
                rel = f"/ham/{image_id}.jpg"
                r["url"] = rel
                r["abs_url"] = f"{base}{rel}"

        return jsonify(out)

    except Exception as e:
        # Log full traceback to console for debugging
        import traceback

        traceback.print_exc()
        msg = f"Server error: {e}"
        # Keep 200 so the frontend can render the message in the chat bubble
        return (
            jsonify({"reply": msg, "message": msg, "assistant": msg, "text": msg}),
            200,
        )

        return jsonify(out)


@app.post("/chat/reset")
def chat_reset():
    """Explicitly reset a conversation session (clear history to recover from rate limits)."""
    try:
        sid = request.args.get("sid")
        if sid and sid in _SESS:
            old_size = len(_SESS[sid].history)
            _SESS[sid] = ConvState()
            print(f"[CHAT] Reset session {sid} (cleared {old_size} messages)")
            return jsonify({"message": "Chat session reset", "sid": sid})
        else:
            return jsonify({"message": "Session not found or already cleared"}), 404
    except Exception as e:
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Use BACKEND_PORT if set, else PORT, else default to 3720
    port = int(os.getenv("BACKEND_PORT") or os.getenv("PORT") or 3720)
    print(f"[app] Starting Flask on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)
