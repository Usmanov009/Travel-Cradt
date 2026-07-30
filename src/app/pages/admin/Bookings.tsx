import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

const statusLabel: Record<string, string> = {
  pending: 'Kutmoqda',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
};
const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminBookings() {
  const { token, isSuperAdmin } = useContext(AdminAuthContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async (status?: string) => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const qs = status && status !== 'all' ? `?status=${status}` : '';
      const r = await adminFetch(`/bookings${qs}`, token);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Server xatosi: ${r.status}`);
      setBookings(d.bookings || []);
      setTotal(d.total || 0);
    } catch (e: any) {
      setLoadError(e.message || "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filter); }, [token, filter]);

  useEffect(() => {
    if (!isSuperAdmin || !token) return;
    adminFetch('/admin-accounts', token)
      .then(r => r.json())
      .then(d => setCompanies(d.admins || []))
      .catch(() => {});
  }, [isSuperAdmin, token]);

  const assignCompany = async (bookingId: number, companyId: string) => {
    try {
      await adminFetch(`/bookings/${bookingId}/company`, token!, {
        method: 'PATCH',
        body: JSON.stringify({ company_id: companyId ? parseInt(companyId) : null }),
      });
      load(filter);
    } catch {}
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await adminFetch(`/bookings/${id}`, token!, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server xatosi: ${res.status}`);
      }
      load(filter);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bronlar</h1>
        <p className="text-gray-500 text-sm mt-1">Jami {total} ta bron</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Hammasi' : statusLabel[s]}
          </button>
        ))}
        <input
          type="text"
          placeholder="Qidirish..."
          className="ml-auto px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yuklanmoqda...</div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-3">{loadError}</p>
            <button
              onClick={() => { setLoading(true); load(filter); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Qayta urinish
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Tour / Mijoz</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Mehmonlar</th>
                <th className="px-4 py-3">Narx</th>
                {isSuperAdmin && <th className="px-4 py-3">Firma</th>}
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{b.title || 'N/A'}</div>
                    <div className="text-gray-400 text-xs">{b.name || 'Noma\'lum'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.phone || '—'}</td>
                  <td className="px-4 py-3 text-center">{b.guests || 1}</td>
                  <td className="px-4 py-3 font-semibold">${b.price || 0}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3">
                      <select
                        value={b.company_id ?? ''}
                        onChange={e => assignCompany(b.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">—</option>
                        {companies.map((c: any) => (
                          <option key={c.company_id} value={c.company_id}>
                            {c.company_name || c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[b.status]}`}>
                      {statusLabel[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(b.booked_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'pending' ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateStatus(b.id, 'accepted')}
                          disabled={updating === b.id}
                          className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs font-medium disabled:opacity-50"
                        >
                          ✓ Qabul
                        </button>
                        <button
                          onClick={() => updateStatus(b.id, 'rejected')}
                          disabled={updating === b.id}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium disabled:opacity-50"
                        >
                          ✕ Rad
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateStatus(b.id, 'pending')}
                        disabled={updating === b.id}
                        className="px-2 py-1 bg-gray-50 text-gray-500 rounded hover:bg-gray-100 text-xs disabled:opacity-50"
                      >
                        Qaytarish
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={isSuperAdmin ? 8 : 7} className="px-4 py-8 text-center text-gray-400">Bronlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
