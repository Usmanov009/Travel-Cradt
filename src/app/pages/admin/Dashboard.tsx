import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 font-medium">{label}</div>
          <div className="text-3xl font-bold mt-1 text-gray-800">{value}</div>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useContext(AdminAuthContext);
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setErr('No authentication token'); setLoading(false); return; }
    adminFetch('/overview', token)
      .then(r => r.json())
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400 text-lg">Yuklanmoqda...</div>
    </div>
  );
  if (err) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">{err}</div>;
  if (!data) return null;

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">TravelCraft Super Admin Paneli</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jami Foydalanuvchilar" value={data.totalUsers ?? 0} icon="👥" color="border-blue-500" />
        <StatCard label="Jami Turlar" value={data.totalPackages ?? 0} icon="🌍" color="border-green-500" />
        <StatCard label="Jami Bronlar" value={data.totalBookings ?? 0} icon="📋" color="border-purple-500" />
        <StatCard label="Jami Daromad" value={`$${(data.totalRevenue ?? 0).toLocaleString()}`} icon="💰" color="border-yellow-500" />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">So'nggi Bronlar</h2>
          <a href="/admin/bookings" className="text-sm text-blue-600 hover:underline">Barchasini ko'rish →</a>
        </div>
        {data.recentBookings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 pr-4">Tour</th>
                  <th className="pb-3 pr-4">Mijoz</th>
                  <th className="pb-3 pr-4">Narx</th>
                  <th className="pb-3 pr-4">Holat</th>
                  <th className="pb-3">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium">{b.title || 'N/A'}</td>
                    <td className="py-3 pr-4 text-gray-600">{b.name || 'Noma\'lum'}</td>
                    <td className="py-3 pr-4 font-semibold">${b.price || 0}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status === 'pending' ? 'Kutmoqda' : b.status === 'accepted' ? 'Qabul qilindi' : "Rad etildi"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(b.booked_at).toLocaleDateString('uz-UZ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">Hali bronlar yo'q</div>
        )}
      </div>
    </div>
  );
}
