
//VITE_API_BASE_URL=http://localhost:3000   add to .env
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/upload.css";

const LOGIN_GATE_DELAY_MS = 1000;

function getLoggedInUser() {
  try {
    const raw = (localStorage.getItem("skinai_user") || "").trim();
    if (!raw || raw === "null" || raw === "undefined") {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const DISEASE_LABELS = {
  akiec: "Actinic keratoses and intraepithelial carcinoma (Bowen disease)",
  bcc: "Basal cell carcinoma",
  bkl: "Benign keratosis (seborrheic keratosis, lichen planus-like keratosis)",
  df: "Dermatofibroma",
  mel: "Melanoma",
  nv: "Melanocytic nevus",
  vasc: "Vascular lesion (angioma, angiokeratoma, hemorrhage)",
};

const DISEASE_DESCRIPTIONS = {
  akiec: "A skin condition caused by years of sun exposure, appearing as rough, scaly patches on areas like the face, scalp, or hands. They may be pink, red, or brown and feel like sandpaper. A small number can develop into skin cancer if left untreated.",
  bcc: "The most common type of skin cancer, growing slowly on the outer skin layer. It often looks like a shiny or waxy bump, a flat skin-colored spot, or a sore that bleeds and scabs. It rarely spreads but should be treated to prevent damage to surrounding skin.",
  bkl: "Non-cancerous skin growths that appear as waxy, wart-like, or stuck-on brown to black patches. They are harmless but can look concerning due to their dark appearance. They can be removed if irritated or for cosmetic reasons.",
  df: "A harmless skin bump that feels firm and rubbery just under the surface. Usually appears on the lower legs as a small brownish to reddish bump that may dimple inward when pinched. Typically requires no treatment.",
  mel: "The most dangerous form of skin cancer. Often looks like a mole that changes in size, shape, or color — typically uneven shaped with irregular borders and multiple shades of brown, black, red, or blue. Early detection is critical as it can spread rapidly to other parts of the body.",
  nv: "A common mole that appears as a small, well-defined brown or tan spot on the skin. Most are stable and harmless throughout life. However, any changes in size, shape, color, or texture should be checked by a doctor.",
  vasc: "Harmless growths caused by blood vessels close to the skin surface. They typically appear as red, purple, or blue spots or raised bumps. Most require no treatment but can be removed if they bleed easily or for cosmetic reasons.",
};

const FITZPATRICK_COLORS = {
  I:   "#fde8d8",
  II:  "#f5cba7",
  III: "#e0a882",
  IV:  "#c68642",
  V:   "#8d5524",
  VI:  "#4a2912",
};

const FITZPATRICK_OPTIONS = [
  { value: "I",   label: "I — Very fair" },
  { value: "II",  label: "II — Fair" },
  { value: "III", label: "III — Medium" },
  { value: "IV",  label: "IV — Olive" },
  { value: "V",   label: "V — Brown" },
  { value: "VI",  label: "VI — Dark brown" },
];

function normalizeLabel(label) {
  if (!label) return "Unknown";
  const raw = String(label).trim();
  const key = raw.toLowerCase();
  if (DISEASE_LABELS[key]) return DISEASE_LABELS[key];
  return raw;
}

function predictionDescription(label) {
  if (!label) return "";
  const key = String(label).trim().toLowerCase();
  if (DISEASE_DESCRIPTIONS[key]) return DISEASE_DESCRIPTIONS[key];

  const normalized = normalizeLabel(label).toLowerCase();
  const matchKey = Object.keys(DISEASE_LABELS).find(
    (abbr) => DISEASE_LABELS[abbr].toLowerCase() === normalized,
  );
  if (matchKey && DISEASE_DESCRIPTIONS[matchKey]) {
    return DISEASE_DESCRIPTIONS[matchKey];
  }

  return "Consider a clinician review to confirm and correlate clinically.";
}

function fmtPct(x) {
  return (x * 100).toFixed(1) + "%";
}

function nextStepForRisk(riskScore) {
  const score = String(riskScore || "").toLowerCase();
  if (score === "high_risk" || score === "high") {
    return "Schedule an urgent dermatology visit and avoid delays.";
  }
  if (score === "moderate_risk" || score === "moderate") {
    return "Book a dermatology appointment within the next few weeks.";
  }
  if (score === "low_risk" || score === "low") {
    return "Monitor for changes and practice sun protection; see a clinician if it changes.";
  }
  return "Seek medical advice if you are concerned or notice changes.";
}

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // { name, url }[]
  const [form, setForm] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("skinai_upload_form") || "null");
      if (saved && typeof saved === "object") return { ...saved, consent: false };
    } catch {}
    return {
      name: "", age: "", sex: "", skinType: "", location: "", duration: "",
      primarySymptoms: [], medicalBackground: "", familyHistory: "",
      sunExposure: "", spfUse: "", currentMedications: "", consent: false,
    };
  });

  useEffect(() => {
  try {
    localStorage.setItem("skinai_upload_form", JSON.stringify(form));
  } catch {}
}, [form]); 

  
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3720").replace(/\/$/, "");
  const sid = useMemo(() => getCurrentSid(), []);
  
  // Persistent session id (shared with chatbot widget)
