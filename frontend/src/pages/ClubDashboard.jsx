import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { budgetText, formatDate } from "../components/GigCard";

export default function ClubDashboard() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/me/gigs")
      .then((data) => setGigs(data.gigs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="row-between">
        <h3>My gigs</h3>
        <Link to="/post-gig" className="btn">+ Post a gig</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : gigs.length === 0 ? (
        <p className="muted">You haven't posted any gigs yet.</p>
      ) : (
        <div className="list">
          {gigs.map((g) => (
            <Link key={g._id} to={`/manage/${g._id}`} className="card list-item">
              <div>
                <strong>{g.title}</strong>
                <p className="muted">
                  {budgetText(g)} · due {formatDate(g.deadline)}
                  {g.hiredStudent && ` · hired: ${g.hiredStudent.name}`}
                </p>
              </div>
              <span className={`status ${g.status}`}>{g.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}