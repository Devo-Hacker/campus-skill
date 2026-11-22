import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Door({ role, tag, title, sub, emailPlaceholder, cta, ctaClass, dark, footer }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password, role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`door ${dark ? "door-dark" : "door-light"}`}>
      <span className={`pill ${dark ? "pill-green" : "pill-dark"}`} style={{ alignSelf: "flex-start" }}>
        {tag}
      </span>
      <h3>{title}</h3>
      <p className="door-sub">{sub}</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email" placeholder={emailPlaceholder} value={email}
          onChange={(e) => setEmail(e.target.value)} required
        />
        <div className="pw-wrap">
          <input
            type={show ? "text" : "password"} placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {error && (
          <p className="error" style={dark ? { color: "#fecaca" } : undefined}>{error}</p>
        )}
        <button className={`btn ${ctaClass}`} disabled={busy}>
          {busy ? "Logging in…" : cta}
        </button>
      </form>

      <p className="door-foot">{footer}</p>
    </div>
  );
}

export default function Login() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container">
      <div className="center-head">
        <h2 className="section-title">Log in to your campus</h2>
        <p className="muted">One platform, two doors. Your session is restored when you come back.</p>
      </div>

      <div className="auth-grid">
        <Door
          role="student" dark tag="For students" title="Log in as Student"
          sub="Apply to gigs, get hired, build verified rep."
          emailPlaceholder="Your email" cta="Log in as Student →" ctaClass="btn-lime"
          footer={<>New here? <Link to="/register?role=student">Register as student</Link></>}
        />
        <Door
          role="club" tag="For clubs" title="Log in as Club"
          sub="Post gigs, review applicants, rate work."
          emailPlaceholder="Club admin email" cta="Log in as Club →" ctaClass="btn-purple"
          footer={<>Running a club? <Link to="/register?role=club">Register your club</Link></>}
        />
      </div>
    </div>
  );
}