import { Link } from "react-router-dom";
import { budgetText, categoryLabel, deadlineLabel, daysLeft, formatDate } from "../utils";

export { budgetText, daysLeft, formatDate };

export default function GigCard({ gig }) {
  const isOpen = gig.status === "open";
  const club = gig.postedBy?.clubName || gig.postedBy?.name || "Unknown club";
  const type =
    gig.budgetType === "paid" ? "Paid" : gig.budgetType === "certificate" ? "Certificate" : "Unpaid";

  return (
    <Link to={`/gigs/${gig._id}`} className="card gig-card">
      <div className="card-top">
        <span className={`cat cat-${gig.category}`}>{categoryLabel(gig.category)}</span>
        {isOpen ? (
          <span className="time">{deadlineLabel(gig.deadline)}</span>
        ) : (
          <span className={`status ${gig.status}`}>{gig.status}</span>
        )}
      </div>

      <h3 className="gig-title">{gig.title}</h3>
      <p className="muted small">{club}</p>

      {gig.skillsRequired?.length > 0 && (
        <div className="chips">
          {gig.skillsRequired.slice(0, 3).map((s) => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>
      )}

      <div className="card-bottom">
        <div>
          <strong className="price">{budgetText(gig)}</strong>
          <div className="muted small">
            {type} · {gig.applicantsCount ?? 0} applied
          </div>
        </div>
        <span className="pill-btn">{isOpen ? "Apply" : "View"}</span>
      </div>
    </Link>
  );
}