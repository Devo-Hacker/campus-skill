import { useEffect, useState } from "react";
import { api } from "../api";
import GigCard from "../components/GigCard";

const categories = [
  "design", "video", "photography", "coding", "writing", "social-media", "other",
];

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", category: "", budgetType: "" });

  // Re-fetch whenever a filter changes (search waits 400ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
        const data = await api.get(`/gigs?${params.toString()}`);
        setGigs(data.gigs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  function update(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div className="container">
      <h2>Browse Gigs</h2>

      <div className="filters">
        <input name="search" placeholder="Search by title..."
          value={filters.search} onChange={update} />
        <select name="category" value={filters.category} onChange={update}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="budgetType" value={filters.budgetType} onChange={update}>
          <option value="">Any budget</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="certificate">Certificate</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading gigs...</p>
      ) : gigs.length === 0 ? (
        <p className="muted">No gigs found.</p>
      ) : (
        <div className="grid">
          {gigs.map((g) => <GigCard key={g._id} gig={g} />)}
        </div>
      )}
    </div>
  );
}