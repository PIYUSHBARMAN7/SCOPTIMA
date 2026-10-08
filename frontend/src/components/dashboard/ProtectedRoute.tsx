import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-logo">
          S
        </div>

        <span>
          VERIFYING SECURE SESSION
        </span>

        <div className="auth-loader" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}