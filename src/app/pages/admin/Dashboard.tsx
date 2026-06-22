import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

export default function AdminDashboard() {
  const { token } = useContext(AdminAuthContext);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setErr('No authentication token');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminFetch('/overview', token);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errData.error || `API error: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
        setErr(null);
      } catch (e: any) {
        console.error('Dashboard error:', e);
        setErr(e.message || 'Failed to load dashboard data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading dashboard...</div>;
  if (err) return <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-100">{err}</div>;
  if (!data) return <div className="text-slate-500 p-4">No data available</div>;

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-4 bg-white rounded shadow border-l-4 border-blue-500">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Users</div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{data.totalUsers ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border-l-4 border-green-500">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Packages</div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{data.totalPackages ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border-l-4 border-purple-500">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Bookings</div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">{data.totalBookings ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border-l-4 border-yellow-500 col-span-2 lg:col-span-1">
          <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Revenue</div>
          <div className="text-2xl sm:text-3xl font-bold mt-2">${data.totalRevenue ?? 0}</div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Recent Bookings</h2>
        {data.recentBookings && data.recentBookings.length > 0 ? (
          <div className="space-y-3">
            {data.recentBookings.map((b: any) => (
              <div key={b.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:justify-between gap-2 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="font-medium truncate">{b.title || 'N/A'} — {b.name || 'Unknown'}</div>
                  <div className="text-sm text-slate-500">{b.phone || 'N/A'} • {b.guests || 1} guests</div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="text-sm font-medium">${b.price || 0}</div>
                  <div className="text-xs text-slate-500">{formatDate(b.booked_at)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-6">No recent bookings</div>
        )}
      </div>
    </div>
  );
}
