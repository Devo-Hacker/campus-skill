import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils";

function Bell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  async function load() {
    try {
      const data = await api.get("/notifications");
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      // ignore (e.g. session expired)
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      await load();
      try {
        await api.patch("/notifications"); // mark all as read
        setUnread(0);
      } catch {
        // ignore
      }
    }
  }

  function openItem(n) {
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div className="bell-wrap" ref={ref}>
      <button className="bell" onClick={toggle} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="bell-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="dropdown">
          <div className="dropdown-head">Notifications</div>
          {items.length === 0 ? (
            <p className="muted pad">Nothing yet. Updates about your gigs show up here.</p>
          ) : (
            items.map((n) => (
              <button
                key={n._id}
                className={`notif ${n.read ? "" : "unread"}`}
                onClick={() => openItem(n)}
              >
                <span>{n.message}</span>
                <small>{timeAgo(n.createdAt)}</small>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function goHow(e) {
    e.preventDefault();
    setMenuOpen(false);
    const scroll = () =>
      document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
    if (location.pathname === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 200);
    }
  }

  const cls = ({ isActive }) => (isActive ? "active" : "");

  return (
    <header className="nav-wrap">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="logo">Cg</span>
          <span className="brand-text">
            <strong>CampusGigs</strong>
            <small>inside your college</small>
          </span>
        </Link>

        <button className="burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-panel ${menuOpen ? "open" : ""}`}>
          <div className="menu-links">
            <NavLink to="/gigs" className={cls}>Marketplace</NavLink>
            <a href="/#how" onClick={goHow}>How it works</a>
            <NavLink to="/clubs" className={cls}>Clubs</NavLink>
            <NavLink to="/leaderboard" className={cls}>Leaderboard</NavLink>
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                {user.role === "club" && (
                  <Link to="/post-gig" className="btn btn-lime btn-sm">+ Post gig</Link>
                )}
                <Bell />
                <Link to="/dashboard" className="btn btn-outline btn-sm">Dashboard</Link>
                <Link to="/profile" className="badge" title="Edit profile">{user.role}</Link>
                <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
                <Link to="/register" className="btn btn-sm">Join free</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}