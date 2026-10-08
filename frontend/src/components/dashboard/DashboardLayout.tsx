import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";

import "../../styles/dashboard.css";

export default function DashboardLayout() {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  return (
    <div
      className={`dashboard-shell ${
        collapsed
          ? "dashboard-sidebar-small"
          : ""
      }`}
    >
      <DashboardSidebar
        collapsed={collapsed}
        toggleSidebar={() =>
          setCollapsed(
            (current) =>
              !current
          )
        }
      />

      <section className="dashboard-workspace">
        <DashboardTopbar />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}