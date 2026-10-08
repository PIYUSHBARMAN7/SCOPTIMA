import {
  Activity,
  BarChart3,
  Boxes,
  BrainCircuit,
  ChevronLeft,
  FileText,
  Gauge,
  LineChart,
  LogOut,
  Settings,
  ShieldAlert,
  WalletCards,
  ArrowRightLeft
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface DashboardSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export default function DashboardSidebar({
  collapsed,
  toggleSidebar,
}: DashboardSidebarProps) {
  const {
    user,
    logout,
  } = useAuth();

  const isAnalyst =
    user?.role === "Analyst";

  const navItems = [
    {
      label: "Overview",
      icon: Gauge,
      path: "/dashboard",
      visible: true,
    },

    {
      label: "Demand Forecasting",
      icon: LineChart,
      path: "/dashboard/forecasting",
      visible: true,
    },

    {
      label: "Inventory Optimization",
      icon: Boxes,
      path: "/dashboard/inventory",
      visible: true,
    },

    {
      label: "Stockout Risk",
      icon: ShieldAlert,
      path: "/dashboard/stockout",
      visible: true,
    },

    {
      label: "Cost Savings",
      icon: WalletCards,
      path: "/dashboard/savings",
      visible: true,
    },

    {
  label: "Comparison",
  path: "/dashboard/comparison",
  icon: ArrowRightLeft,
  visible: true,
},

    {
      label: "Model Performance",
      icon: BrainCircuit,
      path: "/dashboard/models",
      visible: isAnalyst,
    },

    {
      label: "Reports",
      icon: FileText,
      path: "/dashboard/reports",
      visible: true,
    },

    {
      label: "Data Quality",
      icon: Activity,
      path: "/dashboard/data-quality",
      visible: isAnalyst,
    },

    {
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
      visible: true,
    },
  ];

  return (
    <aside
      className={`dashboard-sidebar ${
        collapsed
          ? "sidebar-collapsed"
          : ""
      }`}
    >
      <div className="dashboard-brand">
        <div className="dashboard-brand-icon">
          S
        </div>

        {!collapsed && (
          <div>
            <strong>
              SCOPTIMA
            </strong>

            <span>
              SUPPLY CHAIN AI
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        className="sidebar-collapse"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          size={16}
        />
      </button>

      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user?.full_name
            ?.charAt(0)
            .toUpperCase()}
        </div>

        {!collapsed && (
          <div className="sidebar-user-copy">
            <strong>
              {user?.full_name}
            </strong>

            <span>
              {user?.role}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-navigation">
        <span className="sidebar-section-label">
          {!collapsed &&
            "INTELLIGENCE"}
        </span>

        {navItems
          .filter(
            (item) =>
              item.visible
          )
          .map((item) => {
            const Icon =
              item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path ===
                  "/dashboard"
                }
                className={({
                  isActive,
                }) =>
                  `sidebar-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon
                  size={17}
                />

                {!collapsed && (
                  <span>
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-system">
            <div>
              <span className="system-dot" />

              SYSTEM ONLINE
            </div>

            <small>
              API / ML SERVICES
            </small>
          </div>
        )}

        <button
          type="button"
          className="sidebar-logout"
          onClick={logout}
        >
          <LogOut
            size={17}
          />

          {!collapsed && (
            <span>
              Sign out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}