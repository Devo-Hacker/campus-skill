import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import {
  avatarColor, budgetText, categoryLabel, deadlineLabel, formatDate, initials, timeAgo,
} from "../utils";

const ORDER = { accepted: 0, pending: 1, rejected: 2 };

export default function ManageGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [apps, setApps] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    async function load() {
      try {
        const g = await api.get(`/gigs/${id}`);
        setGig(g.gig);
        const a = await api.get(`/gigs/${id}/apply`);
        setApps(a.applications);

        if (g.gig.status === "completed" && g.gig.hiredStudent) {
          const p = await api.get(`/students/${g.gig.hiredStudent._id}`).catch(() => null);
          const found = p?.reviews?.find((r) => String(r.gig?._id) === String(id));
          setMyReview(found || null);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id, reload]);

  async function decide(app, status) {
    if (status === "accepted" && !window.confirm(`Accept ${app.student.name}? All other pending applicants will be rejected.`)) return;
    setError("");
    try {
      await api.patch(`/applications/${app._id}`, { status });
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function completeGig() {
    if (!window.confirm("Mark this gig as completed?")) return;
    setError("");
    try {
      await api.patch(`/gigs/${id}`, { status: "completed" });
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteGig() {
    if (!window.confirm("Delete this gig? Applicants will be notified.")) return;
    try {
      await api.delete(`/gigs/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setReviewMsg({ type: "", text: "" });
    try {
      await api.post("/reviews", { gigId: id, rating: review.rating, comment: review.comment });
      setReload((n) => n + 1);
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  }

  if (!gig) {
    return (
      <div className="container">
        {error ? <p className="error">{error}</p> : <p className="muted">Loading…</p>}
      </div>
    );
  }

  const sorted = [...apps].sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  return (
    <div className="container narrow-lg">
      <Link to="/dashboard" className="muted small">← Back to dashboard</Link>

      <div className="card" style={{ marginTop: 10 }}>
        <div className="card-top">
          <span className={`cat cat-${gig.category}`}>{categoryLabel(gig.category)}</span>
          <span className={`status ${gig.status}`}>{gig.status}</span>
        </div>
        <h2 style={{ fontSize: "1.7rem", marginTop: 12 }}>{gig.title}</h2>
        <p className="desc">{gig.description}</p>
        <div className="info-row">
          <div><span className="muted">Budget</span><br /><strong>{budgetText(gig)}</strong></div>
          <div><span className="muted">Deadline</span><br /><strong>{formatDate(gig.deadline)}</strong></div>
          {gig.status === "open" && (
            <div><span className="muted">Time left</span><br /><strong>{deadlineLabel(gig.deadline)}</strong></div>
          )}
          {gig.hiredStudent && (
            <div>
              <span className="muted">Hired</span><br />
              <Link to={`/students/${gig.hiredStudent._id}`}><strong>{gig.hiredStudent.name}</strong></Link>
            </div>
          )}
        </div>

        <div className="actions">
          <Link to={`/gigs/${gig._id}`} className="btn btn-outline btn-sm">Public page</Link>
          {gig.status === "in-progress" && (
            <button className="btn btn-lime btn-sm" onClick={completeGig}>Mark as completed</button>
          )}
          {gig.status === "open" && (
            <button className="btn btn-danger btn-sm" onClick={deleteGig}>Delete gig</button>
          )}
        </div>
      </div>

      {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}

      {gig.status === "completed" && gig.hiredStudent && (
        <div className="card" style={{ marginTop: 20 }}>
          {myReview ? (
            <>
              <h3>Your review of {gig.hiredStudent.name}</h3>
              <div className="star-row">{"★".repeat(myReview.rating)}{"☆".repeat(5 - myReview.rating)}</div>
              {myReview.comment && <p>{myReview.comment}</p>}
            </>
          ) : (
            <>
              <h3>Rate {gig.hiredStudent.name}</h3>
              <form onSubmit={submitReview} className="form">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n}
                      className={`star ${n <= review.rating ? "on" : ""}`}
                      onClick={() => setReview({ ...review, rating: n })}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea rows="3" placeholder="How was the work?" maxLength={500}
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })} />
                {reviewMsg.text && <p className="error">{reviewMsg.text}</p>}
                <button className="btn btn-purple">Submit review</button>
              </form>
            </>
          )}
        </div>
      )}

      <h3 style={{ marginTop: 28 }}>Applicants ({apps.length})</h3>
      {apps.length === 0 ? (
        <div className="card empty"><p>No applications yet. Share the gig and check back soon.</p></div>
      ) : (
        <div className="list">
          {sorted.map((a) => (
            <div key={a._id} className="card">
              <div className="applicant-top">
                <Link to={`/students/${a.student._id}`} className="person">
                  <span className="avatar" style={{ background: avatarColor(a.student.name) }}>
                    {initials(a.student.name)}
                  </span>
                  <span>
                    <strong>{a.student.name}</strong>
                    <div className="muted small">applied {timeAgo(a.createdAt)}</div>
                  </span>
                </Link>
                <span className={`status ${a.status}`}>{a.status}</span>
              </div>

              <p>{a.message}</p>
              {a.portfolioLink && (
                <p><a href={a.portfolioLink} target="_blank" rel="noreferrer">View portfolio link ↗</a></p>
              )}
              {a.student.skills?.length > 0 && (
                <div className="chips">
                  {a.student.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              )}

              {a.status === "pending" && gig.status === "open" && (
                <div className="actions">
                  <button className="btn btn-sm" onClick={() => decide(a, "accepted")}>Accept</button>
                  <button className="btn btn-outline btn-sm" onClick={() => decide(a, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}