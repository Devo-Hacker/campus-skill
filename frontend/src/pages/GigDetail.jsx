import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { budgetText, formatDate } from "../components/GigCard";

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ message: "", portfolioLink: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/gigs/${id}`)
      .then((data) => setGig(data.gig))
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);
    try {
      await api.post(`/gigs/${id}/apply`, form);
      setMsg({ type: "success", text: "Application sent! Track it in your dashboard." });
      setForm({ message: "", portfolioLink: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!gig) return <div className="container"><p className="muted">Loading...</p></div>;

  return (
    <div className="container narrow-lg">
      <div className="card">
        <div className="card-top">
          <span className="tag">{gig.category}</span>
          <span className={`status ${gig.status}`}>{gig.status}</span>
        </div>
        <h2>{gig.title}</h2>
        <p className="muted">
          Posted by {gig.postedBy?.clubName || gig.postedBy?.name}
        </p>
        <p style={{ whiteSpace: "pre-wrap" }}>{gig.description}</p>

        <div className="info-row">
          <div><span className="muted">Budget</span><br /><strong>{budgetText(gig)}</strong></div>
          <div><span className="muted">Deadline</span><br /><strong>{formatDate(gig.deadline)}</strong></div>
        </div>

        {gig.skillsRequired?.length > 0 && (
          <div className="chips">
            {gig.skillsRequired.map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        )}
      </div>

      {/* Apply section */}
      <div className="card" style={{ marginTop: 20 }}>
        {!user ? (
          <p><Link to="/login">Log in</Link> as a student to apply.</p>
        ) : user.role !== "student" ? (
          <p className="muted">Only students can apply to gigs.</p>
        ) : gig.status !== "open" ? (
          <p className="muted">This gig is no longer accepting applications.</p>
        ) : (
          <form onSubmit={handleApply} className="form">
            <h3>Apply for this gig</h3>
            <textarea rows="4" placeholder="Why are you a good fit?"
              value={form.message} required maxLength={1000}
              onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <input type="url" placeholder="Portfolio link (optional)"
              value={form.portfolioLink}
              onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })} />
            {msg.text && <p className={msg.type === "error" ? "error" : "success"}>{msg.text}</p>}
            <button className="btn" disabled={busy}>
              {busy ? "Sending..." : "Submit application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}