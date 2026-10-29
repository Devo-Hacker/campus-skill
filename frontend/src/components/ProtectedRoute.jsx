import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// role is optional: <ProtectedRoute role="club"> only lets clubs in
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}