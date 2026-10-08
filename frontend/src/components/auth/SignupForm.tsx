import { useState } from "react";
import type { FormEvent } from "react";
import { API_URL } from "../../config/api";
import {
  ArrowRight,
  BriefcaseBusiness,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import PasswordField from "./PasswordField";

type UserRole = "Analyst" | "Executive / Viewer";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Analyst");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [formError, setFormError] = useState("");

  const validate = () => {
    let valid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setTermsError("");
    setFormError("");

    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError("Confirm your password.");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      valid = false;
    }

    if (!terms) {
      setTermsError("Accept the terms to continue.");
      valid = false;
    }

    return valid;
  };
  
  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (!validate()) return;

  setLoading(true);
  setFormError("");

  try {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          full_name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setFormError(
        data.detail ||
          "Unable to create account."
      );

      return;
    }

    window.location.href =
      "/login";
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    setFormError(
      "Unable to connect to SCOPTIMA server."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <form className="login-form signup-form" onSubmit={handleSubmit}>
      <div className="login-form-header">
        <div className="secure-label">
          <LockKeyhole size={14} />
          SECURE REGISTRATION
        </div>

        <h1>CREATE ACCOUNT</h1>

        <p>
          Create your SCOPTIMA account and select the access level required for
          your work.
        </p>
      </div>

      {/* NAME */}

      <div className="form-field">
        <label>Full name</label>

        <div className="input-with-icon">
          <User size={18} />

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
          />
        </div>

        {nameError && <p className="field-error">{nameError}</p>}
      </div>

      {/* EMAIL */}

      <div className="form-field">
        <label>Work email</label>

        <div className="input-with-icon">
          <Mail size={18} />

          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
          />
        </div>

        {emailError && <p className="field-error">{emailError}</p>}
      </div>

      {/* ROLE */}

      <div className="form-field">
        <label>Access role</label>

        <div className="signup-role-grid">
          <button
            type="button"
            className={`signup-role ${
              role === "Analyst" ? "active" : ""
            }`}
            onClick={() => setRole("Analyst")}
          >
            <BriefcaseBusiness size={18} />

            <div>
              <strong>Analyst</strong>
              <span>Forecasting, analysis and model insights</span>
            </div>
          </button>

          <button
            type="button"
            className={`signup-role ${
              role === "Executive / Viewer" ? "active" : ""
            }`}
            onClick={() => setRole("Executive / Viewer")}
          >
            <BriefcaseBusiness size={18} />

            <div>
              <strong>Executive / Viewer</strong>
              <span>Read-only dashboards and KPI insights</span>
            </div>
          </button>
        </div>
      </div>

      {/* PASSWORD */}

      <div className="form-field">
        <label>Password</label>

        <PasswordField
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
          }}
        />

        {passwordError && (
          <p className="field-error">{passwordError}</p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}

      <div className="form-field">
        <label>Confirm password</label>

        <PasswordField
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError("");
          }}
        />

        {confirmError && (
          <p className="field-error">{confirmError}</p>
        )}
      </div>

      {/* TERMS */}

      <div className="signup-terms">
        <label>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              setTermsError("");
            }}
          />

          <span>
            I agree to SCOPTIMA's platform terms and security policy.
          </span>
        </label>

        {termsError && <p className="field-error">{termsError}</p>}
      </div>

      {formError && (
        <div className="login-error-box">
          {formError}
        </div>
      )}

      {/* CREATE ACCOUNT */}

      <button
        type="submit"
        className="login-submit"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="button-spinner" />
            CREATING ACCOUNT...
          </>
        ) : (
          <>
            CREATE ACCOUNT
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {/* LOGIN LINK */}

      <div className="signup-text signup-login-link">
        <span>Already have an account?</span>

        <Link to="/login">
          Sign in
        </Link>
      </div>
    </form>
  );
}