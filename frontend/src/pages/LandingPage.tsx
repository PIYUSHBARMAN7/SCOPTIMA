import LandingNavbar from "../components/landing/landingNavbar.tsx";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ModelsSection from "../components/landing/ModelsSection";
import ImpactSection from "../components/landing/ImpactSection";
import CTASection from "../components/landing/CTASection";

import "../styles/globals.css";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <LandingNavbar />

      <HeroSection />

      <FeaturesSection />

      {/* MODELS SECTION */}
      <ModelsSection />

      <ImpactSection />

      <CTASection />

      <footer className="landing-footer">
        <div>
          <strong>SCOPTIMA</strong>
          <p>AI-powered supply chain intelligence.</p>
        </div>

        <span>© 2026 Supply Chain AI Platform</span>
      </footer>
    </main>
  );
}