import { ArrowDown, ArrowUpRight } from "lucide-react";
import LogisticsAnimation from "./LogisticsAnimation";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Moving background grid */}
      <div className="hero-grid" />
        <LogisticsAnimation />
      {/* Small heading */}
      <div className="hero-kicker">
        AI-POWERED SUPPLY CHAIN PLATFORM
      </div>

      <div className="hero-content">
        {/* Animated heading */}
        <div className="hero-title-wrapper">
          <h1 className="hero-animated-title">
            <span className="hero-line hero-line-one">
              SUPPLY CHAIN.
            </span>

            <span className="hero-line hero-line-two">
              OPTIMIZED.
            </span>
          </h1>

          {/* Technical glitch labels */}
          <span className="floating-tag tag-ai">AI</span>
          <span className="floating-tag tag-ml">ML</span>
          <span className="floating-tag tag-demand">DEMAND</span>
          <span className="floating-tag tag-stock">STOCK</span>
          <span className="floating-tag tag-opt">OPT</span>
        </div>

        {/* Bottom content */}
        <div className="hero-bottom">
          <p className="hero-description">
            Predict demand. Reduce excess inventory. Prevent stockouts.
            <br />
            Optimize every reorder decision.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">
              <span>OPEN PLATFORM</span>
              <ArrowUpRight size={19} />
            </Link>

            <a href="#platform" className="btn-secondary">
              <span>EXPLORE SYSTEM</span>
              <ArrowDown size={19} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}