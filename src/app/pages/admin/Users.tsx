import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

export default function AdminUsers() {
  const { token } = useContext(AdminAuthContext);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    if (!token) return;
    adminFetch('/users', token)
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const toggleBlock = async (user: any) => {
    try {
      const res = await adminFetch(`/users/${user.id}/block`, token!, {
        method: 'PUT',
        body: JSON.stringify({ blocked: !user.blocked }),
      });
      if (!res.ok) throw new Error('Xatolik');
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Bu foydalanuvchini o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await adminFetch(`/users/${id}`, token!, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilar</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} ta ro'yxatdan o'tgan foydalanuvchi</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Ism yoki email bo'yicha qidirish..."
          className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <th className="px-4 py-3">Foydalanuvchi</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3">Ro'yxatdan o'tgan</th>
                <th className="px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.name || 'Noma\'lum'}</div>
                    <div className="text-gray-400 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.blocked ? 'Bloklangan' : 'Faol'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBlock(u)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            u.blocked
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                          }`}
                        >
                          {u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium"
                        >
                          O'chirish
                        </button>
                      </div>
                    )}
                    {u.role === 'admin' && <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Foydalanuvchilar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
