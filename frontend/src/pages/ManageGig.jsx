import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { budgetText, formatDate } from "../components/GigCard";

export default function ManageGig() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [apps, setApps] = useState([]);
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
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [id, reload]);

  async function decide(appId, status) {
    setError("");
    try {
      await api.patch(`/applications/${appId}`, { status });
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function completeGig() {
    setError("");
    try {
      await api.patch(`/gigs/${id}`, { status: "completed" });
      setReload((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setReviewMsg({ type: "", text: "" });
    try {
      await api.post("/reviews", {
        gigId: id,
        rating: Number(review.rating),
        comment: review.comment,
      });
      setReviewMsg({ type: "success", text: "Review submitted. Thank you!" });
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    }
  }

  if (!gig) {
    return (
      <div className="container">
        {error ? <p className="error">{error}</p> : <p className="muted">Loading...</p>}
      </div>
    );
  }

  return (
    <div className="container narrow-lg">
      <div className="card">
        <div className="card-top">
          <span className="tag">{gig.category}</span>
          <span className={`status ${gig.status}`}>{gig.status}</span>
        </div>
        <h2>{gig.title}</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{gig.description}</p>
        <div className="info-row">
          <div><span className="muted">Budget</span><br /><strong>{budgetText(gig)}</strong></div>
          <div><span className="muted">Deadline</span><br /><strong>{formatDate(gig.deadline)}</strong></div>
        </div>

        {gig.status === "in-progress" && (
          <button className="btn" onClick={completeGig}>Mark as completed</button>
        )}
      </div>

      {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}

      {gig.status === "completed" && gig.hiredStudent && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Rate {gig.hiredStudent.name}</h3>
          <form onSubmit={submitReview} className="form">
            <select value={review.rating}
              onChange={(e) => setReview({ ...review, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
              ))}
            </select>
            <textarea rows="3" placeholder="How was the work?" maxLength={500}
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            {reviewMsg.text && (
              <p className={reviewMsg.type === "error" ? "error" : "success"}>{reviewMsg.text}</p>
            )}
            <button className="btn">Submit review</button>
          </form>
        </div>
      )}

      <h3 style={{ marginTop: 28 }}>Applicants ({apps.length})</h3>
      {apps.length === 0 ? (
        <p className="muted">No applications yet.</p>
      ) : (
        <div className="list">
          {apps.map((a) => (
            <div key={a._id} className="card">
              <div className="row-between">
                <Link to={`/students/${a.student._id}`}>
                  <strong>{a.student.name}</strong>
                </Link>
                <span className={`status ${a.status}`}>{a.status}</span>
              </div>
              <p>{a.message}</p>
              {a.portfolioLink && (
                <p><a href={a.portfolioLink} target="_blank" rel="noreferrer">Portfolio link</a></p>
              )}
              {a.student.skills?.length > 0 && (
                <div className="chips">
                  {a.student.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              )}
              {a.status === "pending" && gig.status === "open" && (
                <div className="actions">
                  <button className="btn" onClick={() => decide(a._id, "accepted")}>Accept</button>
                  <button className="btn btn-outline" onClick={() => decide(a._id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}