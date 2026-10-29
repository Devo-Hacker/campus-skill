import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>Welcome, {user.name}</h2>
      {user.role === "student" ? (
        <StudentDashboard />
      ) : (
        <p className="muted">Club dashboard coming in Part 3.</p>
      )}
    </div>
  );
}