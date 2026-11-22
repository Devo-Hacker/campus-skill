import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: params.get("role") === "club" ? "club" : "student",
    clubName: "",
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const isClub = form.role === "club";

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container narrow">
      <div className="card">
        <h2 className="section-title" style={{ fontSize: "1.8rem" }}>Create your account</h2>
        <p className="muted">
          {isClub ? "Post gigs and hire talented students." : "Apply to gigs and build a verified portfolio."}
        </p>

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 14 }}>
          <div className="seg">
            <button type="button" className={!isClub ? "active" : ""}
              onClick={() => setForm({ ...form, role: "student" })}>
              I'm a student
            </button>
            <button type="button" className={isClub ? "active" : ""}
              onClick={() => setForm({ ...form, role: "club" })}>
              I'm a club
            </button>
          </div>

          <input name="name" placeholder={isClub ? "Your name (coordinator)" : "Full name"}
            value={form.name} onChange={update} required />
          {isClub && (
            <input name="clubName" placeholder="Club name (e.g. Tech Club)"
              value={form.clubName} onChange={update} required />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email}
            onChange={update} required />
          <div className="pw-wrap">
            <input name="password" type={show ? "text" : "password"}
              placeholder="Password (min 6 characters)" value={form.password}
              onChange={update} required minLength={6} />
            <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          <button className="btn btn-purple" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}