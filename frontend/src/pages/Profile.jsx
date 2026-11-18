import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="container narrow-lg">
      <div className="row-between">
        <h2>Edit profile</h2>
        {isStudent && (
          <Link to={`/students/${user.id}`}>View public profile</Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form card">
        <label className="muted">Name</label>
        <input name="name" value={form.name} onChange={update} required />

        {!isStudent && (
          <>
            <label className="muted">Club name</label>
            <input name="clubName" value={form.clubName} onChange={update} />
          </>
        )}

        <label className="muted">Bio</label>
        <textarea name="bio" rows="4" value={form.bio} onChange={update}
          placeholder={isStudent ? "Tell clubs about yourself..." : "Tell students about your club..."} />

        {isStudent && (
          <>
            <label className="muted">Skills (comma separated)</label>
            <input name="skills" value={form.skills} onChange={update}
              placeholder="Photoshop, Canva, Video editing" />

            <label className="muted">Portfolio links (one per line)</label>
            <textarea name="portfolio" rows="4" value={form.portfolio} onChange={update}
              placeholder={"https://behance.net/yourname\nhttps://github.com/yourname"} />
          </>
        )}

        {msg.text && (
          <p className={msg.type === "error" ? "error" : "success"}>{msg.text}</p>
        )}
        <button className="btn" disabled={busy}>
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}