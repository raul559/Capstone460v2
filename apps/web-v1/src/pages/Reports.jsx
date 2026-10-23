import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function getUserRole() {
  try {
    const raw = (localStorage.getItem("skinai_role") || "patient").trim().toLowerCase();
    return raw || "patient";
  } catch {
    return "patient";
  }
}

function fmtPct(x) {
  return (x * 100).toFixed(1) + "%";
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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
  mel: "The most dangerous form of skin cancer. Often looks like a mole that changes in size, shape, or color - typically uneven shaped with irregular borders and multiple shades of brown, black, red, or blue. Early detection is critical as it can spread rapidly to other parts of the body.",
  nv: "A common mole that appears as a small, well-defined brown or tan spot on the skin. Most are stable and harmless throughout life. However, any changes in size, shape, color, or texture should be checked by a doctor.",
  vasc: "Harmless growths caused by blood vessels close to the skin surface. They typically appear as red, purple, or blue spots or raised bumps. Most require no treatment but can be removed if they bleed easily or for cosmetic reasons.",
};

const FITZPATRICK_SCALE = {
  I: "Very Fair (Type I)",
  II: "Fair (Type II)",
  III: "Medium (Type III)",
  IV: "Olive (Type IV)",
  V: "Dark Brown (Type V)",
  VI: "Very Dark (Type VI)",
  1: "Very Fair (Type I)",
  2: "Fair (Type II)",
  3: "Medium (Type III)",
  4: "Olive (Type IV)",
  5: "Dark Brown (Type V)",
  6: "Very Dark (Type VI)",
};

function normalizeSkinType(skinType) {
  if (!skinType) return "Unknown";
  const normalized = String(skinType).trim();
  return FITZPATRICK_SCALE[normalized] || normalized;
}

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

