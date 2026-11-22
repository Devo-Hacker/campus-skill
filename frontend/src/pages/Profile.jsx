import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { avatarColor, initials } from "../utils";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const isStudent = user.role === "student";

  const [form, setForm] = useState({
    name: user.name || "",
    clubName: user.clubName || "",
    bio: user.bio || "",
    skills: (user.skills || []).join(", "),
    portfolio: (user.portfolio || []).join("\n"),
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);
    try {
      const payload = { name: form.name, bio: form.bio };
      if (isStudent) {
        payload.skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
        payload.portfolio = form.portfolio.split("\n").map((s) => s.trim()).filter(Boolean);
      } else {
        payload.clubName = form.clubName;
      }
      const data = await api.put("/me/profile", payload);
      updateUser(data.user);
      setMsg({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const display = isStudent ? form.name : form.clubName || form.name;

  return (
    <div className="container narrow-lg">
      <div className="page-head">
        <div className="profile-head" style={{ marginBottom: 0 }}>
          <span className="avatar avatar-lg" style={{ background: avatarColor(display) }}>
            {initials(display)}
          </span>
          <div>
            <span className="eyebrow">Edit profile</span>
            <h2 style={{ margin: 0 }}>{display || "Your profile"}</h2>
            <p className="muted">{user.email}</p>
          </div>
        </div>
        {isStudent ? (
          <Link to={`/students/${user.id}`} className="btn btn-outline btn-sm">View public profile</Link>
        ) : (
          <Link to={`/gigs?club=${user.id}`} className="btn btn-outline btn-sm">See my gigs in marketplace</Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form card">
        <label>{isStudent ? "Full name" : "Your name"}</label>
        <input name="name" value={form.name} onChange={update} required />

        {!isStudent && (
          <>
            <label>Club name</label>
            <input name="clubName" value={form.clubName} onChange={update} required />
          </>
        )}

        <label>Bio</label>
        <textarea name="bio" rows="4" value={form.bio} onChange={update}
          placeholder={isStudent ? "Tell clubs about yourself…" : "Tell students about your club…"} />

        {isStudent && (
          <>
            <label>Skills</label>
            <input name="skills" value={form.skills} onChange={update}
              placeholder="Photoshop, Canva, Video editing" />
            <p className="hint">Comma separated. Clubs see these on your applications.</p>

            <label>Portfolio links</label>
            <textarea name="portfolio" rows="4" value={form.portfolio} onChange={update}
              placeholder={"https://behance.net/yourname\nhttps://github.com/yourname"} />
            <p className="hint">One link per line.</p>
          </>
        )}

        {msg.text && <p className={msg.type === "error" ? "error" : "success"}>{msg.text}</p>}
        <button className="btn btn-purple" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}