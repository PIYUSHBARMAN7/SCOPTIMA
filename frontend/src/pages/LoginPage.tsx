import { Link } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  Boxes,
  ShieldCheck,
} from "lucide-react";

import LoginAnimation from "../components/auth/LoginAnimation.tsx";
import LoginForm from "../components/auth/LoginForm";

import "../styles/globals.css";
import "../styles/login.css";


export default function LoginPage() {
  return (
    <main className="login-page">

      {/* ====================================================
          LEFT VISUAL SECTION
      ==================================================== */}

      <section className="login-visual">

        <LoginAnimation />

        <div className="login-grid" />


        {/* BACK */}

        <Link
          to="/"
          className="back-home"
        >
          <ArrowLeft size={18} />

          Back
        </Link>


        {/* BRAND */}

        <div className="login-brand">

          <div className="brand-mark">
            S
          </div>

          <div>
            <h2>
              SCOPTIMA
            </h2>

            <span>
              SUPPLY CHAIN INTELLIGENCE
            </span>
          </div>

        </div>


        {/* HERO MESSAGE */}

        <div className="login-message">

          <span>
            INTELLIGENCE / ACCESS
          </span>

          <h1>
            CONTROL
            <br />

            EVERY
            <br />

            <em>
              DECISION.
            </em>
          </h1>

        </div>


        {/* FEATURES */}

        <div className="login-features">

          <div>
            <BarChart3 size={20} />

            <span>
              Demand intelligence
            </span>
          </div>


          <div>
            <Boxes size={20} />

            <span>
              Inventory optimization
            </span>
          </div>


          <div>
            <ShieldCheck size={20} />

            <span>
              Secure access
            </span>
          </div>

        </div>

      </section>


      {/* ====================================================
          RIGHT LOGIN PANEL
      ==================================================== */}

      <section className="login-panel">

        <LoginForm />

      </section>

    </main>
  );
}