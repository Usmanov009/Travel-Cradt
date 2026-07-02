import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { CompanyInfoModal } from "../components/CompanyInfoModal";

interface CompanySummary {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
  description?: string;
}

export function CompaniesListPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("company.listTitle")}</h1>
          </div>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl">{t("company.listDesc")}</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {!loading && companies.length === 0 && (
          <p className="text-center text-slate-400 py-16">{t("company.empty")}</p>
        )}

        {!loading && companies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setSelectedId(company.id)}
                className="text-left bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-blue-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{company.name}</h3>
                    {company.address && (
                      <p className="text-xs text-slate-400 truncate">{company.address}</p>
                    )}
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{company.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <CompanyInfoModal companyId={selectedId} open={selectedId !== null} onClose={() => setSelectedId(null)} />
    </div>
  );
}
