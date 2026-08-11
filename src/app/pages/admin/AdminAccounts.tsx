import React, { useState, useEffect, useContext, useRef } from 'react';
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
  company_phone: string | null;
  company_status: string | null;
  company_logo: string | null;
}

interface ImportResult {
  row: number;
  company_name: string;
  email: string;
  company_id: number;
}

interface ImportError {
  row: number;
  error: string;
}

const emptyForm = {
  company_name: '',
  company_phone: '',
  company_address: '',
  email: '',
  password: '',
  logo: null as string | null,
};

export default function AdminAccounts() {
  const { token } = useContext(AdminAuthContext);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetId, setResetId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ imported: number; results: ImportResult[]; errors: ImportError[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/admin-accounts', token!);
      const data = await res.json();
      setAdmins(data.admins || []);
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
      const body = {
        company_name: form.company_name,
        company_phone: form.company_phone,
        company_address: form.company_address,
        email: form.email,
        password: form.password,
        logo: form.logo,
      };

      const res = await adminFetch('/admin-accounts', token!, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik yuz berdi');
      }
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" tur firmasi va uning adminini o'chirmoqchimisiz?`)) return;
    try {
      await adminFetch(`/admin-accounts/${id}`, token!, { method: 'DELETE' });
      load();
    } catch {}
  };

  const handleResetPassword = async (id: number) => {
    setResetError(null);
    if (!newPassword || newPassword.length < 6) {
      setResetError("Parol kamida 6 ta belgi bo'lishi kerak");
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

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Fayl tanlang');
      return;
    }
    setImportError(null);
    setImportResults(null);
    setImporting(true);

    try {
      const fd = new FormData();
      fd.append('file', importFile);

      const res = await adminFetch('/admin-accounts/import', token!, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Import qilishda xatolik');
      }

      const data = await res.json();
      setImportResults(data);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setImportFile(files[0]);
      setImportError(null);
      setImportResults(null);
    }
  };

  const f = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tur Firma Adminlari</h1>
          <p className="text-sm text-gray-500 mt-1">
            Har bir admin — mustaqil tur firma. Yaratilganda firma ham avtomatik ro'yxatga olinadi.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(!showForm); setShowImport(false); setFormError(null); }}
            className={`px-4 py-2 rounded-lg font-medium ${showForm ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showForm ? 'Bekor qilish' : '+ Qo\'lda qo\'shish'}
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setShowForm(false); setImportError(null); setImportResults(null); }}
            className={`px-4 py-2 rounded-lg font-medium ${showImport ? 'bg-gray-200 text-gray-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          >
            {showImport ? 'Bekor qilish' : '+ File orqali qo\'shish'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">Yangi tur firma va admin yaratish</h2>
          <p className="text-xs text-gray-400 mb-4">
            Quyidagi ma'lumotlar bilan tur firma va uning admin login hisobi bir vaqtda yaratiladi.
          </p>
          {formError && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg text-sm">{formError}</div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-full">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Tur firma</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma nomi *</label>
              <input
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.company_name}
                onChange={f('company_name')}
                placeholder="Masalan: Samarqand Travel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.company_phone}
                onChange={f('company_phone')}
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.company_address}
                onChange={f('company_address')}
                placeholder="Shahar, ko'cha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (PNG, SVG)</label>
              <input
                type="file"
                accept=".png,.svg,.jpg,.jpeg"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setForm(prev => ({ ...prev, logo: reader.result as string }));
                    reader.readAsDataURL(file);
                  } else {
                    setForm(prev => ({ ...prev, logo: null }));
                  }
                }}
              />
            </div>

            <div className="col-span-full mt-2">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Admin login</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={f('email')}
                placeholder="firma@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parol *</label>
              <input
                required
                type="password"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.password}
                onChange={f('password')}
                placeholder="Kamida 6 ta belgi"
                minLength={6}
              />
            </div>

            <div className="col-span-full">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {saving ? 'Yaratilmoqda...' : 'Tur firma va admin yaratish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showImport && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-purple-100">
          <h2 className="text-lg font-semibold mb-1 text-gray-700">Fayl orqali tur firma qo'shish</h2>
          <p className="text-xs text-gray-400 mb-4">
            Excel (.xlsx, .xls) yoki Word (.docx) fayl yuklang. Fayl birinchi qatorni sarlavha sifatida qabul qiladi.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 text-xs text-purple-800">
            <p className="font-semibold mb-1">Fayl tuzilishi:</p>
            <p>Fayl quyidagi ustunlarni ichragi mumkin ( tartib muhim emas ):</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><strong>Firma nomi</strong> — nom, name, firma, kompaniya</li>
              <li><strong>Telefon</strong> — telefon, phone, tel</li>
              <li><strong>Manzil</strong> — manzil, address, adres</li>
              <li><strong>Email</strong> — email, pochta (majburiy)</li>
              <li><strong>Parol</strong> — parol, password (majburiy, kamida 6 ta belgi)</li>
            </ul>
          </div>

          {importError && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg text-sm">{importError}</div>
          )}

          <form onSubmit={handleImport} className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.docx,.doc"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  setImportFile(file);
                  setImportError(null);
                  setImportResults(null);
                }}
              />
              {importFile ? (
                <div className="text-purple-700">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="font-medium">{importFile.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{(importFile.size / 1024).toFixed(1)} KB</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-3xl mb-2">📂</div>
                  <div className="font-medium">Faylni shu yerga torting yoki tanlash uchun bosing</div>
                  <div className="text-xs mt-1">.xlsx, .xls, .docx (maks. 10 MB)</div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={importing || !importFile}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-medium"
            >
              {importing ? 'Import qilinmoqda...' : 'Import qilish'}
            </button>
          </form>

          {importResults && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg ${importResults.imported > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="font-semibold text-gray-800 mb-1">Natija</h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-green-700">{importResults.imported} ta</span> tur firma muvaffaqiyatli qo'shildi
                  {importResults.errors.length > 0 && (
                    <span className="text-red-600">, <span className="font-medium">{importResults.errors.length} ta</span> xatolik</span>
                  )}
                </p>
              </div>

              {importResults.results.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Muvaffaqiyatli qo'shilganlar:</h4>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-gray-600">#</th>
                          <th className="text-left p-2 font-medium text-gray-600">Firma nomi</th>
                          <th className="text-left p-2 font-medium text-gray-600">Email</th>
                          <th className="text-left p-2 font-medium text-gray-600">ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importResults.results.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-2 text-gray-500">{r.row}</td>
                            <td className="p-2 text-gray-800">{r.company_name}</td>
                            <td className="p-2 text-gray-600">{r.email}</td>
                            <td className="p-2 text-gray-500">{r.company_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResults.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-700 mb-2">Xatoliklar:</h4>
                  <div className="max-h-60 overflow-y-auto border border-red-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="text-left p-2 font-medium text-red-600">Qator</th>
                          <th className="text-left p-2 font-medium text-red-600">Xatolik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {importResults.errors.map((err, i) => (
                          <tr key={i} className="hover:bg-red-50">
                            <td className="p-2 text-gray-500">{err.row}</td>
                            <td className="p-2 text-red-700">{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 py-8 text-center">Yuklanmoqda...</div>
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">🏢</div>
          <div className="font-medium">Hali tur firma admini yaratilmagan</div>
          <div className="text-sm mt-1">Yuqoridagi "Qo'lda qo'shish" yoki "File orqali qo'shish" tugmasini bosing</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Tur firma</th>
                <th className="text-left p-4 font-medium text-gray-600">Login (email)</th>
                <th className="text-left p-4 font-medium text-gray-600">Telefon</th>
                <th className="text-left p-4 font-medium text-gray-600">Holati</th>
                <th className="text-left p-4 font-medium text-gray-600">Yaratilgan</th>
                <th className="text-left p-4 font-medium text-gray-600">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {admin.company_logo ? (
                        <img src={admin.company_logo} alt={admin.company_name || ''} className="w-10 h-10 rounded object-contain bg-gray-50 border" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">LOGO</div>
                      )}
                      <span className="font-medium text-gray-800">{admin.company_name || admin.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{admin.email}</td>
                  <td className="p-4 text-gray-500">{admin.company_phone || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      admin.company_status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : admin.company_status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {admin.company_status === 'approved' ? 'Faol'
                        : admin.company_status === 'rejected' ? 'Rad etilgan'
                        : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {resetId === admin.id ? (
                        <div className="flex items-center gap-1 flex-wrap">
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
                          {resetError && <span className="text-red-500 text-xs w-full">{resetError}</span>}
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
                            onClick={() => handleDelete(admin.id, admin.company_name || admin.name)}
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
