import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="cta-section">
      <span>READY TO OPTIMIZE?</span>

      <h2>
        TURN INVENTORY DATA
        <br />
        INTO <em>DECISIONS.</em>
      </h2>

      <Link to="/login" className="cta-button">
        ACCESS PLATFORM
        <ArrowUpRight size={20} />
      </Link>
    </section>
  );
}