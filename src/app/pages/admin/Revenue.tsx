import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminRevenue() {
  const { token } = useContext(AdminAuthContext);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminFetch('/revenue', token)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Yuklanmoqda...</div>
    </div>
  );
  if (!data) return null;

  const { summary, monthly, byType, topPackages } = data;

  const typeLabels: Record<string, string> = {
    domestic: 'Ichki',
    international: 'Xalqaro',
    custom: 'Maxsus',
  };

  const pieData = (byType || []).map((t: any) => ({
    name: typeLabels[t.type] || t.type || 'Boshqa',
    value: parseFloat(t.revenue),
  }));

  const monthLabels: Record<string, string> = {
    '01': 'Yan', '02': 'Fev', '03': 'Mar', '04': 'Apr',
    '05': 'May', '06': 'Iyn', '07': 'Iyl', '08': 'Avg',
    '09': 'Sen', '10': 'Okt', '11': 'Noy', '12': 'Dek',
  };

  const chartData = (monthly || []).map((m: any) => ({
    month: monthLabels[m.month?.split('-')[1]] || m.month,
    daromad: parseFloat(m.revenue),
    bronlar: parseInt(m.bookings),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daromad Tahlili</h1>
        <p className="text-gray-500 text-sm mt-1">Moliyaviy ko'rsatkichlar va statistika</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="text-sm text-gray-500">Jami Daromad</div>
          <div className="text-3xl font-bold mt-1 text-green-600">
            ${parseFloat(summary?.total_revenue || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-500">Kutilayotgan (pending)</div>
          <div className="text-3xl font-bold mt-1 text-yellow-600">
            ${parseFloat(summary?.pending_revenue || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500">Jami Bronlar</div>
          <div className="text-3xl font-bold mt-1 text-blue-600">{summary?.total_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500">
          <div className="text-sm text-gray-500">Qabul qilingan</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">{summary?.accepted_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <div className="text-sm text-gray-500">Kutmoqda</div>
          <div className="text-3xl font-bold mt-1 text-orange-600">{summary?.pending_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="text-sm text-gray-500">Rad etilgan</div>
          <div className="text-3xl font-bold mt-1 text-red-600">{summary?.rejected_bookings || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Oylik Daromad (so'nggi 12 oy)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [`$${v}`, 'Daromad']} />
                <Bar dataKey="daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">Ma'lumot yo'q</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tur Turlari</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`$${v}`, 'Daromad']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">Ma'lumot yo'q</div>
          )}
        </div>
      </div>

      {/* Top packages */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Turlar (daromad bo'yicha)</h2>
        {topPackages?.length > 0 ? (
          <div className="space-y-3">
            {topPackages.map((pkg: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{pkg.title}</div>
                    <div className="text-gray-400 text-xs">{pkg.bookings} ta bron</div>
                  </div>
                </div>
                <div className="font-bold text-green-600">${parseFloat(pkg.revenue).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">Hali ma'lumot yo'q</div>
        )}
      </div>
    </div>
  );
}
