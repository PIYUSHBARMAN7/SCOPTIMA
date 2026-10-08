import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import {
  useAuth,
  type UserRole,
} from "../../context/AuthContext";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export default function RoleRoute({
  allowedRoles,
  children,
}: RoleRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
}