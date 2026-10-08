import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


export default function DashboardTopbar() {
  const {
    user,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);


  const [
    notificationsOpen,
    setNotificationsOpen,
  ] =
    useState(false);


  const profileRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const notificationRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const isAnalyst =
    user?.role === "Analyst";


  const initial =
    user?.full_name
      ?.charAt(0)
      .toUpperCase() ||
    "U";


  // ========================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ========================================================

  useEffect(() => {
    const handleOutsideClick =
      (
        event:
          MouseEvent
      ) => {

        const target =
          event.target as Node;


        if (
          profileRef.current &&
          !profileRef.current.contains(
            target
          )
        ) {
          setProfileOpen(
            false
          );
        }


        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            target
          )
        ) {
          setNotificationsOpen(
            false
          );
        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // ========================================================
  // LOGOUT
  // ========================================================

  const handleLogout =
    async () => {

      try {

        await logout();


        navigate(
          "/login",
          {
            replace: true,
          }
        );


      } catch (error) {

        console.error(
          "Logout failed:",
          error
        );

      }

    };


  return (
    <header className="dashboard-topbar">

      {/* ==================================================
          LEFT
      ================================================== */}

      <div className="dashboard-topbar-left">

        <div>

          <span className="topbar-platform-label">
            SCOPTIMA
          </span>


          <strong className="topbar-platform-title">
            Decision Intelligence Platform
          </strong>

        </div>

      </div>


      {/* ==================================================
          RIGHT
      ================================================== */}

      <div className="topbar-user-actions">


        {/* ACCESS MODE */}

        <div
          className={`topbar-access-badge ${
            isAnalyst
              ? "analyst"
              : "viewer"
          }`}
        >

          <ShieldCheck
            size={15}
          />


          <span>

            {isAnalyst
              ? "ANALYST MODE"
              : "READ ONLY"}

          </span>

        </div>


        {/* ==================================================
            NOTIFICATIONS
        ================================================== */}

        <div
          className="topbar-dropdown-wrapper"

          ref={
            notificationRef
          }
        >

          <button
            type="button"

            className={`topbar-notification-button ${
              notificationsOpen
                ? "active"
                : ""
            }`}

            aria-label="Notifications"

            onClick={() => {

              setNotificationsOpen(
                current =>
                  !current
              );


              setProfileOpen(
                false
              );

            }}
          >

            <Bell
              size={19}
            />

          </button>


          {notificationsOpen && (

            <div className="topbar-notification-dropdown">

              <div className="topbar-dropdown-header">

                <div>

                  <span>
                    INTELLIGENCE
                  </span>


                  <strong>
                    Notifications
                  </strong>

                </div>

              </div>


              <div className="topbar-notification-empty">

                <div>

                  <Bell
                    size={19}
                  />

                </div>


                <strong>
                  No new notifications
                </strong>


                <span>
                  Supply chain alerts and
                  system updates will appear
                  here.
                </span>

              </div>

            </div>

          )}

        </div>


        {/* ==================================================
            PROFILE
        ================================================== */}

        <div
          className="topbar-dropdown-wrapper"

          ref={
            profileRef
          }
        >

          <button
            type="button"

            className={`topbar-profile ${
              profileOpen
                ? "active"
                : ""
            }`}

            onClick={() => {

              setProfileOpen(
                current =>
                  !current
              );


              setNotificationsOpen(
                false
              );

            }}
          >

            <div className="topbar-profile-avatar">

              {initial}

            </div>


            <div className="topbar-profile-copy">

              <strong>

                {user?.full_name ||
                  "SCOPTIMA User"}

              </strong>


              <span>

                {user?.role ||
                  "User"}

              </span>

            </div>


            <ChevronDown
              size={15}

              className={`topbar-profile-chevron ${
                profileOpen
                  ? "open"
                  : ""
              }`}
            />

          </button>


          {profileOpen && (

            <div className="topbar-profile-dropdown">


              {/* USER INFORMATION */}

              <div className="topbar-dropdown-user">

                <div className="topbar-dropdown-avatar">

                  {initial}

                </div>


                <div>

                  <strong>

                    {user?.full_name ||
                      "SCOPTIMA User"}

                  </strong>


                  <span>

                    {user?.email ||
                      ""}

                  </span>

                </div>

              </div>


              <div className="topbar-dropdown-divider" />


              {/* ROLE */}

              <div className="topbar-dropdown-role">

                <ShieldCheck
                  size={14}
                />


                <div>

                  <span>
                    Access level
                  </span>


                  <strong>

                    {isAnalyst
                      ? "Analyst"
                      : "Executive / Viewer"}

                  </strong>

                </div>

              </div>


              <div className="topbar-dropdown-divider" />


              {/* PROFILE */}

              <button
                type="button"

                className="topbar-dropdown-item"

                onClick={() => {

                  setProfileOpen(
                    false
                  );


                  navigate(
                    "/dashboard/settings"
                  );

                }}
              >

                <UserRound
                  size={15}
                />

                <span>
                  Profile
                </span>

              </button>


              {/* SETTINGS */}

              <button
                type="button"

                className="topbar-dropdown-item"

                onClick={() => {

                  setProfileOpen(
                    false
                  );


                  navigate(
                    "/dashboard/settings"
                  );

                }}
              >

                <Settings
                  size={15}
                />

                <span>
                  Settings
                </span>

              </button>


              <div className="topbar-dropdown-divider" />


              {/* SIGN OUT */}

              <button
                type="button"

                className="topbar-dropdown-item logout"

                onClick={
                  handleLogout
                }
              >

                <LogOut
                  size={15}
                />

                <span>
                  Sign Out
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}