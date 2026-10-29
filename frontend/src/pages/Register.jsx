import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "student", clubName: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="form">
        <select name="role" value={form.role} onChange={update}>
          <option value="student">I'm a student (freelancer)</option>
          <option value="club">I'm a club (manager)</option>
        </select>
        <input name="name" placeholder="Full name" value={form.name}
          onChange={update} required />
        {form.role === "club" && (
          <input name="clubName" placeholder="Club name" value={form.clubName}
            onChange={update} required />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email}
          onChange={update} required />
        <input name="password" type="password" placeholder="Password (min 6 chars)"
          value={form.password} onChange={update} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Creating..." : "Register"}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}