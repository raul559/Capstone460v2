import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState(() =>
    localStorage.getItem("skinai_user") || null
  );
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  // Re-sync on route change (covers same-tab login/logout)
  useEffect(() => {
    setUserEmail(localStorage.getItem("skinai_user") || null);
  }, [location]);

  // Re-sync on cross-tab storage changes
  useEffect(() => {
    function onStorage() {
      setUserEmail(localStorage.getItem("skinai_user") || null);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function signOut() {
    localStorage.removeItem("skinai_user");
    localStorage.removeItem("skinai_role");
    setUserEmail(null);
    setAvatarOpen(false);
    navigate("/login", { replace: true });
  }

  const firstChar = userEmail ? userEmail.charAt(0) : "";
  const avatarContent = /[0-9]/.test(firstChar) ? "👤" : firstChar.toUpperCase();

  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="SkinAI Classifier Home">
          <div className="brand-mark" aria-hidden="true">
            AI
          </div>
          <div className="brand-text">
            <strong>SkinAI Classifier</strong>
            <span>Purdue Fort Wayne</span>
          </div>
        </Link>

        <nav className="nav" aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Upload
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            Reports
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            About Us
          </NavLink>

          {userEmail ? (
            <div ref={avatarRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setAvatarOpen((o) => !o)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#c8a96e",
                  color: "#1a1a2e",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label="Account menu"
              >
                {avatarContent}
              </button>

              {avatarOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: 200,
                    background: "#1a1a2e",
                    border: "1px solid rgba(200,169,110,0.3)",
                    borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    zIndex: 200,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      color: "#888",
                      fontSize: "0.85rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {userEmail}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                  <button
                    onClick={signOut}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: "#e87c7c",
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
