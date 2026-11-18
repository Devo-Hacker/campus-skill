import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import GigCard from "../components/GigCard";

export default function Home() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    api.get("/gigs")
      .then((data) => setGigs(data.gigs.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero-section">
        <div className="container hero">
          <h1>Skills for Hire, Campus Edition</h1>
          <p className="hero-text">
            Clubs post small real-world tasks. Students apply, build a portfolio
            and earn reviews, all inside your campus.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn">Get started</Link>
                <Link to="/gigs" className="btn btn-outline">Browse gigs</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          <div className="card step">
            <span className="step-num">1</span>
            <h3>Clubs post gigs</h3>
            <p className="muted">Posters, videos, photos, websites. Set a budget and a deadline.</p>
          </div>
          <div className="card step">
            <span className="step-num">2</span>
            <h3>Students apply</h3>
            <p className="muted">Share a short pitch and your portfolio link.</p>
          </div>
          <div className="card step">
            <span className="step-num">3</span>
            <h3>Work and get rated</h3>
            <p className="muted">The club picks one student, and after the work they leave a review.</p>
          </div>
        </div>
      </section>

      {gigs.length > 0 && (
        <section className="container">
          <div className="row-between">
            <h2 className="section-title">Latest gigs</h2>
            <Link to="/gigs">See all</Link>
          </div>
          <div className="grid">
            {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
          </div>
        </section>
      )}
    </div>
  );
}