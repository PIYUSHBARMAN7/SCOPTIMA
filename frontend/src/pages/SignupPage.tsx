import { useState } from "react";
import type { FormEvent } from "react";

import { API_URL } from "../config/api";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import LoginAnimation from "../components/auth/LoginAnimation.tsx";

import "../styles/globals.css";
import "../styles/login.css";
import "../styles/signup.css";





type Role =
  | "Analyst"
  | "Executive / Viewer";


export default function SignupPage() {

  const navigate =
    useNavigate();


  // ========================================================
  // FORM STATE
  // ========================================================

  const [
    fullName,
    setFullName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    role,
    setRole,
  ] = useState<Role>(
    "Executive / Viewer"
  );


  const [
    analystCode,
    setAnalystCode,
  ] = useState("");


  const [
    agreed,
    setAgreed,
  ] = useState(false);


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // ========================================================
  // VALIDATE
  // ========================================================

  const validateForm = () => {

    setError("");


    if (!fullName.trim()) {

      setError(
        "Full name is required."
      );

      return false;

    }


    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (!cleanEmail) {

      setError(
        "Email address is required."
      );

      return false;

    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {

      setError(
        "Enter a valid email address."
      );

      return false;

    }


    if (password.length < 8) {

      setError(
        "Password must be at least 8 characters."
      );

      return false;

    }


    if (
      password !==
      confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return false;

    }


    if (
      role === "Analyst" &&
      !analystCode.trim()
    ) {

      setError(
        "Analyst access code is required."
      );

      return false;

    }


    if (!agreed) {

      setError(
        "Please accept the terms and security policy."
      );

      return false;

    }


    return true;

  };


  // ========================================================
  // CREATE ACCOUNT
  // ========================================================

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      setError("");

      setSuccess("");


      if (!validateForm()) {
        return;
      }


      try {

        setLoading(true);


        const response =
          await fetch(
            `${API_URL}/api/auth/register`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  full_name:
                    fullName.trim(),

                  email:
                    email
                      .trim()
                      .toLowerCase(),

                  password,

                  role,

                  analyst_code:
                    role === "Analyst"
                      ? analystCode.trim()
                      : null,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data?.detail ||
            "Unable to create account."
          );

        }


        setSuccess(
          "Account created successfully. Redirecting to login..."
        );


        setTimeout(
          () => {

            navigate(
              "/login",
              {
                replace:
                  true,
              }
            );

          },
          1200
        );


      } catch (error) {

        setError(
          error instanceof Error
            ? error.message
            : "Unable to create account."
        );


      } finally {

        setLoading(false);

      }

    };


  return (

    <main className="login-page signup-page-role">


      {/* ====================================================
          LEFT - SAME AS LOGIN PAGE
      ==================================================== */}

      <section className="login-visual">


        <LoginAnimation />


        <div className="login-grid" />


        {/* BACK */}

        <Link
          to="/login"
          className="back-home"
        >

          <ArrowLeft
            size={18}
          />

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


        {/* HERO */}

        <div className="login-message signup-left-message">

          <span>
            ROLE-BASED / ACCESS
          </span>


          <h1>

            CREATE

            <br />

            YOUR

            <br />

            <em>
              ACCESS.
            </em>

          </h1>


          <p className="signup-left-description">

            Register your SCOPTIMA identity
            with access permissions aligned
            to your role in the decision
            intelligence platform.

          </p>

        </div>


        {/* FEATURES */}

        <div className="login-features">

          <div>

            <BarChart3
              size={20}
            />

            <span>
              Analyst workspace
            </span>

          </div>


          <div>

            <ShieldCheck
              size={20}
            />

            <span>
              Role-based control
            </span>

          </div>


          <div>

            <LockKeyhole
              size={20}
            />

            <span>
              Secure registration
            </span>

          </div>

        </div>


      </section>


      {/* ====================================================
          RIGHT PANEL
      ==================================================== */}

      <section className="login-panel">


        <form
          className="login-form signup-form-role"
          onSubmit={
            handleSubmit
          }
          noValidate
        >


          {/* HEADER */}

          <div className="login-form-header">

            <div className="secure-label">

              <LockKeyhole
                size={15}
              />

              ROLE-BASED REGISTRATION

            </div>


            <h1>
              CREATE ACCOUNT.
            </h1>


            <p>
              Create your secure SCOPTIMA
              identity and choose the access
              level appropriate for your role.
            </p>

          </div>


          {/* =================================================
              FULL NAME
          ================================================= */}

          <div className="form-field">

            <label>
              Full name
            </label>


            <div className="input-with-icon">

              <UserRound
                size={18}
              />


              <input
                type="text"

                placeholder="Your full name"

                autoComplete="name"

                value={
                  fullName
                }

                onChange={(
                  event
                ) => {

                  setFullName(
                    event.target.value
                  );

                  setError("");

                }}
              />

            </div>

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-field">

            <label>
              Email address
            </label>


            <div className="input-with-icon">

              <Mail
                size={18}
              />


              <input
                type="email"

                placeholder="name@company.com"

                autoComplete="email"

                value={
                  email
                }

                onChange={(
                  event
                ) => {

                  setEmail(
                    event.target.value
                  );

                  setError("");

                }}
              />

            </div>

          </div>


          {/* =================================================
              ROLE SELECTION
          ================================================= */}

          <div className="form-field signup-role-section">

            <label>
              Select access role
            </label>


            <div className="signup-role-grid">


              {/* ANALYST */}

              <button
                type="button"

                className={`signup-role ${
                  role === "Analyst"
                    ? "active"
                    : ""
                }`}

                onClick={() => {

                  setRole(
                    "Analyst"
                  );

                  setError("");

                }}
              >

                <BarChart3
                  size={20}
                />


                <div>

                  <strong>
                    Analyst
                  </strong>


                  <span>
                    Forecasting, ML analysis,
                    uploads and operational
                    intelligence actions.
                  </span>

                </div>


                {role === "Analyst" && (

                  <Check
                    size={16}
                    className="signup-role-selected"
                  />

                )}

              </button>


              {/* EXECUTIVE */}

              <button
                type="button"

                className={`signup-role ${
                  role ===
                  "Executive / Viewer"
                    ? "active"
                    : ""
                }`}

                onClick={() => {

                  setRole(
                    "Executive / Viewer"
                  );

                  setAnalystCode("");

                  setError("");

                }}
              >

                <ShieldCheck
                  size={20}
                />


                <div>

                  <strong>
                    Executive / Viewer
                  </strong>


                  <span>
                    Read-only dashboards,
                    reports, comparisons
                    and decision insights.
                  </span>

                </div>


                {role ===
                  "Executive / Viewer" && (

                  <Check
                    size={16}
                    className="signup-role-selected"
                  />

                )}

              </button>


            </div>

          </div>


          {/* =================================================
              ANALYST CODE
          ================================================= */}

          {role === "Analyst" && (

            <div className="form-field signup-analyst-code">

              <label>
                Analyst authorization code
              </label>


              <div className="input-with-icon">

                <LockKeyhole
                  size={18}
                />


                <input
                  type="password"

                  placeholder="Enter analyst access code"

                  autoComplete="off"

                  value={
                    analystCode
                  }

                  onChange={(
                    event
                  ) => {

                    setAnalystCode(
                      event.target.value
                    );

                    setError("");

                  }}
                />

              </div>


              <p className="signup-field-note">

                Analyst registration requires
                authorization. The code is
                verified securely by the backend.

              </p>

            </div>

          )}


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-field">

            <label>
              Password
            </label>


            <div className="signup-password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                placeholder="Minimum 8 characters"

                autoComplete="new-password"

                value={
                  password
                }

                onChange={(
                  event
                ) => {

                  setPassword(
                    event.target.value
                  );

                  setError("");

                }}
              />


              <button
                type="button"

                className="password-toggle"

                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }

                onClick={() =>
                  setShowPassword(
                    current =>
                      !current
                  )
                }
              >

                {showPassword ? (

                  <EyeOff
                    size={18}
                  />

                ) : (

                  <Eye
                    size={18}
                  />

                )}

              </button>

            </div>

          </div>


          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="form-field">

            <label>
              Confirm password
            </label>


            <div className="signup-password-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }

                placeholder="Enter password again"

                autoComplete="new-password"

                value={
                  confirmPassword
                }

                onChange={(
                  event
                ) => {

                  setConfirmPassword(
                    event.target.value
                  );

                  setError("");

                }}
              />


              <button
                type="button"

                className="password-toggle"

                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }

                onClick={() =>
                  setShowConfirmPassword(
                    current =>
                      !current
                  )
                }
              >

                {showConfirmPassword ? (

                  <EyeOff
                    size={18}
                  />

                ) : (

                  <Eye
                    size={18}
                  />

                )}

              </button>

            </div>

          </div>


          {/* =================================================
              SELECTED ACCESS
          ================================================= */}

          <div
            className={`signup-access-summary ${
              role === "Analyst"
                ? "analyst"
                : "viewer"
            }`}
          >

            <ShieldCheck
              size={18}
            />


            <div>

              <span>
                SELECTED ACCESS LEVEL
              </span>


              <strong>
                {role}
              </strong>

            </div>

          </div>


          {/* =================================================
              TERMS
          ================================================= */}

          <div className="signup-terms">

            <label>

              <input
                type="checkbox"

                checked={
                  agreed
                }

                onChange={(
                  event
                ) => {

                  setAgreed(
                    event.target.checked
                  );

                  setError("");

                }}
              />


              <span>

                I agree to the SCOPTIMA
                platform terms, security
                policy and role-based
                access requirements.

              </span>

            </label>

          </div>


          {/* ERROR */}

          {error && (

            <div className="login-error-box">

              {error}

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="signup-success-box">

              {success}

            </div>

          )}


          {/* =================================================
              CREATE ACCOUNT
          ================================================= */}

          <button
            type="submit"

            className="login-submit"

            disabled={
              loading
            }
          >

            {loading ? (

              <>

                <span className="button-spinner" />

                CREATING ACCOUNT...

              </>

            ) : (

              <>

                CREATE ACCOUNT

                <ArrowRight
                  size={19}
                />

              </>

            )}

          </button>


          {/* LOGIN LINK */}

          <div className="signup-text">

            <span>
              Already have a SCOPTIMA account?
            </span>


            <Link to="/login">
              Sign in
            </Link>

          </div>


          {/* SECURITY */}

          <div className="security-information">

            <div>

              <ShieldCheck
                size={16}
              />

              <span>
                Passwords securely hashed
              </span>

            </div>


            <div>

              <ShieldCheck
                size={16}
              />

              <span>
                Backend-enforced role authorization
              </span>

            </div>


            <div>

              <ShieldCheck
                size={16}
              />

              <span>
                Secure account access
              </span>

            </div>

          </div>


          <div className="security-note">

            Analyst privileges are never granted
            from the browser alone. SCOPTIMA
            verifies elevated access on the server.

          </div>


        </form>


      </section>


    </main>

  );

}