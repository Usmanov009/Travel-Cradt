import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedRouteProps) {
  const { token } = useContext(AdminAuthContext);
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
