import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import ClubDashboard from "./ClubDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="row-between">
        <h2>Welcome, {user.name}</h2>
        <div className="nav-links">
          {user.role === "student" && (
            <Link to={`/students/${user.id}`}>Public profile</Link>
          )}
          <Link to="/profile">Edit profile</Link>
        </div>
      </div>
      {user.role === "student" ? <StudentDashboard /> : <ClubDashboard />}
    </div>
  );
}