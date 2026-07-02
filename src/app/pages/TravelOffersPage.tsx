import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Phone, MapPin, Building2 } from "lucide-react";
import { PackageImage } from "../components/PackageImage";
import { CompanyInfoModal } from "../components/CompanyInfoModal";
import { useCompanies } from "../hooks/useCompanies";
import { SAMPLE_TRAVEL_OFFERS } from "../data/sampleListings";

interface TravelOffer {
  id: number;
  type: "flight" | "hotel";
  title: string;
  image?: string;
  description?: string;
  phone?: string;
  location?: string;
  companyId?: number | null;
  companyName?: string;
}

export function TravelOffersPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const [offers, setOffers] = useState<TravelOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "flight" | "hotel">("all");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/travel-offers")
      .then((r) => r.json())
      .then((data) => setOffers(data.offers || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  // Show example listings until the admin panel has real entries.
  const displayOffers: TravelOffer[] =
    offers.length > 0
      ? offers
      : SAMPLE_TRAVEL_OFFERS.map((item, i) => {
          const company = companies.length > 0 ? companies[i % companies.length] : undefined;
          return { ...item, companyId: company?.id ?? null, companyName: company?.name };
        });

  const filtered = displayOffers.filter((o) => filter === "all" || o.type === filter);

  const tabs: { id: "all" | "flight" | "hotel"; label: string }[] = [
    { id: "all", label: t("travelOffers.all") },
    { id: "flight", label: t("travelOffers.flights") },
    { id: "hotel", label: t("travelOffers.hotels") },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Plane className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("travelOffers.title")}</h1>
          </div>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl">{t("travelOffers.desc")}</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-slate-400 py-16">{t("travelOffers.empty")}</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                {offer.image && (
                  <PackageImage src={offer.image} alt={offer.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${
                      offer.type === "flight" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {offer.type === "flight" ? t("travelOffers.flights") : t("travelOffers.hotels")}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-1">{offer.title}</h3>
                  {offer.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {offer.location}
                    </div>
                  )}
                  {offer.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-3">{offer.description}</p>
                  )}
                  {offer.companyName && (
                    <button
                      onClick={() => setSelectedCompanyId(offer.companyId ?? null)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline mb-3"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" /> {offer.companyName}
                    </button>
                  )}
                  {offer.phone && (
                    <a
                      href={`tel:${offer.phone}`}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                    >
                      <Phone className="w-4 h-4" /> {offer.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CompanyInfoModal
        companyId={selectedCompanyId}
        open={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
}
