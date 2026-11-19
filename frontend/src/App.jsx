import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Gigs from "./pages/Gigs";
import GigDetail from "./pages/GigDetail";
import PostGig from "./pages/PostGig";
import ManageGig from "./pages/ManageGig";
import StudentProfile from "./pages/StudentProfile";
import Profile from "./pages/Profile";
import Clubs from "./pages/Clubs";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/students/:id" element={<StudentProfile />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/post-gig" element={<ProtectedRoute role="club"><PostGig /></ProtectedRoute>} />
        <Route path="/manage/:id" element={<ProtectedRoute role="club"><ManageGig /></ProtectedRoute>} />
      </Routes>

      <footer className="footer">
        <span>CampusGigs · built inside college, for college</span>
        <span className="footer-links">
          <Link to="/gigs">Marketplace</Link>
          <Link to="/clubs">Clubs</Link>
          <Link to="/leaderboard">Leaderboard</Link>
        </span>
      </footer>
    </>
  );
}