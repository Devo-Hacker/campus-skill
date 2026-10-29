import { Link } from "react-router-dom";

export function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function budgetText(gig) {
  if (gig.budgetType === "paid") return `₹${gig.budgetAmount}`;
  if (gig.budgetType === "certificate") return "Certificate";
  return "Unpaid";
}

export default function GigCard({ gig }) {
  return (
    <Link to={`/gigs/${gig._id}`} className="card gig-card">
      <div className="card-top">
        <span className="tag">{gig.category}</span>
        <span className={`status ${gig.status}`}>{gig.status}</span>
      </div>
      <h3>{gig.title}</h3>
      <p className="muted">
        by {gig.postedBy?.clubName || gig.postedBy?.name || "Unknown club"}
      </p>
      <div className="card-bottom">
        <strong>{budgetText(gig)}</strong>
        <span className="muted">Due {formatDate(gig.deadline)}</span>
      </div>
    </Link>
  );
}