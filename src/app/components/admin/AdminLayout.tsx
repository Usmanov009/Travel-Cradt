import React, { useContext, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/packages', label: 'Packages', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AdminAuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  const navLinkClass = (to: string, end?: boolean) =>
    `block px-3 py-2 rounded text-sm font-medium transition ${
      isActive(to, end)
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-700 hover:bg-slate-50'
    }`;

  const sidebar = (
    <>
      <div className="font-bold mb-6 text-lg">TravelCraft Admin</div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={navLinkClass(item.to, item.end)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-500">Signed in as</div>
        <div className="font-medium truncate">{user?.email}</div>
        <button
          onClick={logout}
          className="mt-3 text-sm text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r p-4 flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 md:hidden">
          <span className="font-bold">Admin</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebar}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold truncate">TravelCraft Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
