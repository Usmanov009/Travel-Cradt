import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

type PlaceData = {
  lat: number;
  lng: number;
  displayName: string;
  source?: string;
};

type Props = {
  query: string;
  title?: string;
  subtitle?: string;
};

export function DestinationMap({ query, title, subtitle }: Props) {
  const [place, setPlace] = useState<PlaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<"google" | "yandex">("yandex");

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setPlace(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/places/geocode?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setPlace(null);
        } else {
          setPlace(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Xarita ma'lumotini yuklab bo'lmadi");
          setPlace(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (!query.trim()) return null;

  const googleSrc = place
    ? `https://www.google.com/maps?q=${place.lat},${place.lng}&z=12&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  const yandexSrc = place
    ? `https://yandex.com/map-widget/v1/?ll=${place.lng}%2C${place.lat}&z=12&pt=${place.lng}%2C${place.lat}&l=map`
    : `https://yandex.com/map-widget/v1/?text=${encodeURIComponent(query)}&z=11&l=map`;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.25)]">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          {title && <h3 className="font-semibold text-lg text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-sky-600">{subtitle}</p>}
          {place && (
            <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {place.displayName}
            </p>
          )}
        </div>
        <div className="flex rounded-xl border border-slate-200 p-0.5 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setProvider("yandex")}
            className={`px-3 py-1.5 rounded-lg transition ${
              provider === "yandex" ? "bg-red-500 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Yandex
          </button>
          <button
            type="button"
            onClick={() => setProvider("google")}
            className={`px-3 py-1.5 rounded-lg transition ${
              provider === "google" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Google
          </button>
        </div>
      </div>

      {loading && (
        <div className="aspect-[16/9] rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Xarita yuklanmoqda...
        </div>
      )}

      {!loading && (
        <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200">
          <iframe
            title={provider === "yandex" ? "Yandex Maps" : "Google Maps"}
            src={provider === "yandex" ? yandexSrc : googleSrc}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-amber-600 mt-2">{error} — qidiruv bo'yicha xarita ko'rsatilmoqda.</p>
      )}
    </div>
  );
}