function getCurrentSid() {
  try {
    let existing = localStorage.getItem("skinai_sid");
    if (!existing) {
      existing = "sid_" + Math.random().toString(36).substring(2);
      localStorage.setItem("skinai_sid", existing);
    }
    return existing;
  } catch {
    return "sid_" + Math.random().toString(36).substring(2);
  }
}

  const [skinTypeOpen, setSkinTypeOpen] = useState(false);
  const skinTypeRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (skinTypeRef.current && !skinTypeRef.current.contains(e.target)) {
        setSkinTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [otherSymptom, setOtherSymptom] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [result, setResult] = useState(null); // demo result object
  const [userEmail, setUserEmail] = useState(getLoggedInUser);
  const [showLoginGate, setShowLoginGate] = useState(false);

  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Partial reset on mount: keep identity fields, clear lesion-specific fields and results
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      location: "",
      duration: "",
      primarySymptoms: [],
      medicalBackground: "",
      familyHistory: "",
      sunExposure: "",
      spfUse: "",
      currentMedications: "",
      consent: false,
    }));
    setOtherSymptom("");
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setFormMsg("");
    setAiMsg("");
  }, []);

  useEffect(() => {
    const syncUser = () => setUserEmail(getLoggedInUser());

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  useEffect(() => {
    if (userEmail) {
      setShowLoginGate(false);
      return;
    }

    const timerId = setTimeout(() => {
      setShowLoginGate(true);
    }, LOGIN_GATE_DELAY_MS);

    return () => clearTimeout(timerId);
  }, [userEmail]);

  // Build object URLs for previews (and clean them up)
  useEffect(() => {
    if (files.length === 0) return;
    const next = files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setPreviews(next);

    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);


  const canAnalyze = useMemo(() => {
    const requiredFilled =
      form.name.trim() &&
      String(form.age).trim() &&
      form.sex &&
      form.skinType &&
      form.location.trim() &&
      String(form.duration).trim();

    return Boolean(requiredFilled && form.consent && files.length > 0);
  }, [form, files]);

  function acceptFiles(fileList) {
    if (!userEmail) {
      setShowLoginGate(true);
      setFormMsg("Must be logged in to upload image.");
      return;
    }

    if (!fileList) return;

    const picked = Array.from(fileList).filter((f) =>
      ["image/jpeg", "image/png"].includes(f.type),
    );

    if (picked.length === 0) {
      setFormMsg("Please upload JPG or PNG images.");
      return;
    }

    setFiles((prev) => {
      const combined = [...prev, ...picked];
      
      if (combined.length > 20) {
        setFormMsg(`Maximum 20 images allowed (${prev.length} already selected, ${picked.length} new).`);
        return prev;
      }
      
      setFormMsg("");
      setResult(null);
      return combined;
    });
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    acceptFiles(e.dataTransfer.files);
  }

  function onBrowse() {
    if (!userEmail) {
      setShowLoginGate(true);
      return;
    }
    fileInputRef.current?.click();
  }

  function deleteImage(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  }

  function toggleSymptom(symptom) {
    setForm((prev) => ({
      ...prev,
      primarySymptoms: prev.primarySymptoms.includes(symptom)
        ? prev.primarySymptoms.filter((s) => s !== symptom)
        : [...prev.primarySymptoms, symptom],
    }));
    setResult(null);
  }

  function clearAll() {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setFormMsg("");
    setOtherSymptom("");
    setForm({
      name: "", age: "", sex: "", skinType: "", location: "", duration: "",
      primarySymptoms: [], medicalBackground: "", familyHistory: "",
      sunExposure: "", spfUse: "", currentMedications: "", consent: false,
    });
    try {
      localStorage.removeItem("lastAnalysis");
      localStorage.removeItem("skinai_upload_form");
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e) {
    
    e.preventDefault();

    if (!userEmail) {
      setShowLoginGate(true);
      setFormMsg("Must be logged in to upload image.");
      return;
    }

    if (!canAnalyze) {
      setFormMsg(
        "Please complete required fields, consent, and add at least 1 image.",
      );
      return;
    }

    setFormMsg("Analyzing...");
    setAiMsg("");
    setAiLoading(false);

    try {
      // 1️⃣ Analyze images (Flask)
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        // include page so backend/chat won't KeyError
        formData.append("page", "upload");

        // symptom flags derived from the intake form (drive CF score)
        formData.append("rapid_change", String(form.primarySymptoms.includes("Rapid change")));
        formData.append("bleeding", String(form.primarySymptoms.includes("Bleeding")));
        formData.append("itching", String(form.primarySymptoms.includes("Itching")));
        formData.append("pain", String(form.primarySymptoms.includes("Pain")));

        // intake fields
        formData.append("name", form.name);
        formData.append("age", String(form.age));
        formData.append("sex", form.sex);
        formData.append("skinType", form.skinType);
        formData.append("location", form.location);
        formData.append("duration_days", String(form.duration));
        formData.append("primarySymptoms", form.primarySymptoms.join(", "));
        formData.append("medicalBackground", form.medicalBackground);
        formData.append("familyHistory", form.familyHistory);
        formData.append("sunExposure", form.sunExposure);
        formData.append("spfUse", form.spfUse);
        formData.append("currentMedications", form.currentMedications);
        formData.append("consent", String(form.consent));
        formData.append("uploadDate", new Date().toISOString());

        const response = await fetch(`${API_BASE}/analyze_skin?sid=${encodeURIComponent(sid)}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let msg = `Failed to analyze ${file.name}`;
          try {
            const errJson = await response.json();
            msg = errJson.error || msg;
          } catch { }
          throw new Error(msg);
        }

        return await response.json();
      });

      // ⬅️ IMPORTANT: Promise.all happens OUTSIDE the map
      const results = await Promise.all(uploadPromises);

      const now = new Date();
      const meta = `${results.length} image(s) analyzed • ${now.toLocaleString()}`;
      const first = results[0];
      if (!first) throw new Error("No analysis results returned.");

      const healthInfoPayload = {
        patientEmail: userEmail,
        source: "upload-page",
        healthInfo: {
          name: form.name,
          age: form.age,
          sex: form.sex,
          skinType: form.skinType,
          location: form.location,
          duration_days: form.duration,
          primarySymptoms: form.primarySymptoms,
          medicalBackground: form.medicalBackground,
          familyHistory: form.familyHistory,
          sunExposure: form.sunExposure,
          spfUse: form.spfUse,
          currentMedications: form.currentMedications,
          consent: form.consent,
        },
        analysisMeta: {
          uploadCount: results.length,
          topPrediction: first.top_predictions?.[0]?.label || null,
          riskScore: first.risk_score || null,
          analyzedAt: new Date().toISOString(),
        },
      };

      try {
        const healthSaveTargets = [
          `${API_BASE}/api/health-info`,
          "/api/health-info",
        ];
        let healthSaved = false;
        let lastHealthSaveError = "";

        for (const target of healthSaveTargets) {
          try {
            const response = await fetch(target, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(healthInfoPayload),
            });

            if (response.ok) {
              healthSaved = true;
              break;
            }

            const errText = await response.text();
            lastHealthSaveError = `${target} -> ${response.status} ${errText}`;
          } catch (targetError) {
            lastHealthSaveError = `${target} -> ${targetError?.message || "request failed"}`;
          }
        }

        if (!healthSaved) {
          console.warn("Could not save patient health info", lastHealthSaveError);
        }
      } catch (saveHealthInfoError) {
        console.warn("Could not save patient health info", saveHealthInfoError);
      }

      // If backend returned the seeded assistant explanation, dispatch it into the chat widget
      try {
        const seedText = first.assistant_seed || first.explanation_summary?.text || "";
        if (seedText) {
          console.debug(
            "[Upload] Dispatching assistant seed to chatbot widget:",
            seedText.substring(0, 100)
          );
          const dispatched = window.dispatchEvent(
            new CustomEvent("skinai:assistantMessage", {
              detail: String(seedText),
              bubbles: true,
              composed: true,
            })
          );
          console.debug("[Upload] dispatchEvent returned:", dispatched);
          window.dispatchEvent(
            new CustomEvent("skinai:open", { bubbles: true, composed: true })
          );
        } else {
          console.warn("[Upload] No assistant_seed found in response");
        }
      } catch (e) {
        console.warn("Could not dispatch assistant seed", e);
      }

      // Normalize new pipeline response into the shape the UI expects
      // n response shape: { top_predictions, risk_score, explanation_summary }
      const normalized = {};
      
      // Store ALL results, not just the first
      normalized.all_results = results.map((result, idx) => ({
        imageIndex: idx,
        primary_result: result.risk_score ?? null,
        cf_score: result.certainty_factor ?? null,
        key_indicators: {
          high_risk_flag: (result.risk_score || "").toLowerCase() === "high_risk",
          moderate_risk_flag: (result.risk_score || "").toLowerCase() === "moderate_risk",
          low_risk_flag: (result.risk_score || "").toLowerCase() === "low_risk",
          needs_clinician_review: (result.risk_score || "").toLowerCase() === "high_risk",
        },
        model_topk: (result.top_predictions || []).map((p) => ({
          label: p.label,
          prob: p.confidence ?? p.prob ?? 0,
        })),
        facts: result.explanation_summary?.facts || result.explanation_summary || {},
        trace: result.explanation_summary?.trace || [],
      }));
      
      // Keep backward compatibility with "primary" for first image
      normalized.primary_result = first.risk_score ?? null;

      // derive key indicators from risk_score
      const rs = (first.risk_score || "").toLowerCase();
      normalized.key_indicators = {
        high_risk_flag: rs === "high_risk",
        moderate_risk_flag: rs === "moderate_risk",
        low_risk_flag: rs === "low_risk",
        needs_clinician_review: rs === "high_risk",
      };

      // model_topk expected as [{label, prob}]
      normalized.model_topk = (first.top_predictions || []).map((p) => ({
        label: p.label,
        prob: p.confidence ?? p.prob ?? 0,
      }));

      // attach explanation/facts for Gemini
      normalized.facts = first.explanation_summary?.facts || first.explanation_summary || {};
      normalized.trace = first.explanation_summary?.trace || [];

      setResult({ meta, raw: normalized, raw_full: first });
      setFormMsg(`✓ Analyzed ${results.length} image(s)`);

      // 2️⃣ Gemini explanation
      setAiLoading(true);

      const chatData = new FormData();
      chatData.append(
        "text",
        "Explain the result in plain language, summarize key risk indicators, and ask any follow-up questions you need.",
      );

      chatData.append("image", files[0]);
      // ensure chat endpoint has page value
      chatData.append("page", "upload");

      chatData.append("name", form.name);
      chatData.append("age", String(form.age));
      chatData.append("sex", form.sex);
      chatData.append("skinType", form.skinType);
      chatData.append("location", form.location);
      chatData.append("duration_days", String(form.duration));
      chatData.append("primarySymptoms", form.primarySymptoms.join(", "));
      chatData.append("medicalBackground", form.medicalBackground);
      chatData.append("familyHistory", form.familyHistory);
      chatData.append("sunExposure", form.sunExposure);
      chatData.append("spfUse", form.spfUse);
      chatData.append("currentMedications", form.currentMedications);

      chatData.append("primary_result", normalized.primary_result ?? "");
      chatData.append("facts", JSON.stringify(normalized.facts ?? {}));
      chatData.append("model_topk", JSON.stringify(normalized.model_topk ?? []));
      chatData.append("trace", JSON.stringify(normalized.trace ?? []));

      // Send the follow-up prompt to the chat endpoint using the same persistent SID
      const chatRes = await fetch(`${API_BASE}/chat?sid=${encodeURIComponent(sid)}`, {
        method: "POST",
        body: chatData,
      });

      const chatJson = await chatRes.json();
      const reply =
        chatJson.reply || chatJson.message || chatJson.assistant || chatJson.text || "";
      setAiMsg(String(reply));

      // Dispatch assistant reply to chat widget and open it
      try {
        console.debug(
          "[Upload] Dispatching Gemini reply to chatbot widget:",
          reply.substring(0, 100)
        );
        const dispatched = window.dispatchEvent(
          new CustomEvent("skinai:assistantMessage", {
            detail: String(reply),
            bubbles: true,
            composed: true,
          })
        );
        console.debug("[Upload] dispatchEvent returned:", dispatched);
        // signal the chat to open
        window.dispatchEvent(
          new CustomEvent("skinai:open", { bubbles: true, composed: true })
        );
      } catch (e) {
        console.warn("Could not dispatch assistant event", e);
      }
      setAiLoading(false);

      // Save lastAnalysis to localStorage with timestamp & input metadata
      try {
        let images = [];
        try {
          images = await Promise.all(
            files.map(async (file) => ({
              name: file.name,
              dataUrl: await readFileAsDataUrl(file),
            }))
          );
        } catch (e) {
          console.warn("Could not read image previews for report", e);
        }

        const last = {
          id: "report_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
          createdAt: new Date().toISOString(),
          meta,
          user_email: userEmail,
          analysis: first,
          allAnalysis: results,
          images,
          input: {
            user_email: userEmail,
            name: form.name,
            age: form.age,
            sex: form.sex,
            skinType: form.skinType,
            location: form.location,
            duration_days: form.duration,
            primarySymptoms: form.primarySymptoms.join(", "),
            otherPrimarySymptom: form.primarySymptoms.includes("Other") ? otherSymptom : "",
            medicalBackground: form.medicalBackground,
            familyHistory: form.familyHistory,
            sunExposure: form.sunExposure,
            spfUse: form.spfUse,
            currentMedications: form.currentMedications,
          },
        };
        localStorage.setItem("lastAnalysis", JSON.stringify(last));

        const reportSaveTargets = [
          `${API_BASE}/reports/save`,
          "/api/reports/save",
          "/reports/save",
        ];
        let reportSaved = false;
        let lastReportSaveError = "";

        for (const target of reportSaveTargets) {
          try {
            const response = await fetch(target, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(last),
            });

            if (response.ok) {
              reportSaved = true;
              break;
            }

            const errText = await response.text();
            lastReportSaveError = `${target} -> ${response.status} ${errText}`;
          } catch (targetError) {
            lastReportSaveError = `${target} -> ${targetError?.message || "request failed"}`;
          }
        }

        if (!reportSaved) {
          console.warn("reports/save failed", lastReportSaveError);
        }
      } catch (e) {
        console.warn("Could not save lastAnalysis", e);
      }
    } catch (error) {
      console.error("Analyze error:", error);
      setFormMsg(`Error: ${error.message}`);
      setResult(null);
      setAiMsg("");
      setAiLoading(false);
    }
  }

  return (
    <>
      <main className="container narrow">
        <section className="section-pad">
          <h1 className="h-title">Upload</h1>
          <p className="muted">Drag and drop JPG/PNG files or click to browse.</p>

          {/* DROPZONE */}
          <div
            id="dz"
            className="dropzone card"
            tabIndex={0}
            role="button"
            aria-label="Upload images dropzone"
            onClick={onBrowse}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBrowse();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={onDrop}
          >
            <p className="dz-title" style={{ fontWeight: 700 }}>
              Drag &amp; drop your images here
            </p>
            <p className="dz-sub" style={{ color: "var(--muted)" }}>
              or click to browse
            </p>

            <div style={{ fontSize: "2.5rem", margin: "12px 0", animation: "bounce 2s infinite" }}>⬆️</div>

            <label
              className="file-btn"
              style={{ marginTop: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              Choose File
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={(e) => acceptFiles(e.target.files)}
              />
            </label>

            <p className="q-hint">Tip: Upload multiple images for comparison.</p>
            <p className="q-hint">Max 20 images</p>
          </div>

          <p className="q-hint" style={{ textAlign: "right", marginTop: 6 }}>
            {previews.length}/20 images selected
          </p>

          {/* PREVIEW */}
          <div
            id="preview"
            className="preview-container"
            style={{
              marginTop: 16,
              maxHeight: 300,
              overflow: "auto",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: previews.length > 0 ? 12 : 0,
              backgroundColor: previews.length > 0 ? "var(--bg-alt)" : "transparent",
            }}
          >
            {previews.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: 12 }}>
                No images selected yet
              </p>
            ) : (
              <div
                className="preview"
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                }}
              >
                {previews.map((p, idx) => (
                  <div
                    key={p.url}
                    className="preview-item"
                    style={{
                      display: "grid",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={p.url}
                      alt={`Preview: ${p.name}`}
                      style={{
                        gridArea: "1/1",
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        gridArea: "1/1",
                        alignSelf: "end",
                        backgroundColor: "rgba(0,0,0,0.65)",
                        color: "white",
                        padding: "4px 6px",
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={p.name}
                    >
                      {p.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteImage(idx)}
                      style={{
                        gridArea: "1/1",
                        alignSelf: "start",
                        justifySelf: "end",
                        margin: 6,
                        backgroundColor: "rgba(220, 38, 38, 0.85)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        backdropFilter: "blur(2px)",
                      }}
                      aria-label={`Delete ${p.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM */}
          <form id="intakeForm" className="card" onSubmit={handleSubmit}>
            <h2 className="h-title" style={{ fontSize: "1.25rem" }}>
              Patient Intake
            </h2>
            <p className="section-sub">
              Required fields marked with <span className="req">*</span>
            </p>

            <div className="q-grid">
              <div className="q-card">
                <label className="q-label">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  className="q-input"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>

              <div className="q-card">
                <label className="q-label">
                  Age <span className="req">*</span>
                </label>
                <input
                  className="q-input"
                  type="number"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  required
                />
              </div>

              <div className="q-card">
                <label className="q-label">
                  Sex <span className="req">*</span>
                </label>
                <select
                  className="q-select"
                  value={form.sex}
                  onChange={(e) => updateField("sex", e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option>Female</option>
                  <option>Male</option>
                </select>
              </div>

              <div className="q-card">
                <label className="q-label">
                  Skin Condition <span className="req">*</span>
                </label>
                <div ref={skinTypeRef} style={{ position: "relative" }}>
                  <div
                    className="q-select"
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none", color: "inherit" }}
                    onClick={() => setSkinTypeOpen((o) => !o)}
                  >
                    {form.skinType ? (
                      <>
                        <span style={{ width: 14, height: 14, borderRadius: 2, background: FITZPATRICK_COLORS[form.skinType], flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
                        {FITZPATRICK_OPTIONS.find((o) => o.value === form.skinType)?.label}
                      </>
                    ) : (
                      <span className="muted">Select...</span>
                    )}
                    <span style={{ marginLeft: "auto" }}>▾</span>
                  </div>
                  {skinTypeOpen && (
                    <div style={{ position: "absolute", zIndex: 100, top: "100%", left: 0, right: 0, background: "#ffffff", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                      {FITZPATRICK_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", color: "#1a1a1a" }}
                          onMouseDown={() => { updateField("skinType", opt.value); setSkinTypeOpen(false); }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{ width: 14, height: 14, borderRadius: 2, background: FITZPATRICK_COLORS[opt.value], flexShrink: 0, border: "1px solid rgba(255,255,255,0.3)" }} />
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="q-card">
                <label className="q-label">
                  Location <span className="req">*</span>
                </label>
                <input
                  className="q-input"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  required
                />
              </div>

              <div className="q-card">
                <label className="q-label">
                  Duration (days) <span className="req">*</span>
                </label>
                <input
                  className="q-input"
                  type="number"
                  min="0"
                  max="3650"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  required
                />
              </div>

              <div className="q-card" style={{ gridColumn: "1 / -1" }}>
                <label className="q-label">Primary Symptoms</label>
                <div className="checkbox-grid">
                  {["Itching", "Bleeding", "Pain", "Rapid change", "Discoloration", "Other"].map((symptom) => (
                    <label key={symptom} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.primarySymptoms.includes(symptom)}
                        onChange={() => toggleSymptom(symptom)}
                      />
                      {symptom}
                    </label>
                  ))}
                </div>
                {form.primarySymptoms.includes("Other") && (
                  <input
                    className="q-input"
                    style={{ marginTop: 10 }}
                    placeholder="Describe other symptom..."
                    value={otherSymptom}
                    onChange={(e) => setOtherSymptom(e.target.value)}
                  />
                )}
              </div>

              <div className="q-card" style={{ gridColumn: "1 / -1" }}>
                <label className="q-label">Medical Background</label>
                <textarea
                  className="q-input"
                  value={form.medicalBackground}
                  onChange={(e) => updateField("medicalBackground", e.target.value)}
                  placeholder="List relevant medical conditions, treatments, or procedures..."
                  style={{ minHeight: 80, resize: "vertical" }}
                />
              </div>

              <div className="q-card">
                <label className="q-label">Family History</label>
                <select
                  className="q-select"
                  value={form.familyHistory}
                  onChange={(e) => updateField("familyHistory", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option>Skin cancer in family</option>
                  <option>Melanoma in family</option>
                  <option>Both skin cancer and melanoma</option>
                  <option>No family history</option>
                  <option>Unknown</option>
                </select>
              </div>

              <div className="q-card">
                <label className="q-label">Sun Exposure</label>
                <select
                  className="q-select"
                  value={form.sunExposure}
                  onChange={(e) => updateField("sunExposure", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option>Minimal</option>
                  <option>Moderate</option>
                  <option>High</option>
                  <option>Very high (outdoor work)</option>
                  <option>History of severe sunburns</option>
                </select>
              </div>

              <div className="q-card">
                <label className="q-label">SPF Use</label>
                <select
                  className="q-select"
                  value={form.spfUse}
                  onChange={(e) => updateField("spfUse", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option>Never</option>
                  <option>Rarely</option>
                  <option>Sometimes</option>
                  <option>Usually</option>
                  <option>Always</option>
                </select>
              </div>

              <div className="q-card" style={{ gridColumn: "1 / -1" }}>
                <label className="q-label">Current Medications</label>
                <textarea
                  className="q-input"
                  value={form.currentMedications}
                  onChange={(e) => updateField("currentMedications", e.target.value)}
                  placeholder="List current medications, supplements, or treatments..."
                  style={{ minHeight: 80, resize: "vertical" }}
                />
              </div>

              <div className="q-card" style={{ gridColumn: "1 / -1" }}>
                <label>
                  <input
                    id="consent"
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => updateField("consent", e.target.checked)}
                  />{" "}
                  I confirm this image is mine and consent to analysis.
                  <span className="req">*</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-cta"
                type="submit"
                disabled={!canAnalyze}
              >
                Analyze
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearAll}
              >
                Clear
              </button>

              <span id="formMsg" className="q-hint">
                {formMsg}
              </span>
            </div>
          </form>
          {/* RESULTS */}
          <div id="resultCard" className={`card result ${result ? "show" : ""}`}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Preliminary Analysis</h2>

            <p className="muted" style={{ marginBottom: 16 }}>{result?.meta || ""}</p>

            {result?.raw && result?.raw?.all_results && (
              <div>
                {result.raw.all_results.map((imgResult, idx) => (
                  <div key={idx} style={{ marginBottom: 28, paddingBottom: 20, borderBottom: idx < result.raw.all_results.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 60, height: 60, borderRadius: "var(--radius)", overflow: "hidden", backgroundColor: "var(--bg-alt)", flexShrink: 0 }}>
                        {previews[idx] && (
                          <img
                            src={previews[idx].url}
                            alt={`Image ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, margin: 0 }}>
                          Image {idx + 1}: {previews[idx]?.name || "Unknown"}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                          {imgResult.primary_result ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong style={{ color: "#4a9ff5" }}>Top 3 predictions</strong>
                      <div className="report-predictions">
                        {(imgResult.model_topk || [])
                          .slice(0, 3)
                          .map((p, i) => {
                            const label = p.label || p.name || "Unknown";
                            const confidence = p.prob ?? 0;
                            return (
                              <div key={i} className="report-prediction">
                                <div>
                                  <strong>{normalizeLabel(label)}</strong>
                                  <span className="report-prediction-score">
                                    {fmtPct(confidence)}
                                  </span>
                                </div>
                                <div className="muted report-prediction-desc">
                                  {predictionDescription(label)}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="report-next-step">
                      <strong style={{ color: "#4a9ff5" }}>Suggested medical next step</strong>
                      <p className="muted" style={{ marginTop: 6 }}>
                        {nextStepForRisk(imgResult.primary_result)}
                      </p>
                      <p className="muted" style={{ marginTop: 4, fontStyle: "italic" }}>
                        These descriptions are for informational purposes only and do not constitute medical advice.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* AI explanation moved into chatbot window; assistant message is dispatched to widget */}
        </section>
      </main>

      {!userEmail && showLoginGate && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-login-gate-title">
          <div className="modal-content">
            <h2 id="upload-login-gate-title">Login Required</h2>
            <p>Must be logged in to upload image.</p>
            <div className="modal-actions">
              <button
                className="btn btn-cta"
                type="button"
                onClick={() => navigate("/login?next=/upload")}
              >
                Log In
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate("/")}
              >
                Back Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
