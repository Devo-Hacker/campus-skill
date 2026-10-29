import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container hero">
      <h1>Skills for Hire, Campus Edition</h1>
      <p>
        Clubs post small real-world tasks. Students apply, build their portfolio
        and earn reviews.
      </p>
      <Link to="/register" className="btn">Get Started</Link>
    </div>
  );
}