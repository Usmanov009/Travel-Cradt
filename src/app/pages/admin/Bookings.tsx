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
  const { token } = useContext(AdminAuthContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = (status?: string) => {
    if (!token) return;
    const qs = status && status !== 'all' ? `?status=${status}` : '';
    adminFetch(`/bookings${qs}`, token)
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setTotal(d.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [token, filter]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await adminFetch(`/bookings/${id}`, token!, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Xatolik');
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
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Tour / Mijoz</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Mehmonlar</th>
                <th className="px-4 py-3">Narx</th>
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
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Bronlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
