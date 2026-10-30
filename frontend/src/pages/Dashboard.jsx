import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";
import ClubDashboard from "./ClubDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>Welcome, {user.name}</h2>
      {user.role === "student" ? <StudentDashboard /> : <ClubDashboard />}
    </div>
  );
}