import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Car, MapPin, Building2 } from "lucide-react";
import { PackageImage } from "../components/PackageImage";
import { CompanyInfoModal } from "../components/CompanyInfoModal";
import { useCompanies } from "../hooks/useCompanies";
import { SAMPLE_CAR_RENTALS } from "../data/sampleListings";

export function CarRentPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const listings = SAMPLE_CAR_RENTALS.map((item, i) => {
    const company = companies.length > 0 ? companies[i % companies.length] : undefined;
    return { ...item, companyId: company?.id ?? null, companyName: company?.name };
  });

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("carRent.title")}</h1>
          </div>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl">{t("carRent.desc")}</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
            >
              <PackageImage src={item.image} alt={item.title} className="w-full h-40 object-cover" />
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {item.location}
                </div>
                <p className="text-sm text-slate-500 mb-3 line-clamp-3">{item.description}</p>
                <p className="text-sm font-semibold text-blue-600 mb-3">
                  ${item.pricePerDay.toLocaleString()}{" "}
                  <span className="text-slate-400 font-normal">/ {t("carRent.perDay")}</span>
                </p>
                {item.companyName ? (
                  <button
                    onClick={() => setSelectedCompanyId(item.companyId)}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" /> {item.companyName}
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">{t("company.noInfo")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CompanyInfoModal
        companyId={selectedCompanyId}
        open={selectedCompanyId !== null}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
}
