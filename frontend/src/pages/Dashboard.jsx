import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h2>Welcome, {user.name}</h2>
      <p>You are logged in as a <strong>{user.role}</strong>.</p>
      {user.role === "club" ? (
        <p>Club dashboard coming next: post gigs and manage applicants.</p>
      ) : (
        <p>Student dashboard coming next: browse gigs and track applications.</p>
      )}
    </div>
  );
}