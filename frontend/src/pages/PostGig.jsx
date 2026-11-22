import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES } from "../utils";

function todayString() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

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
      const res = await api.post("/gigs", {
        title: form.title,
        description: form.description,
        category: form.category,
        skillsRequired: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        budgetType: form.budgetType,
        budgetAmount: Number(form.budgetAmount) || 0,
        deadline: form.deadline,
      });
      navigate(`/manage/${res.gig._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container narrow-lg">
      <span className="eyebrow">New gig</span>
      <h2 className="section-title">Post a gig</h2>
      <p className="muted">Be specific about the work, skills and deadline. Students see this in the marketplace.</p>

      <form onSubmit={handleSubmit} className="form card" style={{ marginTop: 16 }}>
        <label>Title</label>
        <input name="title" placeholder="e.g. Main poster + Instagram kit for TechFest"
          value={form.title} onChange={update} required maxLength={120} />

        <label>Description</label>
        <textarea name="description" rows="6"
          placeholder="What do you need, what should the final delivery look like?"
          value={form.description} onChange={update} required />

        <label>Category</label>
        <select name="category" value={form.category} onChange={update}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <label>Skills needed</label>
        <input name="skills" placeholder="Comma separated, e.g. Figma, Photoshop"
          value={form.skills} onChange={update} />

        <label>Budget</label>
        <select name="budgetType" value={form.budgetType} onChange={update}>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="certificate">Certificate</option>
        </select>
        {form.budgetType === "paid" && (
          <input name="budgetAmount" type="number" min="1" placeholder="Amount in ₹"
            value={form.budgetAmount} onChange={update} required />
        )}

        <label>Deadline</label>
        <input name="deadline" type="date" min={todayString()} value={form.deadline}
          onChange={update} required />
        <p className="hint">Applications close at the end of this day, then the gig leaves the marketplace.</p>

        {error && <p className="error">{error}</p>}
        <button className="btn btn-purple" disabled={busy}>
          {busy ? "Posting…" : "Post gig"}
        </button>
      </form>
    </div>
  );
}