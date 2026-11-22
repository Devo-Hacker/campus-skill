import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { budgetText, categoryLabel, daysLeft, deadlineLabel, formatDate } from "../utils";

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ message: "", portfolioLink: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/gigs/${id}`).then(setData).catch((err) => setError(err.message));
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);
    try {
      const res = await api.post(`/gigs/${id}/apply`, form);
      setData((d) => ({
        ...d,
        applicantsCount: d.applicantsCount + 1,
        myApplication: { _id: res.application._id, status: "pending" },
      }));
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!window.confirm("Withdraw your application?")) return;
    try {
      await api.delete(`/applications/${data.myApplication._id}`);
      setData((d) => ({ ...d, applicantsCount: d.applicantsCount - 1, myApplication: null }));
      setMsg({ type: "", text: "" });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  }

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!data) return <div className="container"><p className="muted">Loading…</p></div>;

  const { gig, applicantsCount, myApplication } = data;
  const club = gig.postedBy?.clubName || gig.postedBy?.name;
  const isOwner = user && String(gig.postedBy?._id) === String(user.id);
  const expired = daysLeft(gig.deadline) < 0;

  // A plain function (called below), NOT a component, so the form
  // is not re-created on every keystroke and keeps its focus.
  function renderApplySection() {
    if (isOwner) {
      return (
        <>
          <p className="muted">This is your gig.</p>
          <Link to={`/manage/${gig._id}`} className="btn btn-purple" style={{ width: "100%" }}>
            Manage applicants
          </Link>
        </>
      );
    }
    if (!user) {
      return (
        <p>
          <Link to="/login">Log in</Link> as a student to apply, or{" "}
          <Link to="/register?role=student">create an account</Link>.
        </p>
      );
    }
    if (user.role !== "student") return <p className="muted">Only students can apply to gigs.</p>;

    if (myApplication) {
      return (
        <>
          <div
            className={`notice ${
              myApplication.status === "accepted"
                ? "good"
                : myApplication.status === "rejected"
                ? "bad"
                : "warn"
            }`}
          >
            {myApplication.status === "pending" && "You applied. The club hasn't decided yet."}
            {myApplication.status === "accepted" && "You were selected for this gig!"}
            {myApplication.status === "rejected" && "The club chose another applicant this time."}
          </div>
          {myApplication.status === "pending" && (
            <button className="btn btn-danger btn-sm" onClick={withdraw}>
              Withdraw application
            </button>
          )}
          {msg.text && <p className="error">{msg.text}</p>}
        </>
      );
    }
    if (gig.status !== "open") {
      return <div className="notice">This gig is no longer accepting applications.</div>;
    }
    if (expired) return <div className="notice bad">The deadline for this gig has passed.</div>;

    return (
      <form onSubmit={handleApply} className="form">
        <textarea
          rows="5"
          placeholder="Why are you a good fit?"
          value={form.message}
          required
          maxLength={1000}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <input
          type="url"
          placeholder="Portfolio link (optional)"
          value={form.portfolioLink}
          onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
        />
        {msg.text && <p className={msg.type === "error" ? "error" : "success"}>{msg.text}</p>}
        <button className="btn btn-purple" disabled={busy}>
          {busy ? "Sending…" : "Apply now"}
        </button>
      </form>
    );
  }

  return (
    <div className="container">
      <div className="detail-grid">
        <div className="card">
          <div className="card-top">
            <span className={`cat cat-${gig.category}`}>{categoryLabel(gig.category)}</span>
            <span className={`status ${gig.status}`}>{gig.status}</span>
          </div>
          <h2 style={{ fontSize: "1.9rem", marginTop: 14 }}>{gig.title}</h2>
          <p className="muted">
            Posted by <Link to={`/gigs?club=${gig.postedBy?._id}`}>{club}</Link>
          </p>

          <h4 style={{ marginTop: 18 }}>About this gig</h4>
          <p className="desc">{gig.description}</p>

          {gig.skillsRequired?.length > 0 && (
            <>
              <h4 style={{ marginTop: 18 }}>Skills needed</h4>
              <div className="chips">
                {gig.skillsRequired.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </>
          )}

          {gig.hiredStudent && (
            <div className="notice good" style={{ marginTop: 18 }}>
              Hired:{" "}
              <Link to={`/students/${gig.hiredStudent._id}`}>
                <strong>{gig.hiredStudent.name}</strong>
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="card side-card">
            <h3>Gig details</h3>
            <div className="kv"><span>Budget</span><strong>{budgetText(gig)}</strong></div>
            <div className="kv"><span>Deadline</span><strong>{formatDate(gig.deadline)}</strong></div>
            <div className="kv">
              <span>Time left</span>
              <strong>{gig.status === "open" ? deadlineLabel(gig.deadline) : "—"}</strong>
            </div>
            <div className="kv"><span>Applicants</span><strong>{applicantsCount}</strong></div>
          </div>

          <div className="card side-card" style={{ marginTop: 18 }}>
            <h3>{myApplication || isOwner ? "Your status" : "Apply for this gig"}</h3>
            {renderApplySection()}
          </div>
        </div>
      </div>
    </div>
  );
}