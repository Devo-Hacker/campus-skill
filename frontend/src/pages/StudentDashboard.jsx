import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { budgetText, deadlineLabel, formatDate, timeAgo } from "../utils";

const TABS = [
  ["all", "All"],
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["rejected", "Not selected"],
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/me/applications"),
      api.get(`/students/${user.id}`).catch(() => null),
    ])
      .then(([a, p]) => {
        setApps(a.applications.filter((x) => x.gig));
        setProfile(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function withdraw(app) {
    if (!window.confirm(`Withdraw your application for "${app.gig.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/applications/${app._id}`);
      setApps((list) => list.filter((a) => a._id !== app._id));
    } catch (err) {
      setError(err.message);
    }
  }

  const count = (s) => apps.filter((a) => a.status === s).length;
  const shown = tab === "all" ? apps : apps.filter((a) => a.status === tab);

  return (
    <>
      <div className="tiles">
        <div className="tile t1"><strong>{apps.length}</strong><span>Applications</span></div>
        <div className="tile t2"><strong>{count("pending")}</strong><span>Waiting for reply</span></div>
        <div className="tile t3"><strong>{count("accepted")}</strong><span>Gigs won</span></div>
        <div className="tile t4">
          <strong>{profile?.averageRating ? `${profile.averageRating} ★` : "–"}</strong>
          <span>{profile?.totalReviews ? `${profile.totalReviews} review${profile.totalReviews > 1 ? "s" : ""}` : "No reviews yet"}</span>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(([v, label]) => (
          <button key={v} className={`tab ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="card empty">
          <p>{apps.length === 0 ? "You haven't applied to any gigs yet." : "Nothing in this tab."}</p>
          {apps.length === 0 && <Link to="/gigs" className="btn btn-sm">Find a gig</Link>}
        </div>
      ) : (
        <div className="list">
          {shown.map((a) => (
            <div key={a._id} className="card">
              <div className="applicant-top">
                <div>
                  <Link to={`/gigs/${a.gig._id}`}><strong>{a.gig.title}</strong></Link>
                  <div className="muted small">
                    {a.gig.postedBy?.clubName || a.gig.postedBy?.name} · {budgetText(a.gig)} · applied {timeAgo(a.createdAt)}
                  </div>
                </div>
                <span className={`status ${a.status}`}>{a.status === "rejected" ? "not selected" : a.status}</span>
              </div>

              {a.status === "accepted" && (
                <div className="notice good">
                  You got this gig! It is currently <strong>{a.gig.status}</strong>.
                  {a.gig.status === "completed" && " Once the club reviews your work, it shows on your profile."}
                </div>
              )}
              {a.status === "pending" && (
                <p className="muted small">
                  {a.gig.status === "open"
                    ? `Deadline: ${formatDate(a.gig.deadline)} (${deadlineLabel(a.gig.deadline)})`
                    : "The club is deciding."}
                </p>
              )}

              <div className="actions">
                <Link to={`/gigs/${a.gig._id}`} className="btn btn-outline btn-sm">View gig</Link>
                {a.status === "pending" && (
                  <button className="btn btn-danger btn-sm" onClick={() => withdraw(a)}>Withdraw</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}