import { useState } from "react";
import type { FormEvent } from "react";

import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import PasswordField from "./PasswordField";


import { API_URL } from "../../config/api";


export default function LoginForm() {

  // ========================================================
  // NORMAL LOGIN STATE
  // ========================================================

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [emailError, setEmailError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [loginError, setLoginError] =
    useState("");


  // ========================================================
  // OTP STATE
  // ========================================================

  const [otpOpen, setOtpOpen] =
    useState(false);

  const [otpEmail, setOtpEmail] =
    useState("");

  const [otpCode, setOtpCode] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [otpError, setOtpError] =
    useState("");

  const [otpMessage, setOtpMessage] =
    useState("");


  // ========================================================
  // NORMAL LOGIN
  // ========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");


    let valid = true;


    if (!email.trim()) {

      setEmailError(
        "Email is required."
      );

      valid = false;

    }


    if (!password) {

      setPasswordError(
        "Password is required."
      );

      valid = false;

    }


    if (!valid) {
      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setLoginError(
          data?.detail ||
          "Invalid email or password."
        );

        return;

      }


      window.location.href =
        "/dashboard";


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      setLoginError(
        "Unable to connect to SCOPTIMA server."
      );


    } finally {

      setLoading(false);

    }

  };


  // ========================================================
  // GOOGLE LOGIN
  // ========================================================

  const handleGoogleLogin = () => {
    window.location.href =
      `${API_URL}/api/auth/google/login`;
  };


  // ========================================================
  // GITHUB LOGIN
  // ========================================================

  const handleGithubLogin = () => {
   window.location.href =
    `${API_URL}/api/auth/github/login`;
  };


  // ========================================================
  // OPEN OTP MODAL
  // ========================================================

  const handleOtpLogin = () => {

    setOtpOpen(true);

    setOtpSent(false);

    setOtpCode("");

    setOtpError("");

    setOtpMessage("");


    /*
      If the user already typed an email into
      the normal login form, automatically use it.
    */

    if (email.trim()) {

      setOtpEmail(
        email
          .trim()
          .toLowerCase()
      );

    }

  };


  // ========================================================
  // CLOSE OTP MODAL
  // ========================================================

  const closeOtpModal = () => {

    if (otpLoading) {
      return;
    }


    setOtpOpen(false);

    setOtpSent(false);

    setOtpCode("");

    setOtpError("");

    setOtpMessage("");

  };


  // ========================================================
  // SEND OTP
  // ========================================================

  const sendOtp = async () => {

    const cleanEmail =
      otpEmail
        .trim()
        .toLowerCase();


    if (!cleanEmail) {

      setOtpError(
        "Enter your email address."
      );

      return;

    }


    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {

      setOtpError(
        "Enter a valid email address."
      );

      return;

    }


    setOtpLoading(true);

    setOtpError("");

    setOtpMessage("");


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/otp/send`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email:
                  cleanEmail,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Unable to send verification code."
        );

      }


      setOtpSent(true);

      setOtpMessage(
        data?.message ||
        "Verification code sent."
      );


    } catch (error) {

      console.error(
        "OTP send error:",
        error
      );


      setOtpError(
        error instanceof Error
          ? error.message
          : "Unable to send verification code."
      );


    } finally {

      setOtpLoading(false);

    }

  };


  // ========================================================
  // VERIFY OTP
  // ========================================================

  const verifyOtp = async () => {

    const cleanEmail =
      otpEmail
        .trim()
        .toLowerCase();


    const cleanCode =
      otpCode
        .trim();


    if (
      cleanCode.length !== 6 ||
      !/^\d{6}$/.test(
        cleanCode
      )
    ) {

      setOtpError(
        "Enter the complete 6-digit verification code."
      );

      return;

    }


    setOtpLoading(true);

    setOtpError("");

    setOtpMessage("");


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/otp/verify`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email:
                  cleanEmail,

                code:
                  cleanCode,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Verification failed."
        );

      }


      setOtpMessage(
        "Verified successfully. Opening dashboard..."
      );


      window.location.href =
        "/dashboard";


    } catch (error) {

      console.error(
        "OTP verification error:",
        error
      );


      setOtpError(
        error instanceof Error
          ? error.message
          : "OTP verification failed."
      );


    } finally {

      setOtpLoading(false);

    }

  };


  // ========================================================
  // CHANGE OTP EMAIL
  // ========================================================

  const changeOtpEmail = () => {

    setOtpSent(false);

    setOtpCode("");

    setOtpError("");

    setOtpMessage("");

  };


  // ========================================================
  // PAGE
  // ========================================================

  return (
    <>

      <form
        className="login-form"
        onSubmit={handleSubmit}
        noValidate
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="login-form-header">

          <div className="secure-label">

            <LockKeyhole
              size={15}
            />

            SECURE PLATFORM ACCESS

          </div>


          <h1>
            WELCOME BACK.
          </h1>


          <p>
            Sign in to access your supply
            chain intelligence workspace.
          </p>

        </div>


        {/* ==================================================
            EMAIL
        ================================================== */}

        <div className="form-field">

          <label>
            Email or username
          </label>


          <div className="input-with-icon">

            <Mail
              size={18}
            />


            <input
              type="text"

              placeholder="name@company.com"

              value={
                email
              }

              autoComplete="username"

              onChange={(
                event
              ) => {

                setEmail(
                  event.target.value
                );

                setEmailError("");

                setLoginError("");

              }}
            />

          </div>


          {emailError && (

            <p className="field-error">

              {emailError}

            </p>

          )}

        </div>


        {/* ==================================================
            PASSWORD
        ================================================== */}

        <div className="form-field">

          <label>
            Password
          </label>


          <PasswordField
            value={
              password
            }

            onChange={(
              event
            ) => {

              setPassword(
                event.target.value
              );

              setPasswordError("");

              setLoginError("");

            }}
          />


          {passwordError && (

            <p className="field-error">

              {passwordError}

            </p>

          )}

        </div>


        {/* ==================================================
            REMEMBER + FORGOT
        ================================================== */}

        <div className="form-options">

          <label className="remember">

            <input
              type="checkbox"

              checked={
                remember
              }

              onChange={(
                event
              ) =>
                setRemember(
                  event.target.checked
                )
              }
            />


            <span>
              Remember me
            </span>

          </label>


          <a
            href="/forgot-password"
            className="forgot-link"
          >
            Forgot password?
          </a>

        </div>


        {/* ==================================================
            LOGIN ERROR
        ================================================== */}

        {loginError && (

          <div className="login-error-box">

            {loginError}

          </div>

        )}


        {/* ==================================================
            PASSWORD LOGIN BUTTON
        ================================================== */}

        <button
          className="login-submit"

          type="submit"

          disabled={
            loading
          }
        >

          {loading ? (

            <>

              <span className="button-spinner" />

              SIGNING IN...

            </>

          ) : (

            <>

              LOGIN TO PLATFORM

              <ArrowRight
                size={19}
              />

            </>

          )}

        </button>


        {/* ==================================================
            SIGN UP
        ================================================== */}

        <div className="signup-text">

          <span>
            New to SCOPTIMA?
          </span>


          <a href="/signup">

            Create an account

          </a>

        </div>


        {/* ==================================================
            DIVIDER
        ================================================== */}

        <div className="login-divider">

          <span>
            OR CONTINUE WITH
          </span>

        </div>


        {/* ==================================================
            GOOGLE + GITHUB
        ================================================== */}

        <div className="social-login-grid">


          {/* GOOGLE */}

          <button
            type="button"

            className="social-login-button"

            onClick={
              handleGoogleLogin
            }
          >

            <span className="google-symbol">
              G
            </span>

            <span>
              Google
            </span>

          </button>


          {/* GITHUB */}

          <button
            type="button"

            className="social-login-button"

            onClick={
              handleGithubLogin
            }
          >

            <span className="github-symbol">
              GH
            </span>

            <span>
              GitHub
            </span>

          </button>


        </div>


        {/* ==================================================
            OTP / 2FA
        ================================================== */}

        <button
          type="button"

          className="otp-login-button"

          onClick={
            handleOtpLogin
          }
        >

          <KeyRound
            size={18}
          />


          <span>
            LOGIN WITH OTP / 2FA
          </span>

        </button>


        {/* ==================================================
            SECURITY INFORMATION
        ================================================== */}

        <div className="security-information">

          <div>

            <ShieldCheck
              size={16}
            />

            <span>
              Encrypted authentication
            </span>

          </div>


          <div>

            <ShieldCheck
              size={16}
            />

            <span>
              Role-based access control
            </span>

          </div>


          <div>

            <ShieldCheck
              size={16}
            />

            <span>
              Secure session expiry
            </span>

          </div>

        </div>


        <div className="security-note">

          This platform uses secure authentication.
          Passwords are never stored in plain text.

        </div>


      </form>


      {/* ====================================================
          OTP MODAL
      ==================================================== */}

      {otpOpen && (

        <div
          className="otp-modal-backdrop"

          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeOtpModal();

            }

          }}
        >

          <div
            className="otp-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="otp-login-title"
          >


            {/* CLOSE */}

            <button
              type="button"

              className="otp-modal-x"

              aria-label="Close OTP login"

              onClick={
                closeOtpModal
              }
            >
              ×
            </button>


            {/* HEADER */}

            <div className="otp-modal-heading">

              <span>
                SECURE ACCESS
              </span>


              <h2 id="otp-login-title">

                Login with OTP

              </h2>


              {!otpSent ? (

                <p>
                  Enter the email associated
                  with your SCOPTIMA account.
                </p>

              ) : (

                <p>
                  Enter the 6-digit verification
                  code sent to your email.
                </p>

              )}

            </div>


            {/* EMAIL */}

            <label
              className="otp-field-label"

              htmlFor="otp-email"
            >
              Email Address
            </label>


            <input
              id="otp-email"

              type="email"

              placeholder="name@company.com"

              autoComplete="email"

              value={
                otpEmail
              }

              disabled={
                otpSent ||
                otpLoading
              }

              onChange={(
                event
              ) => {

                setOtpEmail(
                  event.target.value
                );

                setOtpError("");

              }}
            />


            {/* =================================================
                BEFORE OTP SENT
            ================================================= */}

            {!otpSent && (

              <button
                type="button"

                className="otp-modal-primary"

                disabled={
                  otpLoading
                }

                onClick={
                  sendOtp
                }
              >

                {otpLoading
                  ? "SENDING..."
                  : "SEND VERIFICATION CODE"
                }

              </button>

            )}


            {/* =================================================
                AFTER OTP SENT
            ================================================= */}

            {otpSent && (

              <>

                <label
                  className="otp-field-label"

                  htmlFor="otp-code"
                >
                  Verification Code
                </label>


                <input
                  id="otp-code"

                  type="text"

                  className="otp-code-input"

                  inputMode="numeric"

                  autoComplete="one-time-code"

                  maxLength={6}

                  placeholder="000000"

                  value={
                    otpCode
                  }

                  disabled={
                    otpLoading
                  }

                  onChange={(
                    event
                  ) => {

                    const digits =
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          6
                        );


                    setOtpCode(
                      digits
                    );

                    setOtpError("");

                  }}
                />


                <button
                  type="button"

                  className="otp-modal-primary"

                  disabled={
                    otpLoading ||
                    otpCode.length !== 6
                  }

                  onClick={
                    verifyOtp
                  }
                >

                  {otpLoading
                    ? "VERIFYING..."
                    : "VERIFY & SIGN IN"
                  }

                </button>


                <button
                  type="button"

                  className="otp-resend-button"

                  disabled={
                    otpLoading
                  }

                  onClick={
                    sendOtp
                  }
                >
                  SEND NEW CODE
                </button>


                <button
                  type="button"

                  className="otp-change-email-button"

                  disabled={
                    otpLoading
                  }

                  onClick={
                    changeOtpEmail
                  }
                >
                  USE DIFFERENT EMAIL
                </button>

              </>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {otpMessage && (

              <div className="otp-success-message">

                {otpMessage}

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {otpError && (

              <div className="otp-error-message">

                {otpError}

              </div>

            )}


            {/* CANCEL */}

            <button
              type="button"

              className="otp-close-button"

              disabled={
                otpLoading
              }

              onClick={
                closeOtpModal
              }
            >
              CANCEL
            </button>


          </div>

        </div>

      )}

    </>
  );
}