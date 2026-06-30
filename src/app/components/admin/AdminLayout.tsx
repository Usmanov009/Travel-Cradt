import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';

const superAdminNav = [
  { to: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/admin/packages', label: 'Turlar', icon: '🌍' },
  { to: '/admin/bookings', label: 'Bronlar', icon: '📋' },
  { to: '/admin/users', label: 'Foydalanuvchilar', icon: '👥' },
  { to: '/admin/companies', label: 'Tur Firmalar', icon: '🏢' },
  { to: '/admin/revenue', label: 'Daromad', icon: '💰' },
  { to: '/admin/admin-accounts', label: 'Admin Boshqaruvi', icon: '🔑' },
];

const companyAdminNav = [
  { to: '/admin/packages', label: 'Mening turlarim', icon: '🌍' },
  { to: '/admin/bookings', label: 'Bronlar', icon: '📋' },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useContext(AdminAuthContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = isSuperAdmin ? superAdminNav : companyAdminNav;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col transition-all duration-200`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-blue-700">
          {!collapsed && (
            <div>
              <div className="font-bold text-lg">TravelCraft</div>
              <div className={`text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block ${isSuperAdmin ? 'bg-yellow-500 text-yellow-900' : 'bg-blue-500 text-white'}`}>
                {isSuperAdmin ? 'Super Admin' : 'Tur Firma'}
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-blue-700 text-blue-200 text-xl"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive(item.to, item.exact)
                  ? 'bg-white text-blue-900'
                  : 'text-blue-100 hover:bg-blue-700'
                }`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-blue-700 p-4">
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs text-blue-300">Kirgan foydalanuvchi:</div>
              <div className="text-sm font-medium truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-blue-400 truncate">{user?.email}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 transition-colors"
          >
            <span>🚪</span>
            {!collapsed && <span>Chiqish</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
