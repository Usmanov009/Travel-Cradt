import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

const emptyForm = {
  type: 'domestic', category: '', title: '', description: '',
  image: '', duration: '', price: '', price_currency: 'USD', country: '', hotel: '',
  flight_included: false, vibe: '', included: '', interests: '',
  destination: '', destination1: '', destination2: '', country1: '', country2: '',
};

export default function AdminPackages() {
  const { token, isSuperAdmin } = useContext(AdminAuthContext);
  const [packages, setPackages] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    adminFetch('/packages', token)
      .then(r => r.json())
      .then(d => setPackages(d.packages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (!isSuperAdmin || !token) return;
    adminFetch('/admin-accounts', token)
      .then(r => r.json())
      .then(d => setCompanies(d.admins || []))
      .catch(() => {});
  }, [isSuperAdmin, token]);

  const assignCompany = async (pkgId: number, companyId: string) => {
    setAssigningId(pkgId);
    try {
      await adminFetch(`/packages/${pkgId}/company`, token!, {
        method: 'PATCH',
        body: JSON.stringify({ company_id: companyId ? parseInt(companyId) : null }),
      });
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAssigningId(null);
    }
  };

  const openCreate = () => {
    setEditPkg(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pkg: any) => {
    setForm({
      type: pkg.type || 'domestic',
      category: pkg.category || '',
      title: pkg.title || '',
      description: pkg.description || '',
      image: pkg.image || '',
      duration: pkg.duration || '',
      price: pkg.price || '',
      price_currency: pkg.price_currency || 'USD',
      country: pkg.country || '',
      hotel: pkg.hotel || '',
      flight_included: pkg.flight_included || false,
      vibe: pkg.vibe || '',
      included: (pkg.included || []).join(', '),
      interests: (pkg.interests || []).join(', '),
      destination: pkg.destination || '',
      destination1: pkg.destination1 || '',
      destination2: pkg.destination2 || '',
      country1: pkg.country1 || '',
      country2: pkg.country2 || '',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (form.type === 'international' && !form.country) {
      alert('Xalqaro tur uchun avval mamlakatni tanlang.');
      return;
    }
    if (form.type === 'international' && form.country && !form.destination) {
      alert('Xalqaro tur uchun mamlakat tanlangandan keyin manzilni kiriting.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price as string) || 0,
        price_currency: form.price_currency || 'USD',
        included: form.included.split(',').map((s: string) => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map((s: string) => s.trim()).filter(Boolean),
        destination: form.destination || null,
        destination1: form.destination1 || null,
        destination2: form.destination2 || null,
        country1: form.country1 || null,
        country2: form.country2 || null,
      };
      const path = editPkg ? `/packages/${editPkg.id}` : '/packages';
      const method = editPkg ? 'PUT' : 'POST';
      const res = await adminFetch(path, token!, { method, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Saqlashda xatolik');
      setShowForm(false);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deletePkg = async (id: number) => {
    try {
      await adminFetch(`/packages/${id}`, token!, { method: 'DELETE' });
      setDeleteId(null);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = packages.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Turlar Boshqaruvi</h1>
          <p className="text-gray-500 text-sm mt-1">{packages.length} ta tur mavjud</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Yangi Tur Qo'shish
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tur nomi yoki mamlakat bo'yicha qidirish..."
          className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yuklanmoqda...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Tur Nomi</th>
                <th className="px-4 py-3">Turi</th>
                <th className="px-4 py-3">Mamlakat</th>
                <th className="px-4 py-3">Narx</th>
                <th className="px-4 py-3">Firma</th>
                <th className="px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{pkg.title}</div>
                    <div className="text-gray-400 text-xs">{pkg.duration}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.type === 'domestic' ? 'bg-green-100 text-green-700' :
                      pkg.type === 'international' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {pkg.type === 'domestic' ? 'Ichki' : pkg.type === 'international' ? 'Xalqaro' : 'Maxsus'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pkg.country || '—'}</td>
                  <td className="px-4 py-3 font-semibold">
                    {pkg.price_currency === 'UZS' ? `${pkg.price?.toLocaleString()} so'm` : `$${pkg.price?.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {isSuperAdmin ? (
                      <select
                        value={pkg.company_id ?? ''}
                        disabled={assigningId === pkg.id}
                        onChange={e => assignCompany(pkg.id, e.target.value)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
                      >
                        <option value="">TravelCraft</option>
                        {companies.map((c: any) => (
                          <option key={c.company_id} value={c.company_id}>
                            {c.company_name || c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500">{pkg.company_name || 'TravelCraft'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(pkg)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => setDeleteId(pkg.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Turlar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-gray-500 text-sm mb-4">Bu turni o'chirib tashlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Bekor qilish</button>
              <button onClick={() => deletePkg(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editPkg ? 'Turni Tahrirlash' : 'Yangi Tur Qo\'shish'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tur Turi *</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="domestic">Ichki (Domestic)</option>
                    <option value="international">Xalqaro (International)</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Tanlang...</option>
                    <option value="historical">Tarixiy</option>
                    <option value="nature">Tabiat</option>
                    <option value="beach">Plyaj</option>
                    <option value="adventure">Sarguzasht</option>
                    <option value="culture">Madaniyat</option>
                    <option value="business">Biznes</option>
                    <option value="family">Oilaviy</option>
                    <option value="luxury">Hashamatli</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tur Nomi *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Samarkand Heritage Tour"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Tur haqida qisqa ma'lumot..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Davomiyligi</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.duration}
                  onChange={e => setForm({...form, duration: e.target.value})}
                  placeholder="3 kun"
                />
              </div>

              {form.type === 'domestic' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.destination}
                    onChange={e => setForm({...form, destination: e.target.value})}
                    placeholder="Samarqand"
                  />
                </div>
              )}

              {form.type === 'international' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mamlakat *</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.country}
                      onChange={e => setForm({...form, country: e.target.value})}
                    >
                      <option value="">Mamlakat tanlang...</option>
                      <option value="USA">🇺🇸 AQSH (USA)</option>
                      <option value="UAE">🇦🇪 BAA (Dubai)</option>
                      <option value="UK">🇬🇧 Buyuk Britaniya</option>
                      <option value="Egypt">🇪🇬 Misr</option>
                      <option value="Indonesia">🇮🇩 Indoneziya (Bali)</option>
                      <option value="Spain">🇪🇸 Ispaniya</option>
                      <option value="Italy">🇮🇹 Italiya</option>
                      <option value="Maldives">🇲🇻 Maldiv orollari</option>
                      <option value="Malaysia">🇲🇾 Malayziya</option>
                      <option value="Germany">🇩🇪 Germaniya</option>
                      <option value="Thailand">🇹🇭 Tailand</option>
                      <option value="Turkey">🇹🇷 Turkiya</option>
                      <option value="France">🇫🇷 Fransiya</option>
                      <option value="South Korea">🇰🇷 Janubiy Koreya</option>
                      <option value="Japan">🇯🇵 Yaponiya</option>
                      <option value="Greece">🇬🇷 Gretsiya</option>
                      <option value="Switzerland">🇨🇭 Shveytsariya</option>
                      <option value="China">🇨🇳 Xitoy</option>
                      <option value="India">🇮🇳 Hindiston</option>
                      <option value="Saudi Arabia">🇸🇦 Saudiya Arabistoni</option>
                      <option value="Qatar">🇶🇦 Qatar</option>
                      <option value="Kazakhstan">🇰🇿 Qozog'iston</option>
                      <option value="Kyrgyzstan">🇰🇬 Qirg'iziston</option>
                      <option value="Tajikistan">🇹🇯 Tojikiston</option>
                      <option value="Azerbaijan">🇦🇿 Ozarbayjon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
                    <input
                      disabled={!form.country}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={form.destination}
                      onChange={e => setForm({...form, destination: e.target.value})}
                      placeholder={form.country ? "Parij" : "Avval mamlakat tanlang"}
                    />
                    {!form.country && (
                      <p className="text-xs text-amber-600 mt-1">Manzilni kiritish uchun avval mamlakatni tanlang.</p>
                    )}
                  </div>
                </div>
              )}

              {form.type === 'combo' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mamlakat 1 *</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.country1}
                        onChange={e => setForm({...form, country1: e.target.value})}
                        placeholder="O'zbekiston"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mamlakat 2 *</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.country2}
                        onChange={e => setForm({...form, country2: e.target.value})}
                        placeholder="O'zbekiston"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manzil 1 *</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.destination1}
                        onChange={e => setForm({...form, destination1: e.target.value})}
                        placeholder="Samarqand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manzil 2 *</label>
                      <input
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.destination2}
                        onChange={e => setForm({...form, destination2: e.target.value})}
                        placeholder="Buxoro"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Narx *</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    placeholder={form.price_currency === 'USD' ? '250' : '3000000'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valyuta</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.price_currency}
                    onChange={e => setForm({...form, price_currency: e.target.value})}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="UZS">UZS (so'm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mehmonxona</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.hotel}
                  onChange={e => setForm({...form, hotel: e.target.value})}
                  placeholder="Hotel Samarkand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rasm URL</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.image}
                  onChange={e => setForm({...form, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nimalar kiradi (vergul bilan)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.included}
                  onChange={e => setForm({...form, included: e.target.value})}
                  placeholder="Hotel, Nonushta, Gid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qiziqishlar (vergul bilan)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.interests}
                  onChange={e => setForm({...form, interests: e.target.value})}
                  placeholder="History, Culture, Architecture"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flight"
                  checked={form.flight_included}
                  onChange={e => setForm({...form, flight_included: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="flight" className="text-sm text-gray-700">Aviachipta kiradi</label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Bekor qilish</button>
              <button
                onClick={save}
                disabled={saving || !form.title}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : editPkg ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}