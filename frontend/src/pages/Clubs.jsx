import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { avatarColor, initials } from "../utils";

export default function Clubs() {
  const [clubs, setClubs] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/clubs").then((d) => setClubs(d.clubs)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="container">
      <span className="eyebrow">Clubs</span>
      <h2 className="section-title">Clubs hiring on campus</h2>

      {error && <p className="error">{error}</p>}
      {!clubs ? (
        <p className="muted">Loading…</p>
      ) : clubs.length === 0 ? (
        <div className="card empty"><p>No clubs have joined yet.</p></div>
      ) : (
        <div className="grid" style={{ marginTop: 16 }}>
          {clubs.map((c) => (
            <Link key={c.id} to={`/gigs?club=${c.id}`} className="card club-card">
              <div className="club-top" style={{ background: avatarColor(c.name) }}>
                {initials(c.name)}
              </div>
              <div className="club-bottom">
                <strong>{c.name}</strong>
                {c.bio && <p className="muted small">{c.bio}</p>}
                <div className="chips" style={{ marginTop: 8 }}>
                  <span className="chip">{c.openGigs} open</span>
                  <span className="chip">{c.completedGigs} completed</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}