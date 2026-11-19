import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { avatarColor, initials } from "../utils";

export default function Leaderboard() {
  const [talent, setTalent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/leaderboard").then((d) => setTalent(d.talent)).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="container narrow-lg">
      <span className="eyebrow">Leaderboard</span>
      <h2 className="section-title">Top rated students</h2>
      <p className="muted">Ranked by review scores from clubs. More reviews make a rating count for more.</p>

      {error && <p className="error">{error}</p>}
      {!talent ? (
        <p className="muted">Loading…</p>
      ) : talent.length === 0 ? (
        <div className="card empty">
          <p>No reviews yet. Complete a gig and get rated to appear here.</p>
        </div>
      ) : (
        <div className="list">
          {talent.map((t, i) => (
            <Link key={t.id} to={`/students/${t.id}`} className="card list-item">
              <div className="rank-row">
                <span className="rank">{i + 1}</span>
                <span className="avatar" style={{ background: avatarColor(t.name) }}>
                  {initials(t.name)}
                </span>
                <div>
                  <strong>{t.name}</strong>
                  <div className="muted small">{t.skills.join(" · ") || "Student"}</div>
                </div>
              </div>
              <div className="rate-box">
                <strong>★ {t.rating}</strong>
                <span className="muted small">{t.reviews} review{t.reviews === 1 ? "" : "s"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}