import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { formatDate } from "../components/GigCard";

export default function StudentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/students/${id}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!data) return <div className="container"><p className="muted">Loading...</p></div>;

  const { student, reviews, averageRating, totalReviews } = data;

  return (
    <div className="container narrow-lg">
      <div className="card">
        <h2>{student.name}</h2>
        <p className="muted">
          {averageRating
            ? `★ ${averageRating} (${totalReviews} review${totalReviews > 1 ? "s" : ""})`
            : "No reviews yet"}
        </p>
        {student.bio && <p>{student.bio}</p>}
        {student.skills?.length > 0 && (
          <div className="chips">
            {student.skills.map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        )}
        {student.portfolio?.length > 0 && (
          <>
            <h4>Portfolio</h4>
            {student.portfolio.map((p) => (
              <p key={p}><a href={p} target="_blank" rel="noreferrer">{p}</a></p>
            ))}
          </>
        )}
      </div>

      <h3 style={{ marginTop: 24 }}>Reviews</h3>
      {reviews.length === 0 ? (
        <p className="muted">No reviews yet.</p>
      ) : (
        <div className="list">
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <strong>{"★".repeat(r.rating)}</strong>
              <span className="muted"> · {r.gig?.title}</span>
              {r.comment && <p>{r.comment}</p>}
              <p className="muted">
                {r.reviewer?.clubName || r.reviewer?.name} · {formatDate(r.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}