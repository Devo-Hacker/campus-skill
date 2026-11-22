import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { avatarColor, formatDate, initials } from "../utils";

export default function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/students/${id}`).then(setData).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!data) return <div className="container"><p className="muted">Loading…</p></div>;

  const { student, reviews, averageRating, totalReviews } = data;

  return (
    <div className="container narrow-lg">
      <div className="card">
        <div className="profile-head">
          <span className="avatar avatar-lg" style={{ background: avatarColor(student.name) }}>
            {initials(student.name)}
          </span>
          <div>
            <h2 style={{ margin: 0 }}>{student.name}</h2>
            <p className="muted">
              {averageRating
                ? `★ ${averageRating} · ${totalReviews} review${totalReviews > 1 ? "s" : ""}`
                : "No reviews yet"}
              {" · "}Member since {formatDate(student.createdAt)}
            </p>
          </div>
        </div>

        {student.bio && <p>{student.bio}</p>}

        {student.skills?.length > 0 && (
          <>
            <h4>Skills</h4>
            <div className="chips">
              {student.skills.map((s) => <span key={s} className="chip">{s}</span>)}
            </div>
          </>
        )}

        {student.portfolio?.length > 0 && (
          <>
            <h4 style={{ marginTop: 18 }}>Portfolio</h4>
            <div className="link-list">
              {student.portfolio.map((p) => (
                <a key={p} href={p} target="_blank" rel="noreferrer">{p}</a>
              ))}
            </div>
          </>
        )}
      </div>

      <h3 style={{ marginTop: 26 }}>Reviews from clubs</h3>
      {reviews.length === 0 ? (
        <div className="card empty"><p>No reviews yet.</p></div>
      ) : (
        <div className="list">
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <div className="row-between">
                <span className="star-row">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="muted small">{formatDate(r.createdAt)}</span>
              </div>
              <p className="muted small">for "{r.gig?.title}"</p>
              {r.comment && <p>{r.comment}</p>}
              <p className="muted small">— {r.reviewer?.clubName || r.reviewer?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}