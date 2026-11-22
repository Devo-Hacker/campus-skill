import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { budgetText, categoryLabel, deadlineLabel } from "../utils";

const TABS = [
  ["all", "All"],
  ["open", "Open"],
  ["in-progress", "In progress"],
  ["completed", "Completed"],
];

export default function ClubDashboard() {
  const [gigs, setGigs] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/me/gigs")
      .then((d) => setGigs(d.gigs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function remove(g) {
    if (!window.confirm(`Delete "${g.title}"? Applicants will be notified.`)) return;
    setError("");
    try {
      await api.delete(`/gigs/${g._id}`);
      setGigs((list) => list.filter((x) => x._id !== g._id));
    } catch (err) {
      setError(err.message);
    }
  }

  const count = (s) => gigs.filter((g) => g.status === s).length;
  const waiting = gigs.reduce((n, g) => n + (g.pendingCount || 0), 0);
  const shown = tab === "all" ? gigs : gigs.filter((g) => g.status === tab);

  return (
    <>
      <div className="tiles">
        <div className="tile t1"><strong>{count("open")}</strong><span>Open gigs</span></div>
        <div className="tile t2"><strong>{count("in-progress")}</strong><span>In progress</span></div>
        <div className="tile t3"><strong>{count("completed")}</strong><span>Completed</span></div>
        <div className="tile t4"><strong>{waiting}</strong><span>Applicants waiting</span></div>
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
          <p>{gigs.length === 0 ? "You haven't posted any gigs yet." : "Nothing in this tab."}</p>
          {gigs.length === 0 && <Link to="/post-gig" className="btn btn-sm">Post your first gig</Link>}
        </div>
      ) : (
        <div className="list">
          {shown.map((g) => (
            <div key={g._id} className="card">
              <div className="applicant-top">
                <div>
                  <Link to={`/manage/${g._id}`}><strong>{g.title}</strong></Link>
                  <div className="muted small">
                    {categoryLabel(g.category)} · {budgetText(g)}
                    {g.status === "open" && ` · ${deadlineLabel(g.deadline)}`}
                    {g.hiredStudent && ` · hired: ${g.hiredStudent.name}`}
                  </div>
                </div>
                <span className={`status ${g.status}`}>{g.status}</span>
              </div>

              <div className="chips">
                <span className="chip">{g.applicantsCount} applicant{g.applicantsCount === 1 ? "" : "s"}</span>
                {g.pendingCount > 0 && <span className="chip" style={{ background: "#fde68a" }}>{g.pendingCount} waiting</span>}
              </div>

              <div className="actions">
                <Link to={`/manage/${g._id}`} className="btn btn-sm">Manage</Link>
                <Link to={`/gigs/${g._id}`} className="btn btn-outline btn-sm">Public page</Link>
                {g.status === "open" && (
                  <button className="btn btn-danger btn-sm" onClick={() => remove(g)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}