function getTopPredictions(report) {
  const raw =
    report?.analysis?.top_predictions ||
    report?.analysis?.model_topk ||
    report?.topPredictions ||
    [];

  return raw.map((p) => ({
    label: p.label || p.name || "Unknown",
    confidence: p.confidence ?? p.prob ?? p.score ?? 0,
  }));
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

export default function Reports() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState(getLoggedInUser);
  const [userRole, setUserRole] = useState(getUserRole);
  const isDoctor = userRole === "doctor";

  const [showLoginGate, setShowLoginGate] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [dateSort, setDateSort] = useState("newest");
  const [detailsOpen, setDetailsOpen] = useState({});
  const [editingNotes, setEditingNotes] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});

  // Derive sorted unique patient emails from all loaded reports (doctor only)
  const uniquePatients = isDoctor
    ? Array.from(
        new Set(
          reports.map((r) => r.user_email || r.input?.user_email || "").filter(Boolean),
        ),
      ).sort()
    : [];

  // Reports visible in the current view (filtered + sorted)
  const visibleReports = (() => {
    let filtered =
      isDoctor && selectedPatient !== "all"
        ? reports.filter(
            (r) => (r.user_email || r.input?.user_email || "") === selectedPatient,
          )
        : [...reports];
    filtered.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateSort === "oldest" ? ta - tb : tb - ta;
    });
    return filtered;
  })();

  useEffect(() => {
    const syncUser = () => {
      setUserEmail(getLoggedInUser());
      setUserRole(getUserRole());
    };

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

  const storageKey = !isDoctor && userEmail ? `skinai_reports_${userEmail}` : null;

  // load reports from backend if available, else fallback to localStorage
  useEffect(() => {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3720").replace(/\/$/, "");

    async function load() {
      if (!userEmail) {
        setReports([]);
        return;
      }

      if (API_BASE) {
        try {
          const route = isDoctor
            ? `${API_BASE}/reports`
            : `${API_BASE}/reports?user_email=${encodeURIComponent(userEmail)}`;
          const res = await fetch(route);
          if (res.ok) {
            const js = await res.json();
            if (Array.isArray(js)) {
              setReports(js);
              if (isDoctor) {
                const initial = {};
                js.forEach((report) => {
                  initial[report.id] = false;
                });
                setDetailsOpen(initial);
              }
              return;
            }
          }
        } catch (e) {
          console.warn("Could not fetch reports from backend", e);
        }
      }

      let data = [];
      if (isDoctor) {
        const allKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith("skinai_reports_"),
        );
        data = allKeys.flatMap((key) => {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        });
      } else {
        if (!storageKey) return;
        const raw = localStorage.getItem(storageKey);
        data = raw ? JSON.parse(raw) : [];
      }

      // Ensure each report has an id for proper functionality
      data = data.map((r) => ({
        ...r,
        id: r.id || "report_" + (r.createdAt ? new Date(r.createdAt).getTime() : Date.now()) + "_" + Math.random().toString(36).substring(2, 9),
      }));

      // For patients: merge in any doctor notes saved to the shared key
      // (covers the same-browser demo case where backend is unavailable)
      if (!isDoctor) {
        try {
          const sharedNotes = JSON.parse(localStorage.getItem("skinai_doctor_notes") || "{}");
          if (Object.keys(sharedNotes).length > 0) {
            data = data.map((r) => {
              const entry = sharedNotes[r.id];
              if (entry && entry.note !== undefined) {
                return {
                  ...r,
                  doctor_note: entry.note,
                  doctor_note_by: entry.by,
                  doctor_note_updated_at: entry.at,
                };
              }
              return r;
            });
          }
        } catch (err) {
          console.warn("Could not read shared doctor notes", err);
        }
      }

      setReports(data);
      if (isDoctor) {
        const initial = {};
        data.forEach((report) => {
          initial[report.id] = false;
        });
        setDetailsOpen(initial);
      }
    }

    load();
  }, [isDoctor, storageKey, userEmail]);


  function signOut() {
    localStorage.removeItem("skinai_user");
    localStorage.removeItem("skinai_role");
    navigate("/login", { replace: true });
  }

  function deleteReport(id) {
    if (!userEmail) {
      setShowLoginGate(true);
      return;
    }

    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function toggleDetails(reportId) {
    setDetailsOpen((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  }

  function beginEditDoctorNote(report) {
    setEditingNotes((prev) => ({ ...prev, [report.id]: true }));
    setNoteDrafts((prev) => ({
      ...prev,
      [report.id]: prev[report.id] ?? report.doctor_note ?? "",
    }));
    // Scroll to the doctor note section after React has rendered it
    setTimeout(() => {
      const el = document.getElementById(`doctor-note-${report.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // briefly highlight the textarea so it's obvious
        const ta = el.querySelector("textarea");
        if (ta) ta.focus();
      }
    }, 60);
  }

  function cancelEditDoctorNote(reportId) {
    setEditingNotes((prev) => ({ ...prev, [reportId]: false }));
  }

  async function saveDoctorNote(report) {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3720").replace(/\/$/, "");
    const noteText = (noteDrafts[report.id] || "").trim();
    const now = new Date().toISOString();

    const nextReport = {
      ...report,
      doctor_note: noteText,
      doctor_note_by: userEmail,
      doctor_note_updated_at: now,
    };

    // 1. Try to persist to backend (MongoDB) — this is the cross-browser/device link
    let persisted = false;
    if (API_BASE && report.id) {
      try {
        const res = await fetch(`${API_BASE}/reports/note`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            report_id: report.id,
            doctor_note: noteText,
            doctor_email: userEmail,
          }),
        });
        persisted = res.ok;
      } catch (err) {
        console.warn("Could not persist doctor note to backend", err);
      }
    }

    // 2. Update shared localStorage notes map — works as fallback when doctor + patient
    //    share the same browser (demo / local dev scenario)
    try {
      const sharedNotes = JSON.parse(localStorage.getItem("skinai_doctor_notes") || "{}");
      sharedNotes[report.id] = {
        note: noteText,
        by: userEmail,
        at: now,
      };
      localStorage.setItem("skinai_doctor_notes", JSON.stringify(sharedNotes));
    } catch (err) {
      console.warn("Could not write to shared notes key", err);
    }

    // 3. Also update the patient's own report key directly (same-browser fallback)
    const patientEmail = report.user_email || report.input?.user_email;
    if (patientEmail) {
      const reportKey = `skinai_reports_${patientEmail}`;
      try {
        const existing = JSON.parse(localStorage.getItem(reportKey) || "[]");
        if (Array.isArray(existing)) {
          const updated = existing.map((item) => (item.id === report.id ? nextReport : item));
          localStorage.setItem(reportKey, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn("Could not persist doctor note to patient local storage", err);
      }
    }

    setReports((prev) => prev.map((r) => (r.id === report.id ? nextReport : r)));
    setEditingNotes((prev) => ({ ...prev, [report.id]: false }));

    if (!persisted) {
      console.warn("Backend not available; note saved to localStorage only.");
    }
  }

  async function downloadReport(report) {
    if (!userEmail) {
      setShowLoginGate(true);
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 40;

      const addBlock = (text, size = 11, spacing = 6) => {
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, pageWidth - 80);
        lines.forEach((line) => {
          if (y + size + spacing > pageHeight - 40) {
            doc.addPage();
            y = 40;
          }
          doc.text(line, 40, y);
          y += size + spacing;
        });
      };

      doc.setFontSize(16);
      doc.text("SkinAI Report", 40, y);
      y += 20;

      addBlock(`Created: ${fmtDate(report.createdAt)}`);
      if (report.input?.name) addBlock(`Patient: ${report.input.name}`);
      if (report.input?.user_email) addBlock(`Email: ${report.input.user_email}`);
      if (report.input?.age) addBlock(`Age: ${report.input.age}`);
      if (report.input?.sex) addBlock(`Sex: ${report.input.sex}`);
      if (report.input?.skinType) addBlock(`Skin Type: ${normalizeSkinType(report.input.skinType)}`);
      if (report.input?.location) addBlock(`Location: ${report.input.location}`);
      if (report.input?.duration_days) addBlock(`Duration: ${report.input.duration_days} days`);
      if (report.input?.primarySymptoms) addBlock(`Symptoms: ${report.input.primarySymptoms}`);
      if (report.input?.medicalBackground) addBlock(`Medical Background: ${report.input.medicalBackground}`);
      if (report.input?.currentMedications) addBlock(`Current Medications: ${report.input.currentMedications}`);

      const riskScore = report.analysis?.risk_score || report.primary_result || "N/A";
      y += 8;
      addBlock(`Risk Level: ${riskScore}`);
      const primaryCF = report.analysis?.certainty_factor;
      if (primaryCF != null) addBlock(`CF Score: ${Number(primaryCF).toFixed(2)}`);
      addBlock(`Suggested Next Step: ${nextStepForRisk(riskScore)}`);
      if (report.doctor_note) {
        y += 8;
        addBlock("Doctor Note:", 12, 8);
        addBlock(report.doctor_note, 11, 6);
      }

      // Handle multiple analysis results
      if (report.allAnalysis && report.allAnalysis.length > 0) {
        y += 8;
        addBlock("Analysis Results by Image:", 12, 8);
        report.allAnalysis.forEach((analysis, idx) => {
          y += 6;
          addBlock(`Image ${idx + 1}:`, 11, 6);
          const imgRisk = analysis.risk_score || "N/A";
          addBlock(`  Risk Level: ${imgRisk}`, 10, 5);
          if (analysis.certainty_factor != null) {
            addBlock(`  CF Score: ${Number(analysis.certainty_factor).toFixed(2)}`, 10, 5);
          }
          addBlock(`  Next Step: ${nextStepForRisk(imgRisk)}`, 10, 5);

          const topPreds = (analysis.top_predictions || [])
            .map((p) => ({
              label: p.label || p.name || "Unknown",
              confidence: p.confidence ?? p.prob ?? p.score ?? 0,
            }))
            .slice(0, 3);

          if (topPreds.length) {
            addBlock(`  Top 3 Predictions:`, 10, 5);
            topPreds.forEach((p) => {
              const label = normalizeLabel(p.label);
              const desc = predictionDescription(p.label);
              addBlock(
                `    • ${label} — ${fmtPct(p.confidence)}`,
                9,
                4
              );
              addBlock(`      ${desc}`, 9, 3);
            });
          }
        });
      } else {
        const topPreds = getTopPredictions(report).slice(0, 3);
        if (topPreds.length) {
          y += 8;
          addBlock("Top 3 Predictions:", 12, 8);
          topPreds.forEach((p) => {
            const label = normalizeLabel(p.label);
            const desc = predictionDescription(p.label);
            addBlock(`${label} — ${fmtPct(p.confidence)}`);
            addBlock(`- ${desc}`, 10, 4);
          });
        }
      }

      const images = report.images || report.input?.images || [];
      const imageData = images
        .map((img) => ({
          name: img.name || "Uploaded image",
          src: img.dataUrl || img.url || img.src || img,
        }))
        .filter((img) => typeof img.src === "string" && img.src.startsWith("data:image/"));

      if (imageData.length) {
        doc.addPage();
        y = 40;
        doc.setFontSize(12);
        doc.text("Uploaded Images", 40, y);
        y += 16;

        const maxWidth = pageWidth - 80;
        const imgHeight = 160;

        for (const img of imageData) {
          if (y + imgHeight + 30 > pageHeight - 40) {
            doc.addPage();
            y = 40;
          }
          const isPng = img.src.startsWith("data:image/png");
          doc.addImage(img.src, isPng ? "PNG" : "JPEG", 40, y, maxWidth, imgHeight);
          y += imgHeight + 14;
          addBlock(img.name, 10, 4);
          y += 6;
        }
      }

      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skinai_report_${report.id || "download"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  }

  return (
    <main className="container">
      <section className="section-pad" aria-labelledby="reports-title">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 id="reports-title" className="h-title" style={{ margin: 0 }}>
            Reports
          </h1>

          <div>
            <span className="muted">
              {userEmail ? `Signed in as ${userEmail}` : ""}
            </span>
            {userEmail ? (
              <button className="btn btn-cta" style={{ marginLeft: 8 }} onClick={signOut}>
                Sign out
              </button>
            ) : (
              <button
                className="btn btn-cta"
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/login?next=/reports")}
              >
                Log in
              </button>
            )}
          </div>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          {isDoctor
            ? "Doctor view: you can review all patient reports and add doctor notes."
            : "Your saved analysis results are shown below."}
        </p>

        {/* Doctor patient-filter dropdown */}
        {isDoctor && reports.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "16px 0",
              flexWrap: "wrap",
            }}
          >
            <label
              htmlFor="patient-select"
              style={{ fontWeight: 600, whiteSpace: "nowrap" }}
            >
              Filter by patient:
            </label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border, #444)",
                background: "var(--card-bg, #1a1a1a)",
                color: "inherit",
                fontSize: "0.95rem",
                minWidth: 240,
                cursor: "pointer",
              }}
            >
              <option value="all">All patients ({reports.length} report{reports.length !== 1 ? "s" : ""})</option>
              {uniquePatients.map((email) => {
                const count = reports.filter(
                  (r) => (r.user_email || r.input?.user_email || "") === email,
                ).length;
                return (
                  <option key={email} value={email}>
                    {email} ({count} report{count !== 1 ? "s" : ""})
                  </option>
                );
              })}
            </select>
            {selectedPatient !== "all" && (
              <button
                className="btn btn-cta"
                style={{ padding: "8px 14px" }}
                onClick={() => setSelectedPatient("all")}
              >
                Clear filter
              </button>
            )}

            <label
              htmlFor="date-sort"
              style={{ fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}
            >
              Sort by date:
            </label>
            <select
              id="date-sort"
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border, #444)",
                background: "var(--card-bg, #1a1a1a)",
                color: "inherit",
                fontSize: "0.95rem",
                minWidth: 200,
                cursor: "pointer",
              }}
            >
              <option value="newest">Latest uploaded first</option>
              <option value="oldest">Earliest uploaded first</option>
            </select>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="card">
            <p>
              No reports yet. Try{" "}
              <Link to="/upload">uploading an image</Link> to generate your first
              report.
            </p>
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="card">
            <p>No reports for <strong>{selectedPatient}</strong>.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {visibleReports.map((r) => (
              <div key={r.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px 0" }}>
                      {r.input?.name || "Unnamed Report"}
                    </h3>
                    <div className="muted">
                      Created: {fmtDate(r.createdAt)}
                    </div>
                    {isDoctor && (
                      <div className="muted" style={{ marginTop: 4 }}>
                        Patient: {r.input?.user_email || r.user_email || "Unknown"}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {isDoctor && (
                      <>
                        <button
                          type="button"
                          className="btn btn-cta"
                          title="View patient report details"
                          onClick={() => toggleDetails(r.id)}
                          style={{ minWidth: 40, padding: "10px 12px" }}
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="btn btn-cta"
                          title="Add or edit doctor note"
                          onClick={() => beginEditDoctorNote(r)}
                          style={{ minWidth: 40, padding: "10px 12px" }}
                        >
                          ✎
                        </button>
                      </>
                    )}
                    <Link className="btn btn-cta" to="/upload">
                      Analyze another
                    </Link>
                  </div>
                </div>

                {/* IMAGES */}
                {((r.images || r.input?.images || []).length > 0) && (
                  <div className="report-images">
                    {(r.images || r.input?.images || []).map((img, idx) => {
                      const src = img.dataUrl || img.url || img.src || img;
                      const name = img.name || `Image ${idx + 1}`;
                      if (!src) return null;
                      return (
                        <img
                          key={name}
                          className="report-image"
                          src={src}
                          alt={name}
                          title={name}
                        />
                      );
                    })}
                  </div>
                )}

                {/* PATIENT INTAKE INFORMATION */}
                {r.input && (!isDoctor || detailsOpen[r.id]) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <strong style={{ display: "block", marginBottom: 8 }}>Patient Information</strong>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 8,
                        fontSize: "0.9rem",
                      }}
                    >
                      {r.input.user_email && (
                        <div>
                          <strong>Email:</strong> {r.input.user_email}
                        </div>
                      )}
                      {r.input.name && (
                        <div>
                          <strong>Name:</strong> {r.input.name}
                        </div>
                      )}
                      {r.input.age && (
                        <div>
                          <strong>Age:</strong> {r.input.age}
                        </div>
                      )}
                      {r.input.patient_age && !r.input.age && (
                        <div>
                          <strong>Age:</strong> {r.input.patient_age}
                        </div>
                      )}
                      {r.input.sex && (
                        <div>
                          <strong>Sex:</strong> {r.input.sex}
                        </div>
                      )}
                      {r.input.skinType && (
                        <div>
                          <strong>Skin Type:</strong> {normalizeSkinType(r.input.skinType)}
                        </div>
                      )}
                      {r.input.fitzpatrick && !r.input.skinType && (
                        <div>
                          <strong>Skin Type:</strong> {normalizeSkinType(r.input.fitzpatrick)}
                        </div>
                      )}
                      {r.input.location && (
                        <div>
                          <strong>Location:</strong> {r.input.location}
                        </div>
                      )}
                      {r.input.body_site && !r.input.location && (
                        <div>
                          <strong>Location:</strong> {r.input.body_site}
                        </div>
                      )}
                      {r.input.duration_days && (
                        <div>
                          <strong>Duration:</strong> {r.input.duration_days} days
                        </div>
                      )}
                      {r.input.duration_weeks && (
                        <div>
                          <strong>Duration:</strong> {r.input.duration_weeks} weeks
                        </div>
                      )}
                      {r.input.diameter_mm && (
                        <div>
                          <strong>Diameter:</strong> {r.input.diameter_mm} mm
                        </div>
                      )}
                      {r.input.bleeding != null && (
                        <div>
                          <strong>Bleeding:</strong> {String(r.input.bleeding)}
                        </div>
                      )}
                      {r.input.crusting != null && (
                        <div>
                          <strong>Crusting:</strong> {String(r.input.crusting)}
                        </div>
                      )}
                      {r.input.itching_0_10 != null && (
                        <div>
                          <strong>Itching (0-10):</strong> {r.input.itching_0_10}
                        </div>
                      )}
                      {r.input.pain_0_10 != null && (
                        <div>
                          <strong>Pain (0-10):</strong> {r.input.pain_0_10}
                        </div>
                      )}
                      {r.input.elevation && (
                        <div>
                          <strong>Elevation:</strong> {r.input.elevation}
                        </div>
                      )}
                      {r.input.border_irregularity != null && (
                        <div>
                          <strong>Border irregularity:</strong> {r.input.border_irregularity}
                        </div>
                      )}
                      {r.input.asymmetry != null && (
                        <div>
                          <strong>Asymmetry:</strong> {r.input.asymmetry}
                        </div>
                      )}
                      {r.input.number_of_colors != null && (
                        <div>
                          <strong>Number of colors:</strong> {r.input.number_of_colors}
                        </div>
                      )}
                      {r.input.color_variegation != null && (
                        <div>
                          <strong>Color variegation:</strong> {r.input.color_variegation}
                        </div>
                      )}
                      {r.input.primarySymptoms && (
                        <div>
                          <strong>Primary Symptoms:</strong> {r.input.primarySymptoms}
                        </div>
                      )}
                      {r.input.familyHistory && (
                        <div>
                          <strong>Family History:</strong> {r.input.familyHistory}
                        </div>
                      )}
                      {r.input.sunExposure && (
                        <div>
                          <strong>Sun Exposure:</strong> {r.input.sunExposure}
                        </div>
                      )}
                      {r.input.spfUse && (
                        <div>
                          <strong>SPF Use:</strong> {r.input.spfUse}
                        </div>
                      )}
                    </div>

                    {(r.input.medicalBackground || r.input.currentMedications) && (
                      <div style={{ marginTop: 8 }}>
                        {r.input.medicalBackground && (
                          <div style={{ marginBottom: 8 }}>
                            <strong>Medical Background:</strong>
                            <p style={{ margin: "4px 0 0 0", whiteSpace: "pre-wrap" }}>
                              {r.input.medicalBackground}
                            </p>
                          </div>
                        )}
                        {r.input.currentMedications && (
                          <div>
                            <strong>Current Medications:</strong>
                            <p style={{ margin: "4px 0 0 0", whiteSpace: "pre-wrap" }}>
                              {r.input.currentMedications}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ANALYSIS RESULTS */}

                <div style={{ marginTop: 10 }}>
                  {/* Check if we have multi-image analysis */}
                  {r.allAnalysis && r.allAnalysis.length > 0 ? (
                    <div>
                      <h3 style={{ marginBottom: 16 }}>Analysis Results</h3>
                      {r.allAnalysis.map((analysis, idx) => {
                        const topPreds = (analysis.top_predictions || [])
                          .map((p) => ({
                            label: p.label || p.name || "Unknown",
                            confidence: p.confidence ?? p.prob ?? p.score ?? 0,
                          }))
                          .slice(0, 3);

                        const riskScore = analysis.risk_score || "N/A";

                        return (
                          <div
                            key={idx}
                            style={{
                              marginBottom: 20,
                              paddingBottom: 20,
                              borderBottom:
                                idx < r.allAnalysis.length - 1
                                  ? "1px solid var(--border)"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                marginBottom: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: "var(--radius)",
                                  overflow: "hidden",
                                  backgroundColor: "var(--bg-alt)",
                                  flexShrink: 0,
                                }}
                              >
                                {(r.images || r.input?.images || [])[idx] && (() => {
                                  const img = (r.images || r.input?.images || [])[idx];
                                  const src = img.dataUrl || img.url || img.src || img;
                                  const name = img.name || `Image ${idx + 1}`;
                                  return (
                                    <img
                                      src={src}
                                      alt={name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  );
                                })()}
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    margin: 0,
                                  }}
                                >
                                  Image {idx + 1}:
                                  {(r.images || r.input?.images || [])[idx]?.name
                                    ? ` ${(r.images || r.input?.images || [])[idx].name}`
                                    : ""}
                                </p>
                                <p
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--muted)",
                                    margin: "4px 0 0 0",
                                  }}
                                >
                                  Risk: {riskScore}
                                </p>
                              </div>
                            </div>

                            <div style={{ marginTop: 10 }}>
                              <strong style={{ color: "#4a9ff5" }}>
                                Top 3 predictions
                              </strong>
                              <div className="report-predictions">
                                {topPreds.map((p, i) => (
                                  <div key={i} className="report-prediction">
                                    <div>
                                      <strong>{normalizeLabel(p.label)}</strong>
                                      <span className="report-prediction-score">
                                        {fmtPct(p.confidence ?? 0)}
                                      </span>
                                    </div>
                                    <div className="muted report-prediction-desc">
                                      {predictionDescription(p.label)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {analysis.certainty_factor != null && (
                              <div style={{ marginTop: 10 }}>
                                <strong style={{ color: "#4a9ff5" }}>Expert System CF Score</strong>
                                <p className="muted" style={{ marginTop: 4 }}>
                                  {Number(analysis.certainty_factor).toFixed(2)}
                                </p>
                              </div>
                            )}

                            <div className="report-next-step">
                              <strong style={{ color: "#4a9ff5" }}>
                                Suggested medical next step
                              </strong>
                              <p className="muted" style={{ marginTop: 6 }}>
                                {nextStepForRisk(riskScore)}
                              </p>
                              <p className="muted" style={{ marginTop: 4, fontStyle: "italic" }}>
                                These descriptions are for informational purposes only and do not constitute medical advice.
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Fallback for reports without allAnalysis
                    <>
                      <strong>Primary Result</strong>
                      <div style={{ marginTop: 6 }}>
                        <span className="pill">
                          {r.analysis?.risk_score || r.primary_result || "N/A"}
                        </span>
                      </div>

                      <div style={{ marginTop: 22 }}>
                        <strong style={{ color: "#4a9ff5" }}>Top 3 predictions</strong>
                        <div className="report-predictions">
                          {getTopPredictions(r)
                            .slice(0, 3)
                            .map((p, i) => (
                              <div key={i} className="report-prediction">
                                <div>
                                  <strong>{normalizeLabel(p.label)}</strong>
                                  <span className="report-prediction-score">
                                    {fmtPct(p.confidence ?? 0)}
                                  </span>
                                </div>
                                <div className="muted report-prediction-desc">
                                  {predictionDescription(p.label)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {r.analysis?.certainty_factor != null && (
                        <div style={{ marginTop: 10 }}>
                          <strong style={{ color: "#4a9ff5" }}>Expert System CF Score</strong>
                          <p className="muted" style={{ marginTop: 4 }}>
                            {Number(r.analysis.certainty_factor).toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div className="report-next-step">
                        <strong style={{ color: "#4a9ff5" }}>
                          Suggested medical next step
                        </strong>
                        <p className="muted" style={{ marginTop: 6 }}>
                          {nextStepForRisk(
                            r.analysis?.risk_score || r.primary_result
                          )}
                        </p>
                        <p className="muted" style={{ marginTop: 4, fontStyle: "italic" }}>
                          These descriptions are for informational purposes only and do not constitute medical advice.
                        </p>
                      </div>

                      <p className="muted" style={{ marginTop: 8 }}>
                        {r.notes}
                      </p>
                    </>
                  )}

                  {(r.doctor_note || editingNotes[r.id]) && (
                    <div
                      id={`doctor-note-${r.id}`}
                      className="report-next-step"
                      style={{ marginTop: 14 }}
                    >
                      <strong style={{ color: "#4a9ff5" }}>Doctor Note</strong>
                      {editingNotes[r.id] && isDoctor ? (
                        <>
                          <textarea
                            className="q-input"
                            style={{ width: "100%", minHeight: 88, marginTop: 8 }}
                            value={noteDrafts[r.id] ?? ""}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            placeholder="Add doctor note for patient follow-up..."
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <button className="btn btn-cta" onClick={() => saveDoctorNote(r)}>
                              Save Note
                            </button>
                            <button className="btn btn-cta" onClick={() => cancelEditDoctorNote(r.id)}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="muted" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                            {r.doctor_note}
                          </p>
                          {(r.doctor_note_by || r.doctor_note_updated_at) && (
                            <p className="muted" style={{ marginTop: 4, fontSize: "0.85rem" }}>
                              {r.doctor_note_by ? `By ${r.doctor_note_by}` : ""}
                              {r.doctor_note_updated_at ? ` • ${fmtDate(r.doctor_note_updated_at)}` : ""}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-cta"
                    onClick={() => downloadReport(r)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn btn-cta"
                    onClick={() => deleteReport(r.id)}
                  >
                    Delete
                  </button>
                  {isDoctor && !editingNotes[r.id] && (
                    <button
                      className="btn btn-cta"
                      onClick={() => beginEditDoctorNote(r)}
                    >
                      Add Doctor Note
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {!userEmail && showLoginGate && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reports-login-gate-title">
          <div className="modal-content">
            <h2 id="reports-login-gate-title">Login Required</h2>
            <p>Must be logged in to view reports.</p>
            <div className="modal-actions">
              <button
                className="btn btn-cta"
                type="button"
                onClick={() => navigate("/login?next=/reports")}
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
    </main>
  );
}
