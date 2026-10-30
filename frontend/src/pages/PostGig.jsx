import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const categories = [
  "design", "video", "photography", "coding", "writing", "social-media", "other",
];

export default function PostGig() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "design", skills: "",
    budgetType: "unpaid", budgetAmount: "", deadline: "",
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
      await api.post("/gigs", {
        title: form.title,
        description: form.description,
        category: form.category,
        skillsRequired: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        budgetType: form.budgetType,
        budgetAmount: Number(form.budgetAmount) || 0,
        deadline: form.deadline,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container narrow-lg">
      <h2>Post a gig</h2>
      <form onSubmit={handleSubmit} className="form">
        <input name="title" placeholder="Gig title" value={form.title}
          onChange={update} required maxLength={120} />
        <textarea name="description" rows="5" placeholder="Describe the work..."
          value={form.description} onChange={update} required />
        <select name="category" value={form.category} onChange={update}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="skills" placeholder="Skills needed (comma separated, e.g. Photoshop, Canva)"
          value={form.skills} onChange={update} />
        <select name="budgetType" value={form.budgetType} onChange={update}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="certificate">Certificate</option>
        </select>
        {form.budgetType === "paid" && (
          <input name="budgetAmount" type="number" min="0" placeholder="Amount in ₹"
            value={form.budgetAmount} onChange={update} required />
        )}
        <label className="muted">Deadline</label>
        <input name="deadline" type="date" value={form.deadline}
          onChange={update} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Posting..." : "Post gig"}
        </button>
      </form>
    </div>
  );
}