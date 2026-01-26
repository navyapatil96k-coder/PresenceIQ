import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Firebase Google Login
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const API = "http://localhost:8080";

/* -------------------------------------------------------
   Small UI Components
------------------------------------------------------- */

function Feature({ text }) {
  return (
    <div style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.4 }}>
      {text}
    </div>
  );
}

function Toast({ text, type = "info", onClose }) {
  if (!text) return null;

  const color =
    type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#60a5fa";

  return (
    <div style={toastWrap}>
      <div style={{ ...toastCard, borderColor: color }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: "#e5e7eb", fontSize: 14 }}>{text}</div>
          <button onClick={onClose} style={toastClose}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ✅ Metrics Form Component
------------------------------------------------------- */
function MetricsForm({ token, onSaved }) {
  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(4);
  const [exerciseMinutes, setExerciseMinutes] = useState(20);
  const [stressLevel, setStressLevel] = useState(5);

  const [screenTimeMinutes, setScreenTimeMinutes] = useState(180);
  const [passiveScreenMinutes, setPassiveScreenMinutes] = useState(120);
  const [activeLearningMinutes, setActiveLearningMinutes] = useState(40);

  const [saving, setSaving] = useState(false);

  const saveMetrics = async () => {
    try {
      setSaving(true);

      await axios.post(
        `${API}/metrics/today`,
        {
          sleepHours: Number(sleepHours),
          studyHours: Number(studyHours),
          exerciseMinutes: Number(exerciseMinutes),
          stressLevel: Number(stressLevel),
          screenTimeMinutes: Number(screenTimeMinutes),

          // ✅ new fields
          passiveScreenMinutes: Number(passiveScreenMinutes),
          activeLearningMinutes: Number(activeLearningMinutes),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onSaved?.();
    } catch (err) {
      console.log(err);
      alert("❌ Failed to save metrics");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={cardHeaderRow}>
        <h2 style={cardTitle}>Log Today’s Metrics</h2>
        <div style={pillMuted}>Daily input</div>
      </div>

      <div style={formGrid}>
        <div>
          <label style={labelStyle}>Sleep Hours</label>
          <input
            style={inputStyle}
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Study Hours</label>
          <input
            style={inputStyle}
            type="number"
            step="0.5"
            value={studyHours}
            onChange={(e) => setStudyHours(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Exercise Minutes</label>
          <input
            style={inputStyle}
            type="number"
            value={exerciseMinutes}
            onChange={(e) => setExerciseMinutes(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Stress Level (1-10)</label>
          <input
            style={inputStyle}
            type="number"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Total Screen Time (mins)</label>
          <input
            style={inputStyle}
            type="number"
            value={screenTimeMinutes}
            onChange={(e) => setScreenTimeMinutes(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Passive Screen (mins)</label>
          <input
            style={inputStyle}
            type="number"
            value={passiveScreenMinutes}
            onChange={(e) => setPassiveScreenMinutes(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>Active Learning (mins)</label>
          <input
            style={inputStyle}
            type="number"
            value={activeLearningMinutes}
            onChange={(e) => setActiveLearningMinutes(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button onClick={saveMetrics} style={primaryBtnFull} disabled={saving}>
            {saving ? "Saving..." : "Save Metrics"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, color: "#9aa3af", fontSize: 12 }}>
        Tip: Passive screen (scrolling) lowers hygiene, Active learning improves intellect.
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ✅ MAIN APP
------------------------------------------------------- */
export default function App() {
  const storedToken = localStorage.getItem("token") || "";
  const storedEmail = localStorage.getItem("userEmail") || "";

  const [token, setToken] = useState(storedToken);
  const [userEmail, setUserEmail] = useState(storedEmail);

  // Email Login form
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("");

  // Remember checkbox
  const [rememberMe, setRememberMe] = useState(true);

  // Data
  const [score, setScore] = useState(null);
  const [ai, setAi] = useState(null);

  // UI state
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  // Toast
  const [toast, setToast] = useState({ text: "", type: "info" });

  const showToast = (text, type = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "info" }), 2400);
  };

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  /* -------------------------
     ✅ AUTH: Email/Password
  ------------------------- */
  const login = async () => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });

      const t = res.data.token;

      if (rememberMe) {
        localStorage.setItem("token", t);
        localStorage.setItem("userEmail", email);
      }

      setToken(t);
      setUserEmail(email);

      showToast("✅ Login success", "success");
    } catch (err) {
      console.log(err);
      showToast("❌ Login failed", "error");
    }
  };

  /* -------------------------
     ✅ AUTH: Google Login (Firebase)
  ------------------------- */
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await axios.post(`${API}/auth/firebase`, { idToken });

      const t = res.data.token;
      const mail = result.user?.email || "google-user";

      if (rememberMe) {
        localStorage.setItem("token", t);
        localStorage.setItem("userEmail", mail);
      }

      setToken(t);
      setUserEmail(mail);

      showToast("✅ Google login success", "success");
    } catch (err) {
      console.log(err);
      showToast("❌ Google login failed", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken("");
    setUserEmail("");
    setScore(null);
    setAi(null);
    showToast("Logged out", "info");
  };

  /* -------------------------
     ✅ Fetch score (JWT)
  ------------------------- */
  const fetchScore = async () => {
    try {
      setLoadingScore(true);
      const res = await axios.get(`${API}/presenceiq/score`, {
        headers: authHeaders,
      });
      setScore(res.data);
    } catch (err) {
      console.log(err);
      showToast("❌ Score fetch failed (token/back-end issue)", "error");
    } finally {
      setLoadingScore(false);
    }
  };

  /* -------------------------
     ✅ Fetch AI suggestion (JWT)
  ------------------------- */
  const fetchAi = async () => {
    try {
      setLoadingAi(true);
      const res = await axios.get(`${API}/presenceiq/ai-suggestion`, {
        headers: authHeaders,
      });
      setAi(res.data);
    } catch (err) {
      console.log(err);
      setAi(null);
    } finally {
      setLoadingAi(false);
    }
  };

  // When token becomes available → fetch score + AI
  useEffect(() => {
    if (token) {
      fetchScore();
      fetchAi();
    }
  }, [token]);

  /* -------------------------------------------------------
     UI Widgets
  ------------------------------------------------------- */

  const PillarBar = ({ label, value }) => {
    const v = Number(value || 0);
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, color: "#e5e7eb" }}>{label}</span>
          <span style={{ fontWeight: 800, color: "#e5e7eb" }}>{v}</span>
        </div>

        <div style={barTrack}>
          <div style={{ ...barFill, width: `${v}%` }} />
        </div>
      </div>
    );
  };

  const SuggestionCard = () => {
    // Loading UI
    if (loadingAi) {
      return (
        <div style={cardStyle}>
          <div style={cardHeaderRow}>
            <h3 style={cardTitle}>Micro-Intervention</h3>
            <button style={btnSmall} disabled>
              Loading...
            </button>
          </div>
          <div style={{ color: "#9aa3af" }}>Generating suggestion via Ollama...</div>
        </div>
      );
    }

    // No AI yet
    if (!ai) {
      return (
        <div style={cardStyle}>
          <div style={cardHeaderRow}>
            <h3 style={cardTitle}>Micro-Intervention</h3>
            <button onClick={fetchAi} style={btnSmall}>
              Refresh AI
            </button>
          </div>

          <div style={{ color: "#9aa3af" }}>
            No suggestion yet. Log today’s metrics first ✅
          </div>
        </div>
      );
    }

    // Severity color
    let color = "#9aa3af";
    if (ai.severity === "GREEN") color = "#22c55e";
    if (ai.severity === "YELLOW") color = "#f59e0b";
    if (ai.severity === "RED") color = "#ef4444";

    return (
      <div style={cardStyle}>
        <div style={cardHeaderRow}>
          <h3 style={cardTitle}>{ai.title || "Micro-Intervention"}</h3>
          <button onClick={fetchAi} style={btnSmall}>
            Refresh AI
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ ...severityDot, background: color }} />
          <div style={{ fontWeight: 800, color: "#e5e7eb" }}>
            Severity: <span style={{ color }}>{ai.severity || "—"}</span>
          </div>
        </div>

        <p style={{ marginTop: 0, color: "#e5e7eb", lineHeight: 1.5 }}>
          {ai.message || "No message returned."}
        </p>

        {ai.actions && Array.isArray(ai.actions) && ai.actions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: "#9aa3af", fontSize: 13, marginBottom: 8 }}>
              Suggested actions:
            </div>

            <div style={actionList}>
              {ai.actions.map((a, i) => (
                <div key={i} style={actionChip}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* -------------------------------------------------------
     ✅ LOGIN PAGE
  ------------------------------------------------------- */
  if (!token) {
    return (
      <div style={loginPage}>
        <div style={bgGlowA} />
        <div style={bgGlowB} />

        <Toast
          text={toast.text}
          type={toast.type}
          onClose={() => setToast({ text: "", type: "info" })}
        />

        {/* Left Panel */}
        <div style={loginLeft}>
          <div>
            <div style={logoBadge}>PIQ</div>

            <h1 style={loginTitle}>PresenceIQ</h1>
            <p style={loginSubtitle}>
              Measure your daily habits → compute IQ Core → get AI micro-interventions in real time.
            </p>

            <div style={featureList}>
              <Feature text="✅ JWT protected APIs (only your data)" />
              <Feature text="✅ Firebase Google Auth (Google technology requirement ✅)" />
              <Feature text="✅ Daily Metrics Logging + 7-day scoring" />
              <Feature text="✅ Offline AI using Ollama (local model)" />
            </div>

            <div style={tinyNote}>
              Backend must be running on <b>localhost:8080</b>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div style={loginRight}>
          <div style={loginCard}>
            <h2 style={{ marginTop: 0, fontSize: 28 }}>Welcome back 👋</h2>
            <p style={{ marginTop: 6, color: "#9aa3af" }}>
              Login to continue tracking your PresenceIQ.
            </p>

            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <label style={{ ...labelStyle, marginTop: 12, display: "block" }}>
                Password
              </label>
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              {/* Remember me / Forgot */}
              <div style={rememberRow}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span style={{ color: "#e5e7eb", fontSize: 13 }}>Remember me</span>
                </label>

                <button
                  onClick={() => showToast("Demo only: password reset not implemented", "info")}
                  style={linkBtn}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button onClick={login} style={loginPrimaryBtn}>
              Login with Email
            </button>

            <div style={orLine}>
              <div style={orLineBar}></div>
              <span style={orText}>OR</span>
              <div style={orLineBar}></div>
            </div>

            <button onClick={loginWithGoogle} style={loginGoogleBtn}>
              <span style={googleBtnInner}>
                <span style={googleDot}></span>
                Sign in with Google
              </span>
            </button>

            <div style={secureNote}>🔒 Secure login • JWT Protected APIs</div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     ✅ DASHBOARD
  ------------------------------------------------------- */
  return (
    <div style={appPage}>
      <div style={topBar}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: -0.5 }}>
            Holistic Intelligence Dashboard
          </h1>
          <p style={{ margin: "8px 0 0", color: "#9aa3af" }}>
            Log metrics → compute score → generate AI micro-interventions
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={userTag}>
            <span style={{ color: "#9aa3af" }}>Logged in as</span>{" "}
            <b style={{ color: "#e5e7eb" }}>{userEmail || "user"}</b>
          </div>

          <button onClick={logout} style={dangerBtn}>
            Logout
          </button>
        </div>
      </div>

      <Toast
        text={toast.text}
        type={toast.type}
        onClose={() => setToast({ text: "", type: "info" })}
      />

      <div style={dashboardGrid}>
        {/* Score Card */}
        <div style={cardStyle}>
          <div style={cardHeaderRow}>
            <h2 style={cardTitle}>IQ Core</h2>
            <button onClick={fetchScore} style={btnSmall} disabled={loadingScore}>
              {loadingScore ? "Loading..." : "Refresh"}
            </button>
          </div>

          {!score ? (
            <div style={{ color: "#9aa3af" }}>Loading score...</div>
          ) : (
            <>
              <div style={{ width: 240, height: 240, margin: "22px auto" }}>
                <CircularProgressbar
                  value={score.iqCore}
                  text={`${score.iqCore}/100`}
                  styles={buildStyles({
                    textColor: "white",
                    pathColor: "#2563eb",
                    trailColor: "#2a2a2a",
                  })}
                />
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={miniStat}>
                  <span style={{ color: "#9aa3af" }}>Recovery</span>
                  <b>{score.recovery}</b>
                </div>
                <div style={miniStat}>
                  <span style={{ color: "#9aa3af" }}>Digital Hygiene</span>
                  <b>{score.digitalHygiene}</b>
                </div>
              </div>

              <button
                onClick={fetchScore}
                style={primaryBtnFull}
                disabled={loadingScore}
              >
                {loadingScore ? "Refreshing..." : "Refresh Score"}
              </button>
            </>
          )}
        </div>

        {/* Metrics + Pillars + AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <MetricsForm
            token={token}
            onSaved={() => {
              showToast("✅ Metrics saved", "success");
              fetchScore();
              fetchAi();
            }}
          />

          {/* Pillars */}
          <div style={cardStyle}>
            <div style={cardHeaderRow}>
              <h2 style={cardTitle}>Pillars</h2>
              <div style={pillMuted}>Last 7 days</div>
            </div>

            {!score ? (
              <div style={{ color: "#9aa3af" }}>Loading pillars...</div>
            ) : (
              <>
                <PillarBar label="Intellect (Academics)" value={score.intellect} />
                <PillarBar label="Vitality (Physical)" value={score.vitality} />
                <PillarBar label="Zen (Mental)" value={score.zen} />
                <PillarBar label="Digital Hygiene" value={score.digitalHygiene} />

                <button onClick={fetchScore} style={primaryBtnFull} disabled={loadingScore}>
                  {loadingScore ? "Refreshing..." : "Refresh Score"}
                </button>
              </>
            )}
          </div>

          {/* AI Suggestion */}
          <SuggestionCard />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ✅ GLOBAL STYLES
------------------------------------------------------- */

const appPage = {
  minHeight: "100vh",
  background: "#0b0b0b",
  color: "white",
  fontFamily: "Arial, sans-serif",
  padding: "28px 20px",
};

const topBar = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: "6px 6px 22px",
};

const dashboardGrid = {
  maxWidth: 1100,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "1fr 1.55fr",
  gap: 18,
  alignItems: "start",
};

const cardStyle = {
  background: "rgba(16,16,16,0.92)",
  border: "1px solid #242424",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  backdropFilter: "blur(10px)",
};

const cardHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 8,
};

const cardTitle = {
  margin: 0,
  fontSize: 20,
  letterSpacing: -0.2,
};

const pillMuted = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #242424",
  background: "#0e0e0e",
  color: "#9aa3af",
  fontSize: 12,
};

const labelStyle = {
  fontSize: 13,
  color: "#cbd5e1",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: 12,
  marginTop: 8,
  borderRadius: 12,
  border: "1px solid #2b2b2b",
  outline: "none",
  background: "#0b0b0b",
  color: "white",
  fontSize: 15,
};

const btnSmall = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #2b2b2b",
  background: "#0b0b0b",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const primaryBtnFull = {
  width: "100%",
  marginTop: 12,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
  letterSpacing: 0.2,
};

const dangerBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #2b2b2b",
  background: "#0b0b0b",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
  width: 120,
};

const userTag = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #242424",
  background: "#0e0e0e",
  fontSize: 12,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 14,
  marginTop: 14,
};

const barTrack = {
  marginTop: 8,
  height: 12,
  background: "#1f1f1f",
  borderRadius: 999,
  overflow: "hidden",
};

const barFill = {
  height: "100%",
  background: "#2563eb",
  borderRadius: 999,
};

const miniStat = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#0e0e0e",
  border: "1px solid #242424",
  borderRadius: 14,
  padding: "10px 12px",
};

const severityDot = {
  width: 10,
  height: 10,
  borderRadius: 999,
};

const actionList = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const actionChip = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #2b2b2b",
  background: "#0b0b0b",
  color: "#e5e7eb",
  fontSize: 13,
};

/* -------------------------------------------------------
   ✅ LOGIN STYLES + Animated background
------------------------------------------------------- */

const loginPage = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "1.15fr 1fr",
  background: "#0b0b0b",
  color: "white",
  fontFamily: "Arial, sans-serif",
  position: "relative",
  overflow: "hidden",
};

const bgGlowA = {
  position: "absolute",
  top: -120,
  left: -120,
  width: 380,
  height: 380,
  borderRadius: 999,
  background: "rgba(37,99,235,0.35)",
  filter: "blur(60px)",
  animation: "floatA 6s ease-in-out infinite",
};

const bgGlowB = {
  position: "absolute",
  bottom: -140,
  right: -140,
  width: 420,
  height: 420,
  borderRadius: 999,
  background: "rgba(34,197,94,0.25)",
  filter: "blur(70px)",
  animation: "floatB 7s ease-in-out infinite",
};

const loginLeft = {
  padding: "64px 60px",
  borderRight: "1px solid #1f1f1f",
  display: "flex",
  alignItems: "center",
  position: "relative",
  zIndex: 5,
};

const loginRight = {
  padding: "64px 40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  zIndex: 5,
};

const loginCard = {
  width: "100%",
  maxWidth: 430,
  background: "rgba(16,16,16,0.92)",
  border: "1px solid #242424",
  borderRadius: 18,
  padding: 26,
  boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
  backdropFilter: "blur(12px)",
};

const logoBadge = {
  width: 54,
  height: 54,
  borderRadius: 16,
  background: "#2563eb",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  letterSpacing: 1,
  marginBottom: 18,
};

const loginTitle = {
  fontSize: 56,
  margin: 0,
  lineHeight: 1,
  letterSpacing: -1,
};

const loginSubtitle = {
  marginTop: 14,
  fontSize: 16,
  color: "#9aa3af",
  maxWidth: 540,
  lineHeight: 1.6,
};

const featureList = {
  marginTop: 24,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const tinyNote = {
  marginTop: 22,
  color: "#9aa3af",
  fontSize: 13,
};

const rememberRow = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const linkBtn = {
  background: "transparent",
  border: "none",
  color: "#93c5fd",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};

const loginPrimaryBtn = {
  width: "100%",
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const orLine = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 16,
};

const orLineBar = {
  flex: 1,
  height: 1,
  background: "#1f1f1f",
};

const orText = {
  color: "#9aa3af",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 1,
};

const loginGoogleBtn = {
  width: "100%",
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #2b2b2b",
  background: "#0b0b0b",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const googleBtnInner = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "center",
};

const googleDot = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#22c55e",
};

const secureNote = {
  marginTop: 18,
  color: "#9aa3af",
  fontSize: 13,
  textAlign: "center",
};

/* -------------------------------------------------------
   ✅ TOAST
------------------------------------------------------- */

const toastWrap = {
  position: "fixed",
  top: 18,
  right: 18,
  zIndex: 9999,
};

const toastCard = {
  minWidth: 260,
  maxWidth: 380,
  background: "rgba(16,16,16,0.95)",
  border: "1px solid #2b2b2b",
  borderLeftWidth: 6,
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

const toastClose = {
  background: "transparent",
  border: "none",
  color: "#9aa3af",
  cursor: "pointer",
  fontSize: 14,
};
