import React, { useContext, useEffect, useState, useRef } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

const statusLabel: Record<string, string> = {
  pending: 'Kutmoqda',
  approved: 'Tasdiqlangan',
  rejected: 'Rad etilgan',
};

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminCompanies() {
  const { token } = useContext(AdminAuthContext);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', website: '', description: '' });
  const [editLogo, setEditLogo] = useState<File | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    adminFetch('/companies', token)
      .then(r => r.json())
      .then(d => setCompanies(d.companies || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await adminFetch(`/companies/${id}/status`, token!, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Xatolik');
      setSelected(null);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteCompany = async (id: number) => {
    if (!confirm('Bu firmani o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await adminFetch(`/companies/${id}`, token!, { method: 'DELETE' });
      setSelected(null);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = filter === 'all' ? companies : companies.filter(c => c.status === filter);
  const counts = { all: companies.length, pending: 0, approved: 0, rejected: 0 };
  companies.forEach(c => { counts[c.status as keyof typeof counts]++; });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tur Firmalar</h1>
        <p className="text-gray-500 text-sm mt-1">Ro'yxatdan o'tgan tur kompaniyalarni boshqarish</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'Hammasi' : statusLabel[s]} ({counts[s] || 0})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yuklanmoqda...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Aloqa</th>
                <th className="px-4 py-3">Turlar</th>
                <th className="px-4 py-3">Daromad</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="w-10 h-10 rounded object-contain bg-gray-50 border" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">LOGO</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-800">{c.name}</div>
                        <div className="text-gray-400 text-xs">{c.address || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 text-xs">{c.email}</div>
                    <div className="text-gray-400 text-xs">{c.phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{c.package_count || 0}</td>
                  <td className="px-4 py-3 font-semibold">${parseFloat(c.revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status]}`}>
                      {statusLabel[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium"
                    >
                      Boshqarish
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Firmalar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Company detail modal */}
      {selected && !editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selected.logo ? (
                  <img src={selected.logo} alt={selected.name} className="w-10 h-10 rounded object-contain bg-gray-50 border" />
                ) : null}
                <h2 className="text-lg font-semibold">{selected.name}</h2>
              </div>
              <button onClick={() => { setSelected(null); setEditing(null); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selected.email}</span></div>
                <div><span className="text-gray-500">Tel:</span> <span className="font-medium">{selected.phone || '—'}</span></div>
                <div><span className="text-gray-500">Manzil:</span> <span className="font-medium">{selected.address || '—'}</span></div>
                <div><span className="text-gray-500">Veb-sayt:</span> <span className="font-medium">{selected.website || '—'}</span></div>
                <div><span className="text-gray-500">Turlar soni:</span> <span className="font-bold">{selected.package_count || 0}</span></div>
                <div><span className="text-gray-500">Daromad:</span> <span className="font-bold">${parseFloat(selected.revenue || 0).toLocaleString()}</span></div>
              </div>
              {selected.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Tavsif:</div>
                  <div className="text-gray-700">{selected.description}</div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Hozirgi holat:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[selected.status]}`}>
                  {statusLabel[selected.status]}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t space-y-2">
              <div className="text-xs text-gray-500 mb-2 font-medium">Holatni o'zgartirish:</div>
              <div className="flex gap-2 flex-wrap">
                {selected.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    ✓ Tasdiqlash
                  </button>
                )}
                {selected.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'pending')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                  >
                    Kutishga qaytarish
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    ✕ Rad etish
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditing(selected);
                    setEditForm({
                      name: selected.name || '',
                      phone: selected.phone || '',
                      address: selected.address || '',
                      website: selected.website || '',
                      description: selected.description || '',
                    });
                    setEditLogo(null);
                    setEditError(null);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                >
                  Tahrirlash
                </button>
                <button
                  onClick={() => { if (confirm('Bu firmani o\'chirishni tasdiqlaysizmi?')) deleteCompany(selected.id); }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit company modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Firmani tahrirlash</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {editError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{editError}</div>}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setEditError(null);
                try {
                  const fd = new FormData();
                  fd.append('name', editForm.name);
                  fd.append('phone', editForm.phone);
                  fd.append('address', editForm.address);
                  fd.append('website', editForm.website);
                  fd.append('description', editForm.description);
                  if (editLogo) fd.append('logo', editLogo);

                  const res = await adminFetch(`/companies/${editing.id}`, token!, {
                    method: 'PUT',
                    body: fd,
                  });
                  if (!res.ok) {
                    const d = await res.json();
                    throw new Error(d.error || 'Xatolik');
                  }
                  setEditing(null);
                  load();
                } catch (err: any) {
                  setEditError(err.message);
                } finally {
                  setSaving(false);
                }
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma nomi</label>
                  <input className="w-full p-2.5 border border-gray-300 rounded-lg" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input className="w-full p-2.5 border border-gray-300 rounded-lg" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
                  <input className="w-full p-2.5 border border-gray-300 rounded-lg" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veb-sayt</label>
                  <input className="w-full p-2.5 border border-gray-300 rounded-lg" value={editForm.website} onChange={e => setEditForm(p => ({ ...p, website: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                  <textarea className="w-full p-2.5 border border-gray-300 rounded-lg" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo (PNG, SVG)</label>
                  <input type="file" accept=".png,.svg,.jpg,.jpeg" className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    onChange={e => setEditLogo(e.target.files?.[0] || null)} />
                  {editing.logo && !editLogo && (
                    <div className="mt-2">
                      <img src={editing.logo} alt="Current logo" className="w-16 h-16 object-contain border rounded" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">Bekor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
