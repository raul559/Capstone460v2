// scripts/account.js
// Simple account page logic: show email, account role (read-only),
// usage stats based on saved reports, and handle sign out.

function getCurrentUserEmail() {
  try {
    return localStorage.getItem("skinai_user") || null;
  } catch (e) {
    console.error("localStorage unavailable", e);
    return null;
  }
}

// Read all reports for a given email (same shape as upload/reports pages)
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

// Read stored role if backend sets it later; default to patient/general
function getUserRole(email) {
  if (!email) return "Patient / General user";
  try {
    const raw = localStorage.getItem(`skinai_role_${email}`);
    return raw || "Patient / General user";
  } catch (e) {
    console.error("Failed to read role", e);
    return "Patient / General user";
  }
}

function fmtDate(iso) {
  if (!iso) return "None";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "None";
  return d.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl && !yearEl.textContent) {
    yearEl.textContent = new Date().getFullYear();
  }

  const loggedOutCard = document.getElementById("account-logged-out");
  const contentWrap = document.getElementById("account-content");

  const emailEl = document.getElementById("account-email");
  const roleEl = document.getElementById("account-role");
  const totalReportsEl = document.getElementById("account-total-reports");
  const lastReportEl = document.getElementById("account-last-report");
  const signoutBtn = document.getElementById("account-signout");

  const email = getCurrentUserEmail();

  // If user is not logged in, show "not signed in" card
  if (!email) {
    if (loggedOutCard) loggedOutCard.style.display = "block";
    if (contentWrap) contentWrap.style.display = "none";
    return;
  }

  // Logged-in view
  if (loggedOutCard) loggedOutCard.style.display = "none";
  if (contentWrap) contentWrap.style.display = "grid";

  if (emailEl) emailEl.textContent = email;

  const role = getUserRole(email);
  if (roleEl) roleEl.textContent = role;

  const reports = getUserReports(email);
  if (totalReportsEl) {
    totalReportsEl.textContent = reports.length.toString();
  }

  if (lastReportEl) {
    if (!reports.length) {
      lastReportEl.textContent = "None";
    } else {
      // take most recent by createdAt if present, else by array order
      const withDates = reports
        .map((r) => ({ r, d: r.createdAt ? new Date(r.createdAt) : null }))
        .filter((x) => x.d && !Number.isNaN(x.d.getTime()));

      if (withDates.length) {
        withDates.sort((a, b) => b.d - a.d);
        lastReportEl.textContent = fmtDate(withDates[0].r.createdAt);
      } else {
        lastReportEl.textContent = "Available";
      }
    }
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("skinai_user");
      } catch (e) {
        console.error("Failed to clear user", e);
      }
      window.location.href = "login.html";
    });
  }
});
