import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import ClubDashboard from "./ClubDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const isStudent = user.role === "student";
  const firstName = (isStudent ? user.name : user.clubName || user.name).split(" ")[0];

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">{isStudent ? "Student" : "Club"} dashboard</span>
          <h2>Hey, {firstName} 👋</h2>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          {isStudent ? (
            <>
              <Link to="/gigs" className="btn btn-purple btn-sm">Browse gigs</Link>
              <Link to={`/students/${user.id}`} className="btn btn-outline btn-sm">Public profile</Link>
            </>
          ) : (
            <Link to="/post-gig" className="btn btn-lime btn-sm">+ Post a gig</Link>
          )}
          <Link to="/profile" className="btn btn-outline btn-sm">Edit profile</Link>
        </div>
      </div>

      {isStudent ? <StudentDashboard /> : <ClubDashboard />}
    </div>
  );
}