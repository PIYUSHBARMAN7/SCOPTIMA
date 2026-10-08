import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function LandingNavbar() {
  return (
    <header className="landing-nav">
      <div className="brand">
        <div className="brand-mark">S</div>

        <div>
          <h2>SCOPTIMA</h2>
          <span>SUPPLY CHAIN INTELLIGENCE</span>
        </div>
      </div>

      <nav className="nav-links">
        <a href="#platform">Platform</a>
        <a href="#models">Models</a>
        <a href="#impact">Impact</a>
      </nav>

      <div className="nav-actions">
        <Link className="nav-login" to="/login">
          Login
        </Link>

        <Link className="nav-primary" to="/login">
          Open Platform
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </header>
  );
}