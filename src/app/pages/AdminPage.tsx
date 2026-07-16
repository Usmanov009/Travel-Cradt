import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface EnrichData {
  wikipedia: { title: string; description: string; image: string | null; url: string } | null;
  unesco: { sites: { name: string; description: string; image: string | null }[]; url: string; count: number } | null;
}

export function AdminPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", type: "domestic", price: "", price_currency: "USD", description: "", image: "", country: "" });
  const [enrich, setEnrich] = useState<EnrichData | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState("");

  const api = (path: string) => `/api${path}`;

  const fetchData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([fetch(api('/packages')), fetch(api('/bookings'))]);
      const [pJson, bJson] = await Promise.all([pRes.json(), bRes.json()]);
      setPackages(pJson);
      setBookings(bJson);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchEnrich = async () => {
    if (!form.country.trim()) return;
    setEnrichLoading(true);
    setEnrichError("");
    setEnrich(null);
    try {
      const res = await fetch(api(`/enrich?country=${encodeURIComponent(form.country)}`));
      const data: EnrichData = await res.json();
      setEnrich(data);
      if (data.wikipedia) {
        setForm(f => ({
          ...f,
          description: f.description || data.wikipedia!.description.slice(0, 400),
          image: f.image || data.wikipedia!.image || f.image,
        }));
      }
    } catch {
      setEnrichError("Ma'lumot yuklanmadi. Qaytadan urinib ko'ring.");
    } finally {
      setEnrichLoading(false);
    }
  };

  const createPackage = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch(api('/packages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
          body: JSON.stringify({
            title: form.title,
            type: form.type,
            price: Number(form.price || 0),
            price_currency: form.price_currency || 'USD',
            description: form.description,
            image: form.image,
            country: form.country,
          }),
=======
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          price: Number(form.price || 0),
          price_currency: form.price_currency || 'USD',
          description: form.description,
          image: form.image,
          country: form.country,
        }),
>>>>>>> 24a26569d198a1ee71ae2a381175503046b09243
      });
      if (res.ok) {
        setForm({ title: '', type: 'domestic', price: '', price_currency: 'USD', description: '', image: '', country: '' });
        setEnrich(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const updateBooking = async (id: string, status: string) => {
    try {
      await fetch(api(`/bookings/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Packages & Bookings</h2>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <form onSubmit={createPackage} className="p-6 bg-white rounded-xl shadow space-y-3">
          <h3 className="font-semibold text-lg">Create package</h3>

          <input
            className="w-full p-3 border rounded"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <select
            className="w-full p-3 border rounded"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
<<<<<<< HEAD
             <option value="combo">Combo</option>
=======
            <option value="combo">Combo</option>
>>>>>>> 24a26569d198a1ee71ae2a381175503046b09243
          </select>

          <div className="flex gap-2">
            <input
              className="flex-1 p-3 border rounded"
              placeholder={form.price_currency === 'USD' ? 'Price (250)' : 'Narx (3000000)'}
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
            <select
              className="p-3 border rounded bg-white"
              value={form.price_currency}
              onChange={e => setForm({ ...form, price_currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="UZS">UZS (so'm)</option>
            </select>
          </div>

          {/* Country + AI fetch */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 p-3 border rounded"
              placeholder="Country / city (e.g. Turkey, Samarkand)"
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), fetchEnrich())}
            />
            <button
              type="button"
              onClick={fetchEnrich}
              disabled={enrichLoading || !form.country.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 whitespace-nowrap"
            >
              {enrichLoading ? '⏳ ...' : '🔍 Fetch Info'}
            </button>
          </div>

          {enrichError && <p className="text-red-500 text-sm">{enrichError}</p>}

          {/* Wikipedia result */}
          {enrich?.wikipedia && (
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-800">📖 Wikipedia</span>
                <a href={enrich.wikipedia.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline">
                  {enrich.wikipedia.url}
                </a>
              </div>
              {enrich.wikipedia.image && (
                <img src={enrich.wikipedia.image} alt={enrich.wikipedia.title}
                  className="w-full h-32 object-cover rounded" />
              )}
              <p className="text-sm text-slate-700 line-clamp-3">{enrich.wikipedia.description}</p>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => setForm(f => ({ ...f, description: enrich.wikipedia!.description.slice(0, 400) }))}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                  Tavsifga qo'shish
                </button>
                {enrich.wikipedia.image && (
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, image: enrich.wikipedia!.image! }))}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                    Rasmni qo'shish
                  </button>
                )}
              </div>
            </div>
          )}

          {/* UNESCO result */}
          {enrich?.unesco && enrich.unesco.sites.length > 0 && (
            <div className="border border-amber-200 rounded-lg p-3 bg-amber-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-800">🏛 UNESCO ({enrich.unesco.count} joy)</span>
                <a href={enrich.unesco.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-amber-700 underline">
                  whc.unesco.org
                </a>
              </div>
              {enrich.unesco.sites.map((site, i) => (
                <div key={i} className="flex gap-2 items-start border-t border-amber-200 pt-2">
                  {site.image && (
                    <img src={site.image} alt={site.name}
                      className="w-16 h-12 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-amber-900">{site.name}</div>
                    <p className="text-xs text-slate-600 line-clamp-2">{site.description}</p>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, description: site.description.slice(0, 400), image: site.image || f.image }))}
                      className="text-xs mt-1 px-2 py-0.5 bg-amber-600 text-white rounded">
                      Bu joyni ishlatish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            className="w-full p-3 border rounded"
            placeholder="Image URL"
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
          />
          {form.image && (
            <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded" />
          )}

          <textarea
            className="w-full p-3 border rounded"
            rows={3}
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          <button className="w-full py-2 bg-blue-600 text-white rounded font-semibold" type="submit">
            Create Package
          </button>
        </form>

        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="font-semibold mb-4">Recent packages</h3>
          <div className="space-y-3">
            {packages.map((p) => (
              <div key={p.id} className="p-3 border rounded flex items-center gap-3">
                <ImageWithFallback src={p.image || 'https://via.placeholder.com/80'} alt={p.title} className="w-20 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-slate-500">{p.type} — {p.price_currency === 'UZS' ? `${Number(p.price).toLocaleString()} so'm` : `$${Number(p.price).toLocaleString()}`}</div>
                  {p.country && <div className="text-xs text-slate-400">{p.country}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl shadow">
        <h3 className="font-semibold mb-4">Bookings</h3>
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{b.title} — {b.name}</div>
                <div className="text-sm text-slate-500 break-all">{b.phone} • {b.guests} guests • {b.booked_at ? new Date(b.booked_at).toLocaleString() : "—"}</div>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${b.status === 'accepted' ? 'bg-green-100 text-green-700' : b.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => updateBooking(b.id, 'accepted')} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-600 text-white rounded text-sm">Accept</button>
                <button onClick={() => updateBooking(b.id, 'rejected')} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 text-white rounded text-sm">Reject</button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
