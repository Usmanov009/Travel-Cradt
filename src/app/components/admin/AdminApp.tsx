import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import AdminLayout from './AdminLayout';
import AdminLogin from '../../pages/admin/Login';

export default function AdminApp() {
  const { token } = useContext(AdminAuthContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for context to initialize from localStorage
    setIsReady(true);
  }, []);

  if (!isReady) return <div>Loading...</div>;
  
  // Show login page if not authenticated
  if (!token) {
    return <AdminLogin />;
  }

  // Show admin layout with child routes if authenticated
  return <AdminLayout />;
}
