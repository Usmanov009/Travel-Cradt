import React, { useContext, useEffect, useState } from 'react';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import { adminFetch } from '../../services/adminApi';

const emptyForm = {
  type: 'flight', title: '', image: '', description: '', phone: '', location: '',
};

export default function AdminTravelOffers() {
  const { token } = useContext(AdminAuthContext);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editOffer, setEditOffer] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    adminFetch('/travel-offers', token)
      .then(r => r.json())
      .then(d => setOffers(d.offers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setEditOffer(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (offer: any) => {
    setEditOffer(offer);
    setForm({
      type: offer.type || 'flight',
      title: offer.title || '',
      image: offer.image || '',
      description: offer.description || '',
      phone: offer.phone || '',
      location: offer.location || '',
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const path = editOffer ? `/travel-offers/${editOffer.id}` : '/travel-offers';
      const method = editOffer ? 'PUT' : 'POST';
      const res = await adminFetch(path, token!, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Saqlashda xatolik');
      setShowForm(false);
      load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteOffer = async (id: number) => {
    try {
      await adminFetch(`/travel-offers/${id}`, token!, { method: 'DELETE' });
      setDeleteId(null);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Aviachiptalar va Mehmonxonalar</h1>
          <p className="text-gray-500 text-sm mt-1">{offers.length} ta taklif mavjud</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Yangi Taklif Qo'shish
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Yuklanmoqda...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Nomi</th>
                <th className="px-4 py-3">Turi</th>
                <th className="px-4 py-3">Manzil</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{offer.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.type === 'flight' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {offer.type === 'flight' ? 'Aviachipta' : 'Mehmonxona'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{offer.location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{offer.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(offer)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => setDeleteId(offer.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Takliflar topilmadi</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-gray-500 text-sm mb-4">Bu taklifni o'chirib tashlaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Bekor qilish</button>
              <button onClick={() => deleteOffer(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">O'chirish</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editOffer ? 'Taklifni Tahrirlash' : 'Yangi Taklif Qo\'shish'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turi *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="flight">Aviachipta</option>
                  <option value="hotel">Mehmonxona</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Toshkent — Istanbul aviachiptalari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Taklif haqida qisqa ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="Istanbul, Turkiya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon raqami *</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rasm URL</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Bekor qilish</button>
              <button
                onClick={save}
                disabled={saving || !form.title}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saqlanmoqda...' : editOffer ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
