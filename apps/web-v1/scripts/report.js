// scripts/report.js
// Handles showing reports for the logged-in user.
// Reads from localStorage using the same key format used on the upload page.

// Read the current user's email from localStorage
function getCurrentUserEmail() {
  try {
    return localStorage.getItem("skinai_user") || null;
  } catch (e) {
    console.error("localStorage unavailable", e);
    return null;
  }
}

// Read all reports for a given email
function getUserReports(email) {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(`skinai_reports_${email}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read reports", e);
    return [];
  }
}

// Save all reports for a given email
function setUserReports(email, reports) {
  if (!email) return;
  try {
    localStorage.setItem(`skinai_reports_${email}`, JSON.stringify(reports));
  } catch (e) {
    console.error("Failed to save reports", e);
  }
}

// Format confidence as percentage string, e.g. 0.78 -> "78.0%"
function fmtPct(x) {
  const num = Number(x);
  if (Number.isNaN(num)) return "";
  return (num * 100).toFixed(1) + "%";
}

// Format ISO date into something readable
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl && !yearEl.textContent) {
    yearEl.textContent = new Date().getFullYear();
  }

  const loggedOutCard = document.getElementById("logged-out-card");
  const emptyCard = document.getElementById("empty");
  const listEl = document.getElementById("report-list");
  const helloEl = document.getElementById("hello");
  const signoutBtn = document.getElementById("signout");

  // If the necessary elements are missing, bail quietly
  if (!listEl) return;

  const email = getCurrentUserEmail();

  // If not logged in, show "please log in" card and hide the rest
  if (!email) {
    if (helloEl) helloEl.textContent = "";
    if (signoutBtn) signoutBtn.style.display = "none";
    if (loggedOutCard) loggedOutCard.style.display = "block";
    if (emptyCard) emptyCard.style.display = "none";
    listEl.style.display = "none";
    listEl.innerHTML = "";
    return;
  }

  // Logged-in view
  if (helloEl) {
    helloEl.textContent = `Signed in as ${email}`;
  }

  if (signoutBtn) {
    signoutBtn.style.display = "inline-block";
    signoutBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("skinai_user");
      } catch (e) {
        console.error("Failed to clear user", e);
      }
      // Optionally also clear reports in a real app if desired.
      window.location.href = "login.html";
    });
  }

  if (loggedOutCard) loggedOutCard.style.display = "none";
  listEl.style.display = "grid";

  // Load reports for this user
  let reports = getUserReports(email);

  function render() {
    listEl.innerHTML = "";

    if (!reports || reports.length === 0) {
      if (emptyCard) emptyCard.style.display = "block";
      return;
    }

    if (emptyCard) emptyCard.style.display = "none";

    reports.forEach((r) => {
      const card = document.createElement("div");
      card.className = "card";

      const topPreds = Array.isArray(r.topPredictions)
        ? r.topPredictions
        : [];

      const meta = r.meta || {};

      const predsHtml =
        topPreds.length > 0
          ? `
            <strong>Top predictions</strong>
            <ul style="margin:6px 0 0 18px;">
              ${topPreds
                .map(
                  (p) =>
                    `<li>${p.label || "Unknown"} — ${fmtPct(
                      p.confidence
                    )}</li>`
                )
                .join("")}
            </ul>
          `
          : `<p class="muted" style="margin-top:6px;">No prediction details stored for this report.</p>`;

      const metaTags = [];
      if (meta.name) metaTags.push(`Name: ${meta.name}`);
      if (meta.age) metaTags.push(`Age: ${meta.age}`);
      if (meta.fitzpatrick)
        metaTags.push(`Skin condition: ${meta.fitzpatrick}`);
      if (meta.location) metaTags.push(`Location: ${meta.location}`);
      if (meta.duration_days != null && meta.duration_days !== "") {
        metaTags.push(`Duration: ${meta.duration_days} day(s)`);
      }

      const metaHtml =
        metaTags.length > 0
          ? `
            <div style="margin-top:8px;">
              ${metaTags
                .map(
                  (t) =>
                    `<span class="pill" style="margin-bottom:4px;">${t}</span>`
                )
                .join(" ")}
            </div>
          `
          : "";

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <h3 style="margin:0 0 4px 0;">${r.filename || "Report"}</h3>
            <div class="muted">Created: ${fmtDate(r.createdAt)}</div>
          </div>
          <div>
            <a class="btn" href="upload.html">Analyze another</a>
          </div>
        </div>

        <div style="margin-top:10px;">
          ${predsHtml}
          <p class="muted" style="margin-top:8px;">
            ${r.notes || "This is a demo report created from the upload form."}
          </p>
          ${metaHtml}
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <button class="btn" data-action="download" data-id="${r.id}">
            Download JSON
          </button>
          <button class="btn btn-secondary" data-action="delete" data-id="${r.id}">
            Delete
          </button>
        </div>
      `;

      listEl.appendChild(card);
    });
  }

  // Handle Download / Delete actions
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!action || !id) return;

    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) return;

    if (action === "download") {
      const blob = new Blob(
        [JSON.stringify(reports[idx], null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skinai_report_${id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (action === "delete") {
      reports.splice(idx, 1);
      setUserReports(email, reports);
      render();
    }
  });

  // Initial render
  render();
});
