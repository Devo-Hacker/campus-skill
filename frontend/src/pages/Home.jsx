import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import GigCard from "../components/GigCard";
import { CATEGORIES, avatarColor, initials, timeAgo } from "../utils";

const TILE_COLORS = ["#ffc58f", "#9cc4ff", "#c8f169", "#ffb3d9", "#d3b8ff"];

export default function Home() {
  const { user } = useAuth();
  const [home, setHome] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/home").then(setHome).catch((e) => setError(e.message));
    api.get("/gigs?limit=6").then((d) => setGigs(d.gigs)).catch(() => {});
  }, []);

  const stats = home?.stats;
  const canPost = !user || user.role === "club";
  const postLink = user ? "/post-gig" : "/register";
  const latest = home?.activity?.[0];
  const num = (v) => (v === undefined || v === null ? "–" : v);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="container hero-grid">
        <div>
          <div className="badge-row">
            <span className="pill pill-white">
              <span className="dot" /> {stats ? `${stats.openGigs} open gigs right now` : "Campus marketplace"}
            </span>
            {stats && stats.clubsHiring > 0 && (
              <span className="pill pill-dark">{stats.clubsHiring} clubs hiring</span>
            )}
          </div>

          <h1 className="hero-title">
            Small gigs.
            <br />
            <span className="grad">Big campus rep.</span>
          </h1>
          <p className="hero-text">
            Clubs post posters, videos, photos and sites. Students apply in one tap, get hired,
            get rated, and graduate with a verified portfolio.
          </p>

          <div className="hero-actions">
            <Link to="/gigs" className="btn btn-purple">Find a gig →</Link>
            {canPost && <Link to={postLink} className="btn btn-outline">Post a gig</Link>}
          </div>

          <div className="stats">
            <div><strong>{num(stats?.students)}</strong><span>students</span></div>
            <div><strong>{num(stats?.completed)}</strong><span>gigs completed</span></div>
            <div>
              <strong>{stats?.avgRating ? `${stats.avgRating} ★` : "–"}</strong>
              <span>avg club rating</span>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        <div className="card fresh">
          <div className="row-between">
            <strong className="fresh-title">Fresh this morning</strong>
            {stats && <span className="pill pill-green">{stats.openGigs} open</span>}
          </div>

          {gigs.length === 0 ? (
            <p className="muted pad">No open gigs yet. Be the first club to post one.</p>
          ) : (
            <div className="fresh-grid">
              {gigs.slice(0, 2).map((g) => <GigCard key={g._id} gig={g} />)}
            </div>
          )}

          {latest && (
            <div className="live-strip">
              <div>
                <strong>{latest.text}</strong>
                <small>{timeAgo(latest.at)}</small>
              </div>
              <span className="pill pill-yellow">Live</span>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Marketplace preview ---------- */}
      <section className="container">
        <div className="row-between">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h2 className="section-title">Pick your playground</h2>
          </div>
          <Link to="/gigs" className="btn btn-outline btn-sm">View all gigs →</Link>
        </div>

        <div className="tabs">
          <Link to="/gigs" className="tab active">All gigs</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.value} to={`/gigs?category=${c.value}`} className="tab">{c.label}</Link>
          ))}
        </div>

        {gigs.length === 0 ? (
          <div className="card empty">
            <p>No open gigs right now.</p>
            {canPost && <Link to={postLink} className="btn btn-sm">Post the first gig</Link>}
          </div>
        ) : (
          <div className="grid" style={{ marginTop: 18 }}>
            {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
          </div>
        )}
      </section>

      {/* ---------- How it works ---------- */}
      <section className="container" id="how">
        <div className="center-head">
          <span className="eyebrow">How CampusGigs works</span>
          <h2 className="section-title">Post → Apply → Get rated</h2>
          <p className="muted">Role-guarded by JWT. Only clubs post, only students apply. Fair by design.</p>
        </div>

        <div className="steps">
          <div className="card step">
            <span className="corner c1">01</span>
            <div className="step-icon" style={{ background: "#ffc58f" }}>📣</div>
            <h3>Clubs post a gig</h3>
            <p className="muted">Posters, aftermovies, fest sites. Add title, skills, budget and a deadline.</p>
          </div>
          <div className="card step">
            <span className="corner c2">02</span>
            <div className="step-icon" style={{ background: "#9cc4ff" }}>✈️</div>
            <h3>Students apply</h3>
            <p className="muted">One tap with a message and portfolio link. One application per gig.</p>
          </div>
          <div className="card step">
            <span className="corner c3">03</span>
            <div className="step-icon" style={{ background: "#c8f169" }}>✅</div>
            <h3>Pick, build &amp; rate</h3>
            <p className="muted">Accept one, the rest are auto-rejected. Mark complete, leave stars, grow reputation.</p>
          </div>
        </div>

        <div className="trust">
          <span className="pill pill-white">🔒 bcrypt + HTTP-only JWT auth</span>
          <span className="pill pill-white">Open → In-progress → Completed</span>
          <span className="pill pill-white">1 review per gig, no fake ratings</span>
        </div>
      </section>

      {/* ---------- Top talent ---------- */}
      <section className="container">
        <div className="talent-band">
          <div className="talent-head">
            <span className="pill pill-yellow">Top rated</span>
            <h3>Top rated talent</h3>
            <small>Ranked by real reviews from clubs</small>
          </div>

          {!home ? (
            <p className="band-note">Loading…</p>
          ) : home.topTalent.length === 0 ? (
            <p className="band-note">
              No ratings yet. The first completed and reviewed gig puts a student here.
            </p>
          ) : (
            <div className="talent-grid">
              {home.topTalent.map((t) => (
                <Link key={t.id} to={`/students/${t.id}`} className="talent-card">
                  <span className="avatar" style={{ background: avatarColor(t.name) }}>
                    {initials(t.name)}
                  </span>
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.skills.join(" · ") || "Student"}</small>
                    <small className="rate">★ {t.rating} ({t.reviews})</small>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Clubs spotlight ---------- */}
      {home?.clubs?.length > 0 && (
        <section className="container">
          <div className="row-between">
            <div>
              <span className="eyebrow">Clubs spotlight</span>
              <h2 className="section-title">Where the action is</h2>
            </div>
            <Link to="/clubs" className="btn btn-outline btn-sm">All clubs →</Link>
          </div>

          <div className="grid" style={{ marginTop: 14 }}>
            {home.clubs.map((c, i) => (
              <Link key={c.id} to={`/gigs?club=${c.id}`} className="card club-card">
                <div className="club-top" style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}>
                  {initials(c.name)}
                </div>
                <div className="row-between club-bottom">
                  <div>
                    <strong>{c.name}</strong>
                    <div className="muted small">{c.openGigs} active gig{c.openGigs === 1 ? "" : "s"}</div>
                  </div>
                  <span className="arrow">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      <section className="container">
        <div className="cta">
          <div>
            <h3>Got something to get done?</h3>
            <p>Post your first gig in about a minute. Students on campus are ready.</p>
          </div>
          <div className="hero-actions">
            {canPost && <Link to={postLink} className="btn btn-lime">Post a gig, it's free</Link>}
            <Link to="/leaderboard" className="btn btn-white">Browse talent</Link>
          </div>
        </div>
      </section>
    </div>
  );
}