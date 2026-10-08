import {
  createBrowserRouter,
} from "react-router-dom";

import ProtectedRoute from "../components/dashboard/ProtectedRoute";
import RoleRoute from "../components/dashboard/RoleRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import DashboardPage from "../pages/DashboardPage";
import DemandForecastPage from "../pages/DemandForecastPage";
import InventoryPage from "../pages/InventoryPage";
import StockoutPage from "../pages/StockoutPage";
import CostSavingsPage from "../pages/CostSavingsPage";
import ModelPerformancePage from "../pages/ModelPerformancePage";
import ReportsPage from "../pages/ReportsPage";
import DataQualityPage from "../pages/DataQualityPage";
import SettingsPage from "../pages/SettingsPage";
import RunAnalysisPage from "../pages/RunAnalysisPage";
import SignupPage from "../pages/SignupPage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import ComparisonPage from "../pages/ComparisonPage";


export const router =
  createBrowserRouter([
    // =====================================================
    // PUBLIC ROUTES
    // =====================================================

    {
      path: "/",
      element: <LandingPage />,
    },

    {
      path: "/login",
      element: <LoginPage />,
    },

    {
  path: "/signup",
  element: <SignupPage />,
},


    // =====================================================
    // PROTECTED DASHBOARD
    // =====================================================

    {
      path: "/dashboard",

      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),

      children: [
        // -------------------------------------------------
        // DASHBOARD HOME
        // -------------------------------------------------

        {
          index: true,
          element: <DashboardPage />,
        },


        // -------------------------------------------------
        // DEMAND FORECAST
        // URL:
        // /dashboard/forecasting
        // -------------------------------------------------

        {
          path: "forecasting",
          element: <DemandForecastPage />,
        },


        // -------------------------------------------------
        // INVENTORY
        // -------------------------------------------------

        {
          path: "inventory",
          element: <InventoryPage />,
        },


        // -------------------------------------------------
        // STOCKOUT RISK
        // -------------------------------------------------

        {
          path: "stockout",
          element: <StockoutPage />,
        },


        // -------------------------------------------------
        // COST SAVINGS
        // -------------------------------------------------

        {
          path: "savings",
          element: <CostSavingsPage />,
        },
        
        {
  path: "comparison",
  element: <ComparisonPage />,
},

        // -------------------------------------------------
        // MODEL PERFORMANCE
        // -------------------------------------------------

        {
          path: "models",
          element: <ModelPerformancePage />,
        },


        // -------------------------------------------------
        // REPORTS
        // -------------------------------------------------

        {
          path: "reports",
          element: <ReportsPage />,
        },


        // -------------------------------------------------
        // DATA QUALITY
        // -------------------------------------------------

        {
          path: "data-quality",
          element: <DataQualityPage />,
        },


        // -------------------------------------------------
        // SETTINGS
        // -------------------------------------------------

        {
          path: "settings",
          element: <SettingsPage />,
        },


        // -------------------------------------------------
        // ANALYST ONLY
        // -------------------------------------------------

        {
          path: "run-analysis",

          element: (
            <RoleRoute
              allowedRoles={[
                "Analyst",
              ]}
            >
              <RunAnalysisPage />
            </RoleRoute>
          ),
        },
      ],
    },
  ]);


export default router;