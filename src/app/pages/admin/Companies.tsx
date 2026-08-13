import React, { useContext, useEffect, useState, useRef } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

interface ImportResult {
  row: number;
  name: string;
  email: string;
  company_id: number;
}

interface ImportError {
  row: number;
  error: string;
}

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
  const [editLogo, setEditLogo] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', phone: '', address: '', website: '', description: '', email: '', password: '' });
  const [createLogo, setCreateLogo] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ imported: number; results: ImportResult[]; errors: ImportError[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const body: any = {
        name: createForm.name,
        phone: createForm.phone,
        address: createForm.address,
        website: createForm.website,
        description: createForm.description,
        logo: createLogo,
      };

      if (createForm.email) {
        body.email = createForm.email;
        body.password = createForm.password;
      }

      const res = await adminFetch('/companies', token!, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Xatolik yuz berdi');
      }
      setCreateForm({ name: '', phone: '', address: '', website: '', description: '', email: '', password: '' });
      setCreateLogo(null);
      setShowCreate(false);
      load();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
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

      const res = await adminFetch('/companies/import', token!, {
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

  const filtered = filter === 'all' ? companies : companies.filter(c => c.status === filter);
  const counts = { all: companies.length, pending: 0, approved: 0, rejected: 0 };
  companies.forEach(c => { counts[c.status as keyof typeof counts]++; });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tur Firmalar</h1>
          <p className="text-gray-500 text-sm mt-1">Ro'yxatdan o'tgan tur kompaniyalarni boshqarish</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowCreate(!showCreate); setShowImport(false); setCreateError(null); }}
            className={`px-4 py-2 rounded-lg font-medium ${showCreate ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showCreate ? 'Bekor qilish' : '+ Qo\'lda qo\'shish'}
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setShowCreate(false); setImportError(null); setImportResults(null); }}
            className={`px-4 py-2 rounded-lg font-medium ${showImport ? 'bg-gray-200 text-gray-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          >
            {showImport ? 'Bekor qilish' : '+ File orqali qo\'shish'}
          </button>
        </div>
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

      {showCreate && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Yangi tur firma qo'shish</h2>
          {createError && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg text-sm">{createError}</div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma nomi *</label>
              <input
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Masalan: Samarqand Travel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.phone}
                onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+998 90 123 45 67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.address}
                onChange={e => setCreateForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Shahar, ko'cha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veb-sayt</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.website}
                onChange={e => setCreateForm(p => ({ ...p, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.description}
                onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
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
                    reader.onload = () => setCreateLogo(reader.result as string);
                    reader.readAsDataURL(file);
                  } else {
                    setCreateLogo(null);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (ixtiyoriy)</label>
              <input
                type="email"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.email}
                onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                placeholder="firma@email.com"
              />
            </div>
            {createForm.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
                <input
                  type="password"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={createForm.password}
                  onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Kamida 6 ta belgi"
                  minLength={6}
                />
              </div>
            )}

            <div className="col-span-full flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
              >
                {creating ? 'Yaratilmoqda...' : 'Tur firma yaratish'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
              >
                Bekor
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
              <li><strong>Email</strong> — email, pochta (ixtiyoriy)</li>
              <li><strong>Parol</strong> — parol, password (ixtiyoriy, kamida 6 ta belgi)</li>
              <li><strong>Veb-sayt</strong> — veb, website, sayt</li>
              <li><strong>Tavsif</strong> — tavsif, description, info</li>
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
                            <td className="p-2 text-gray-800">{r.name}</td>
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
                  const body = {
                    name: editForm.name,
                    phone: editForm.phone,
                    address: editForm.address,
                    website: editForm.website,
                    description: editForm.description,
                    logo: editLogo,
                  };

                  const res = await adminFetch(`/companies/${editing.id}`, token!, {
                    method: 'PUT',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' },
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
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setEditLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setEditLogo(null);
                      }
                    }} />
                  {editing.logo && !editLogo && (
                    <div className="mt-2">
                      <img src={editing.logo} alt="Current logo" className="w-16 h-16 object-contain border rounded" />
                    </div>
                  )}
                  {editLogo && (
                    <div className="mt-2">
                      <img src={editLogo} alt="New logo preview" className="w-16 h-16 object-contain border rounded" />
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
