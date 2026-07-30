import { useEffect, useState } from "react";
import type { TravelPackage, PackageType } from "../data/packages";
import { resolvePackageMedia } from "../data/packageMedia";

function toDateString(value: any): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mapDbPackage(pkg: any): TravelPackage {
  const localId = pkg.local_id ?? pkg.id;
  const media = resolvePackageMedia(pkg.type as PackageType, localId, pkg.image ?? "");
  return {
    id: pkg.id,
    type: pkg.type as PackageType,
    category: pkg.category || "",
    title: pkg.title,
    description: pkg.description || "",
    image: media.cover || pkg.image || "",
    images: media.gallery,
    duration: pkg.duration || "",
    startDate: toDateString(pkg.start_date),
    endDate: toDateString(pkg.end_date),
    price: parseFloat(pkg.price) || 0,
    priceCurrency: pkg.price_currency || "USD",
    rating: parseFloat(pkg.rating) || 0,
    included: pkg.included || [],
    country: pkg.country ?? undefined,
    hotel: pkg.hotel ?? undefined,
    flightIncluded: pkg.flight_included ?? false,
    vibe: pkg.vibe ?? undefined,
    video: pkg.video ?? undefined,
    interests: pkg.interests ?? undefined,
    partners: pkg.partners ?? undefined,
    companyId: pkg.company_id ?? undefined,
    companyName: pkg.company_name ?? undefined,
    companyLogo: pkg.company_logo ?? undefined,
    translations: pkg.translations ?? undefined,
  };
}

export function usePackages(type?: PackageType) {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = type ? `/api/packages?type=${type}` : "/api/packages";
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Server xatosi");
        return r.json();
      })
      .then((data: any[]) => {
        setPackages(data.map(mapDbPackage));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);

  return { packages, loading, error };
}
