import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatDate } from "../components/GigCard";

export default function StudentDashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/me/applications")
      .then((data) => setApps(data.applications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="row-between">
        <h3>My applications</h3>
        <Link to="/gigs" className="btn">Browse gigs</Link>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : apps.length === 0 ? (
        <p className="muted">You haven't applied to any gigs yet.</p>
      ) : (
        <div className="list">
          {apps.map((a) =>
            a.gig ? (
              <Link key={a._id} to={`/gigs/${a.gig._id}`} className="card list-item">
                <div>
                  <strong>{a.gig.title}</strong>
                  <p className="muted">
                    {a.gig.postedBy?.clubName || a.gig.postedBy?.name} · applied {formatDate(a.createdAt)}
                  </p>
                  {a.status === "accepted" && (
                    <p className="success">You got the gig! Gig status: {a.gig.status}</p>
                  )}
                </div>
                <span className={`status ${a.status}`}>{a.status}</span>
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}