import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function getLoggedInUser() {
  try { return localStorage.getItem("skinai_user") || ""; } catch { return ""; }
}

const DOCTOR_LOGIN = {
  email: "doctor@skinai.com",
  password: "doctor123",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // "error" | "success"
  const [isSignup, setIsSignup] = useState(false);
  const [redirecting] = useState(() => Boolean(getLoggedInUser()));

  useEffect(() => {
    if (redirecting) {
      navigate("/upload", { replace: true });
    }
  }, []);

  const nextPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("next") || "/reports";
  }, [location.search]);

  async function onSubmit(e) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!email.trim() || !password.trim()) {
      setMsg("Please enter your email and password.");
      setMsgType("error");
      return;
    }

    if (isSignup && password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      setMsgType("error");
      return;
    }

    setMsg(isSignup ? "Creating account..." : "Signing in…");
    setMsgType("info");

    if (
      !isSignup &&
      normalizedEmail === DOCTOR_LOGIN.email &&
      password === DOCTOR_LOGIN.password
    ) {
      try {
        localStorage.setItem("skinai_user", DOCTOR_LOGIN.email);
        localStorage.setItem("skinai_role", "doctor");
      } catch (err) {
        console.error("localStorage error:", err);
      }

      setMsg("Doctor access granted. Redirecting...");
      setMsgType("success");
      setTimeout(() => {
        navigate(nextPath);
      }, 500);
      return;
    }

    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(data.error || "An error occurred");
        setMsgType("error");
        return;
      }

      // Store user in localStorage
      try {
        localStorage.setItem("skinai_user", email.trim());
        localStorage.setItem("skinai_role", "patient");
      } catch (err) {
        console.error("localStorage error:", err);
      }

      setMsg(isSignup ? "Account created! Redirecting..." : "Success! Redirecting...");
      setMsgType("success");

      setTimeout(() => {
        navigate(nextPath);
      }, 500);
    } catch (error) {
      console.error("Auth error:", error);
      setMsg("Failed to connect to server. Please try again.");
      setMsgType("error");
    }
  }

  const msgColor = msgType === "error" ? "#7a0000" : msgType === "success" ? "#1a4a1a" : "#333";

  if (redirecting) return null;

  return (
    <main className="container narrow">
      <section className="section-pad" style={{ textAlign: "center" }} aria-labelledby="login-title">
        <h1 id="login-title" className="h-title">
          {isSignup ? "Create Account" : "Login"}
        </h1>
        <p className="muted">
          {isSignup
            ? "Sign up to access your saved analysis reports."
            : "Sign in to access your saved analysis reports."}
        </p>

        <div className="card login-card" role="region" aria-label="Login form">
          <form id="login-form" autoComplete="on" noValidate onSubmit={onSubmit}>
            <div style={{ display: "grid", gap: 8, maxWidth: 380 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: "#000", minWidth: 70, whiteSpace: "nowrap" }}>Email</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@pfw.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #cfcfcf",
                    background: "#fff",
                    color: "#000",
                  }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ color: "#000", minWidth: 70, whiteSpace: "nowrap" }}>
                  Password
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #cfcfcf",
                    background: "#fff",
                    color: "#000",
                  }}
                />
              </label>

              <button type="submit" className="btn btn-cta login-submit-btn">
                {isSignup ? "Create Account" : "Sign In"}
              </button>

              <p id="login-msg" aria-live="polite" style={{ marginTop: 0, color: msgColor, fontWeight: 600, fontSize: "0.95rem", minHeight: "1.4em" }}>
                {msg}
              </p>

              <div style={{
                textAlign: "center",
                marginTop: 4,
                paddingTop: 4,
                borderTop: "1px solid #2a2a2a"
              }}>
                <span style={{ color: "#888", fontSize: "0.9rem" }}>
                  {isSignup
                    ? "Already have an account? "
                    : "Don't have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4a9eff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "#6bb0ff";
                    e.target.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#4a9eff";
                    e.target.style.textDecoration = "none";
                  }}
                >
                  {isSignup ? "Sign in" : "Sign up"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
