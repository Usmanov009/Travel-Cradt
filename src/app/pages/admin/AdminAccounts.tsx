import React, { useState, useEffect, useContext } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  created_at: string;
  company_id: number | null;
  company_name: string | null;
}

interface Company {
  id: number;
  name: string;
}

export default function AdminAccounts() {
  const { token } = useContext(AdminAuthContext);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', company_id: '', company_name_input: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetId, setResetId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [adminsRes, companiesRes] = await Promise.all([
        adminFetch('/admin-accounts', token!),
        adminFetch('/companies', token!),
      ]);
      const adminsData = await adminsRes.json();
      const companiesData = await companiesRes.json();
      setAdmins(adminsData.admins || []);
      setCompanies(companiesData.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      // company_name_input bo'yicha mos company_id topamiz
      const matched = companies.find(
        c => c.name.toLowerCase() === form.company_name_input.toLowerCase()
      );
      const resolvedCompanyId = matched ? matched.id : (form.company_id ? parseInt(form.company_id) : null);

      const res = await adminFetch('/admin-accounts', token!, {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          company_id: resolvedCompanyId,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik yuz berdi');
      }
      setForm({ name: '', email: '', password: '', company_id: '', company_name_input: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" adminini o'chirmoqchimisiz?`)) return;
    try {
      await adminFetch(`/admin-accounts/${id}`, token!, { method: 'DELETE' });
      load();
    } catch {}
  };

  const handleResetPassword = async (id: number) => {
    setResetError(null);
    if (!newPassword || newPassword.length < 6) {
      setResetError('Parol kamida 6 ta belgi bo\'lishi kerak');
      return;
    }
    try {
      const res = await adminFetch(`/admin-accounts/${id}/password`, token!, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik');
      }
      setResetId(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Boshqaruvi</h1>
          <p className="text-sm text-gray-500 mt-1">Tur firma adminlarini yarating va boshqaring</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(null); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {showForm ? 'Bekor qilish' : '+ Yangi admin'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Yangi admin yaratish</h2>
          {formError && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg text-sm">{formError}</div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="To'liq ism"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol *</label>
              <input
                required
                type="password"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Kamida 6 ta belgi"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tur firma</label>
              <input
                type="text"
                list="companies-datalist"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.company_name_input}
                onChange={e => setForm(f => ({ ...f, company_name_input: e.target.value }))}
                placeholder="Tur firma nomini yozing..."
                autoComplete="off"
              />
              <datalist id="companies-datalist">
                {companies.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              {form.company_name_input && !companies.find(
                c => c.name.toLowerCase() === form.company_name_input.toLowerCase()
              ) && (
                <p className="text-xs text-amber-600 mt-1">
                  Ushbu nom bazada topilmadi — admin firmaga biriktirilmaydi
                </p>
              )}
            </div>
            <div className="col-span-full">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {saving ? 'Saqlanmoqda...' : 'Admin yaratish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Yuklanmoqda...</div>
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">🔑</div>
          <div className="font-medium">Hali admin yaratilmagan</div>
          <div className="text-sm mt-1">Yuqoridagi "Yangi admin" tugmasini bosing</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Ism</th>
                <th className="text-left p-4 font-medium text-gray-600">Email</th>
                <th className="text-left p-4 font-medium text-gray-600">Tur firma</th>
                <th className="text-left p-4 font-medium text-gray-600">Yaratilgan</th>
                <th className="text-left p-4 font-medium text-gray-600">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{admin.name}</td>
                  <td className="p-4 text-gray-600">{admin.email}</td>
                  <td className="p-4">
                    {admin.company_name ? (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {admin.company_name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Biriktirilmagan</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {resetId === admin.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            className="p-1.5 border rounded-lg text-xs w-32 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder="Yangi parol"
                            value={newPassword}
                            onChange={e => { setNewPassword(e.target.value); setResetError(null); }}
                          />
                          <button
                            onClick={() => handleResetPassword(admin.id)}
                            className="px-2 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                          >
                            Saqlash
                          </button>
                          <button
                            onClick={() => { setResetId(null); setNewPassword(''); setResetError(null); }}
                            className="px-2 py-1.5 bg-gray-400 text-white rounded-lg text-xs hover:bg-gray-500"
                          >
                            Bekor
                          </button>
                          {resetError && <span className="text-red-500 text-xs">{resetError}</span>}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setResetId(admin.id); setNewPassword(''); setResetError(null); }}
                            className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600 font-medium"
                          >
                            Parol
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id, admin.name)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 font-medium"
                          >
                            O'chirish
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
