import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCircle2,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MonitorCog,
  Palette,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


type DashboardDensity =
  | "comfortable"
  | "compact";


type DefaultPage =
  | "overview"
  | "forecasting"
  | "inventory"
  | "stockout"
  | "savings"
  | "model-performance"
  | "reports"
  | "data-quality";


interface DashboardPreferences {
  density: DashboardDensity;

  defaultPage: DefaultPage;

  autoRefresh: boolean;

  refreshInterval: number;

  reducedMotion: boolean;
}


const DEFAULT_PREFERENCES:
  DashboardPreferences = {

  density:
    "comfortable",

  defaultPage:
    "overview",

  autoRefresh:
    true,

  refreshInterval:
    30,

  reducedMotion:
    false,
};


const STORAGE_KEY =
  "scoptima_dashboard_preferences";


export default function SettingsPage() {
  const {
    user,
    logout,
  } =
    useAuth();


  const navigate =
    useNavigate();


  const [
    preferences,
    setPreferences,
  ] =
    useState<
      DashboardPreferences
    >(
      DEFAULT_PREFERENCES
    );


  const [
    saved,
    setSaved,
  ] =
    useState(false);


  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);


  // ========================================================
  // LOAD PREFERENCES
  // ========================================================

  useEffect(() => {
    try {

      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!stored) {
        return;
      }


      const parsed =
        JSON.parse(
          stored
        );


      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...parsed,
      });


    } catch (error) {

      console.error(
        "Unable to load dashboard preferences:",
        error
      );

    }

  }, []);


  // ========================================================
  // SAVE
  // ========================================================

  const savePreferences = () => {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        preferences
      )
    );


    document.documentElement.setAttribute(
      "data-dashboard-density",
      preferences.density
    );


    if (
      preferences.reducedMotion
    ) {

      document.documentElement.setAttribute(
        "data-reduced-motion",
        "true"
      );

    } else {

      document.documentElement.removeAttribute(
        "data-reduced-motion"
      );

    }


    setSaved(
      true
    );


    window.setTimeout(
      () => {
        setSaved(
          false
        );
      },
      2500
    );
  };


  // ========================================================
  // RESET
  // ========================================================

  const resetPreferences = () => {

    setPreferences(
      DEFAULT_PREFERENCES
    );


    localStorage.removeItem(
      STORAGE_KEY
    );


    document.documentElement.removeAttribute(
      "data-dashboard-density"
    );


    document.documentElement.removeAttribute(
      "data-reduced-motion"
    );


    setSaved(
      true
    );


    window.setTimeout(
      () => {
        setSaved(
          false
        );
      },
      2500
    );
  };


  // ========================================================
  // LOGOUT
  // ========================================================

  const handleLogout =
    async () => {

      try {

        setLoggingOut(
          true
        );


        await logout();


        navigate(
          "/login",
          {
            replace: true,
          }
        );


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );


      } finally {

        setLoggingOut(
          false
        );

      }

    };


  // ========================================================
  // ROLE PERMISSIONS
  // ========================================================

  const isAnalyst =
    user?.role ===
    "Analyst";


  return (
    <div className="settings-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="settings-header">

        <div>

          <span className="dashboard-eyebrow">
            PLATFORM CONTROL
          </span>


          <h1>
            Settings
          </h1>


          <p>
            Manage your profile,
            dashboard preferences,
            interface behavior and
            authenticated session.
          </p>

        </div>


        <div className="settings-header-actions">


          {saved && (

            <span className="settings-saved-badge">

              <CheckCircle2
                size={13}
              />

              Saved

            </span>

          )}


          <button
            type="button"

            className="report-secondary-button"

            onClick={
              resetPreferences
            }
          >

            <RefreshCw
              size={14}
            />

            Reset

          </button>


          <button
            type="button"

            className="dashboard-primary-button"

            onClick={
              savePreferences
            }
          >
            Save Preferences
          </button>

        </div>

      </section>


      {/* ==================================================
          PROFILE
      ================================================== */}

      <section className="dashboard-panel settings-section">

        <div className="settings-section-heading">

          <div className="settings-section-icon">

            <UserRound
              size={17}
            />

          </div>


          <div>

            <span>
              ACCOUNT
            </span>


            <h3>
              Profile
            </h3>


            <p>
              Information associated with
              the current authenticated
              session.
            </p>

          </div>

        </div>


        <div className="settings-profile-grid">


          <div className="settings-field">

            <label>
              Full Name
            </label>


            <div className="settings-readonly-value">
              {
                user?.full_name ??
                "—"
              }
            </div>

          </div>


          <div className="settings-field">

            <label>
              Email
            </label>


            <div className="settings-readonly-value">
              {
                user?.email ??
                "—"
              }
            </div>

          </div>


          <div className="settings-field">

            <label>
              Role
            </label>


            <div className="settings-readonly-value">

              <ShieldCheck
                size={14}
              />

              {
                user?.role ??
                "—"
              }

            </div>

          </div>


          <div className="settings-field">

            <label>
              Account Status
            </label>


            <div className="settings-account-status">

              <span />

              Active

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          DASHBOARD PREFERENCES
      ================================================== */}

      <section className="dashboard-panel settings-section">

        <div className="settings-section-heading">

          <div className="settings-section-icon">

            <SlidersHorizontal
              size={17}
            />

          </div>


          <div>

            <span>
              DASHBOARD
            </span>


            <h3>
              Dashboard Preferences
            </h3>


            <p>
              Control how SCOPTIMA behaves
              when you use the analytics
              workspace.
            </p>

          </div>

        </div>


        <div className="settings-control-grid">


          {/* DEFAULT PAGE */}

          <div className="settings-control-card">

            <div className="settings-control-title">

              <LayoutDashboard
                size={16}
              />


              <div>

                <strong>
                  Default Dashboard Page
                </strong>


                <span>
                  Choose the page you prefer
                  to open first.
                </span>

              </div>

            </div>


            <select
              value={
                preferences.defaultPage
              }

              onChange={(
                event
              ) =>
                setPreferences(
                  current => ({
                    ...current,

                    defaultPage:
                      event.target
                        .value as DefaultPage,
                  })
                )
              }
            >

              <option value="overview">
                Overview
              </option>

              <option value="forecasting">
                Demand Forecast
              </option>

              <option value="inventory">
                Inventory Optimization
              </option>

              <option value="stockout">
                Stockout Risk
              </option>

              <option value="savings">
                Cost Savings
              </option>

              <option value="model-performance">
                Model Performance
              </option>

              <option value="reports">
                Reports
              </option>

              <option value="data-quality">
                Data Quality
              </option>

            </select>

          </div>


          {/* DENSITY */}

          <div className="settings-control-card">

            <div className="settings-control-title">

              <Palette
                size={16}
              />


              <div>

                <strong>
                  Dashboard Density
                </strong>


                <span>
                  Adjust the spacing used
                  throughout the dashboard.
                </span>

              </div>

            </div>


            <div className="settings-segmented-control">

              <button
                type="button"

                className={
                  preferences.density ===
                  "comfortable"
                    ? "active"
                    : ""
                }

                onClick={() =>
                  setPreferences(
                    current => ({
                      ...current,
                      density:
                        "comfortable",
                    })
                  )
                }
              >
                Comfortable
              </button>


              <button
                type="button"

                className={
                  preferences.density ===
                  "compact"
                    ? "active"
                    : ""
                }

                onClick={() =>
                  setPreferences(
                    current => ({
                      ...current,
                      density:
                        "compact",
                    })
                  )
                }
              >
                Compact
              </button>

            </div>

          </div>


          {/* AUTO REFRESH */}

          <div className="settings-control-card">

            <div className="settings-control-title">

              <Gauge
                size={16}
              />


              <div>

                <strong>
                  Automatic Refresh
                </strong>


                <span>
                  Refresh live dashboard
                  information automatically.
                </span>

              </div>

            </div>


            <label className="settings-switch">

              <input
                type="checkbox"

                checked={
                  preferences.autoRefresh
                }

                onChange={(
                  event
                ) =>
                  setPreferences(
                    current => ({
                      ...current,

                      autoRefresh:
                        event.target
                          .checked,
                    })
                  )
                }
              />


              <span />

            </label>

          </div>


          {/* INTERVAL */}

          <div className="settings-control-card">

            <div className="settings-control-title">

              <RefreshCw
                size={16}
              />


              <div>

                <strong>
                  Refresh Interval
                </strong>


                <span>
                  Used by live-monitoring
                  dashboard modules.
                </span>

              </div>

            </div>


            <select
              disabled={
                !preferences.autoRefresh
              }

              value={
                preferences.refreshInterval
              }

              onChange={(
                event
              ) =>
                setPreferences(
                  current => ({
                    ...current,

                    refreshInterval:
                      Number(
                        event.target
                          .value
                      ),
                  })
                )
              }
            >

              <option value={15}>
                15 seconds
              </option>

              <option value={30}>
                30 seconds
              </option>

              <option value={60}>
                1 minute
              </option>

              <option value={300}>
                5 minutes
              </option>

            </select>

          </div>


          {/* REDUCED MOTION */}

          <div className="settings-control-card">

            <div className="settings-control-title">

              <MonitorCog
                size={16}
              />


              <div>

                <strong>
                  Reduced Motion
                </strong>


                <span>
                  Reduce non-essential
                  dashboard animations.
                </span>

              </div>

            </div>


            <label className="settings-switch">

              <input
                type="checkbox"

                checked={
                  preferences.reducedMotion
                }

                onChange={(
                  event
                ) =>
                  setPreferences(
                    current => ({
                      ...current,

                      reducedMotion:
                        event.target
                          .checked,
                    })
                  )
                }
              />


              <span />

            </label>

          </div>

        </div>

      </section>


      {/* ==================================================
          PERMISSIONS
      ================================================== */}

      <section className="dashboard-panel settings-section">

        <div className="settings-section-heading">

          <div className="settings-section-icon">

            <LockKeyhole
              size={17}
            />

          </div>


          <div>

            <span>
              ACCESS CONTROL
            </span>


            <h3>
              Permissions
            </h3>


            <p>
              Permissions are determined
              by the authenticated account
              role.
            </p>

          </div>

        </div>


        <div className="settings-permission-grid">


          <div>

            <span>
              View Dashboards
            </span>

            <strong className="permission-enabled">
              Allowed
            </strong>

          </div>


          <div>

            <span>
              View Reports
            </span>

            <strong className="permission-enabled">
              Allowed
            </strong>

          </div>


          <div>

            <span>
              Export Reports
            </span>

            <strong className="permission-enabled">
              Allowed
            </strong>

          </div>


          <div>

            <span>
              Run ML Analysis
            </span>

            <strong
              className={
                isAnalyst
                  ? "permission-enabled"
                  : "permission-disabled"
              }
            >
              {isAnalyst
                ? "Allowed"
                : "Restricted"}
            </strong>

          </div>


          <div>

            <span>
              Upload Analysis CSV
            </span>

            <strong
              className={
                isAnalyst
                  ? "permission-enabled"
                  : "permission-disabled"
              }
            >
              {isAnalyst
                ? "Allowed"
                : "Restricted"}
            </strong>

          </div>


          <div>

            <span>
              Prediction Endpoints
            </span>

            <strong
              className={
                isAnalyst
                  ? "permission-enabled"
                  : "permission-disabled"
              }
            >
              {isAnalyst
                ? "Allowed"
                : "Restricted"}
            </strong>

          </div>

        </div>

      </section>


      {/* ==================================================
          SYSTEM INFO
      ================================================== */}

      <section className="settings-bottom-grid">


        <article className="dashboard-panel settings-system-card">

          <div className="settings-section-heading">

            <div className="settings-section-icon">

              <MonitorCog
                size={17}
              />

            </div>


            <div>

              <span>
                PLATFORM
              </span>

              <h3>
                System Information
              </h3>

            </div>

          </div>


          <div className="settings-system-list">


            <div>

              <span>
                Application
              </span>

              <strong>
                SCOPTIMA
              </strong>

            </div>


            <div>

              <span>
                Platform
              </span>

              <strong>
                Supply Chain Decision Intelligence
              </strong>

            </div>


            <div>

              <span>
                Backend
              </span>

              <strong>
                FastAPI
              </strong>

            </div>


            <div>

              <span>
                Frontend
              </span>

              <strong>
                React + TypeScript
              </strong>

            </div>


            <div>

              <span>
                Authentication
              </span>

              <strong>
                Secure HTTPOnly Cookie
              </strong>

            </div>

          </div>

        </article>


        {/* SESSION */}

        <article className="dashboard-panel settings-session-card">

          <div className="settings-section-heading">

            <div className="settings-section-icon danger">

              <Bell
                size={17}
              />

            </div>


            <div>

              <span>
                SECURITY
              </span>


              <h3>
                Session
              </h3>


              <p>
                End the current authenticated
                SCOPTIMA session.
              </p>

            </div>

          </div>


          <div className="settings-session-info">

            <ShieldCheck
              size={17}
            />


            <div>

              <strong>
                Authenticated
              </strong>

              <span>
                Signed in as{" "}
                {
                  user?.email ??
                  "current user"
                }
              </span>

            </div>

          </div>


          <button
            type="button"

            className="settings-logout-button"

            disabled={
              loggingOut
            }

            onClick={
              handleLogout
            }
          >

            <LogOut
              size={14}
            />


            {loggingOut
              ? "Signing Out..."
              : "Sign Out"}

          </button>

        </article>

      </section>

    </div>
  );
}