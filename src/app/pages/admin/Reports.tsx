import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

type CompanyReport = {
  id: number;
  name: string;
  email: string;
  phone: string;
  logo: string;
  status: string;
  package_count: number;
  total_bookings: number;
  accepted_bookings: number;
  pending_bookings: number;
  rejected_bookings: number;
  total_revenue: number;
  pending_revenue: number;
  commission_3pct: number;
  last_booking_at: string | null;
  commission_zeroed_at: string | null;
  reset_count: number;
};

type Totals = {
  total_revenue: number;
  pending_revenue: number;
  total_commission: number;
  total_bookings: number;
  accepted_bookings: number;
  pending_bookings: number;
  rejected_bookings: number;
};

const statusLabels: Record<string, string> = {
  approved: 'Tasdiqlangan',
  active: 'Faol',
  pending: 'Kutilmoqda',
  rejected: 'Rad etilgan',
  blocked: 'Bloklangan',
};

export default function AdminReports() {
  const { token } = useContext(AdminAuthContext);
  const [data, setData] = useState<{ companies: CompanyReport[]; totals: Totals } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'name'>('revenue');
  const [actionLoading, setActionLoading] = useState<number | 'all' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadReports = () => {
    if (!token) return;
    setLoading(true);
    adminFetch('/reports', token)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, [token]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = data.companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
    rows = [...rows].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'bookings') return b.total_bookings - a.total_bookings;
      return b.total_revenue - a.total_revenue;
    });
    return rows;
  }, [data, search, sortBy]);

  const resetCompany = async (company: CompanyReport) => {
    const confirmed = window.confirm(
      `"${company.name}" firmasining 3% komissiya summasi nollanadi.

Nollanadigan summa: $${parseFloat(String(company.commission_3pct)).toLocaleString()}

Davom etasizmi?`
    );
    if (!confirmed) return;

    setActionLoading(company.id);
    setMessage(null);
    try {
      const res = await adminFetch(`/reports/${company.id}/reset`, token, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Xatolik yuz berdi');
      setMessage(json.message || 'Komissiya summasi nollandi');
      loadReports();
    } catch (e: any) {
      setMessage('Xatolik: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const resetAll = async () => {
    const confirmed = window.confirm(
      `BARCHA tur firmalarning 3% komissiya summari nollanadi!

Jami nollanadigan: $${parseFloat(String(totals?.total_commission || 0)).toLocaleString()}

Bu amalni qaytarib bo'lmaydi. Davom etasizmi?`
    );
    if (!confirmed) return;

    setActionLoading('all');
    setMessage(null);
    try {
      const res = await adminFetch('/reports/reset-all', token, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Xatolik yuz berdi');
      setMessage(json.message || 'Barcha komissiya summari nollandi');
      loadReports();
    } catch (e: any) {
      setMessage('Xatolik: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Yuklanmoqda...</div>
      </div>
    );
  if (!data) return null;

  const { totals } = data;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hisobot</h1>
          <p className="text-gray-500 text-sm mt-1">
            Barcha tur firmalarning daromati va bronlar statistikasi
          </p>
        </div>
        <button
          onClick={resetAll}
          disabled={actionLoading !== null}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {actionLoading === 'all' ? 'Nollanmoqda...' : '🗑 Barchasini nollash'}
        </button>
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
          {message}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="text-xs text-gray-500">Jami Daromad</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            ${parseFloat(String(totals?.total_revenue || 0)).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="text-xs text-gray-500">Komissiya (3%)</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">
            ${parseFloat(String(totals?.total_commission || 0)).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="text-xs text-gray-500">Kutilayotgan</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">
            ${parseFloat(String(totals?.pending_revenue || 0)).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="text-xs text-gray-500">Jami Bronlar</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{totals?.total_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-emerald-500">
          <div className="text-xs text-gray-500">Qabul qilingan</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{totals?.accepted_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-500">
          <div className="text-xs text-gray-500">Kutmoqda</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{totals?.pending_bookings || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="text-xs text-gray-500">Rad etilgan</div>
          <div className="text-2xl font-bold mt-1 text-red-600">{totals?.rejected_bookings || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Firma nomi yoki email bo'yicha qidirish..."
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="revenue">Daromad bo'yicha</option>
          <option value="bookings">Bronlar soni bo'yicha</option>
          <option value="name">Nomi bo'yicha</option>
        </select>
        <button
          onClick={loadReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Yangilash
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3 font-semibold">Tur Firma</th>
                <th className="px-4 py-3 font-semibold text-center">Turlar</th>
                <th className="px-4 py-3 font-semibold text-center">Bronlar</th>
                <th className="px-4 py-3 font-semibold text-right">Daromad</th>
                <th className="px-4 py-3 font-semibold text-right">Komissiya (3%)</th>
                <th className="px-4 py-3 font-semibold text-right">Kutilayotgan</th>
                <th className="px-4 py-3 font-semibold">Oxirgi bron</th>
                <th className="px-4 py-3 font-semibold text-center">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    Firmalar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.email}</div>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                          c.status === 'approved' || c.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : c.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {statusLabels[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{c.package_count}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-semibold">{c.total_bookings}</div>
                      <div className="text-xs text-gray-400">
                        ✓{c.accepted_bookings} · ⏳{c.pending_bookings} · ✗{c.rejected_bookings}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-green-600">
                        ${parseFloat(String(c.total_revenue)).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-purple-600">
                        ${parseFloat(String(c.commission_3pct)).toLocaleString()}
                      </div>
                      {c.reset_count > 0 && (
                        <div className="text-xs text-gray-400" title={`Oxirgi nollash: ${c.commission_zeroed_at ? new Date(c.commission_zeroed_at).toLocaleString() : '-'}`}>
                          {c.reset_count} marta nollangan
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-yellow-600">
                      ${parseFloat(String(c.pending_revenue)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {c.last_booking_at ? new Date(c.last_booking_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => resetCompany(c)}
                        disabled={actionLoading !== null}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === c.id ? '...' : 'Nollash'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-bold">
                  <td className="px-4 py-3">JAMI ({filtered.length} ta firma)</td>
                  <td className="px-4 py-3 text-center">
                    {filtered.reduce((s, c) => s + c.package_count, 0)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {filtered.reduce((s, c) => s + c.total_bookings, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    ${filtered
                      .reduce((s, c) => s + parseFloat(String(c.total_revenue)), 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-600">
                    ${filtered
                      .reduce((s, c) => s + parseFloat(String(c.commission_3pct)), 0)
                      .toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-yellow-600">
                    ${filtered
                      .reduce((s, c) => s + parseFloat(String(c.pending_revenue)), 0)
                      .toLocaleString()}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * Har bir firmaning daromatidan 3% komissiya sifatida alohida hisoblanadi. "Nollash"
        tugmasi aynan shu 3% komissiya summasini 0 ga qaytaradi (nollashdan oldingi summa tarixda
        saqlanib qoladi). Firmalarning umumiy daromadi o'zgarishsiz qoladi.
      </p>
    </div>
  );
}