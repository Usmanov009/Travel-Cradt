import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, MapPin, Globe, Building2 } from "lucide-react";
import { PackageImage } from "./PackageImage";

interface CompanyPackage {
  id: number;
  type: "domestic" | "international";
  title: string;
  image: string;
  price: number;
}

interface CompanyDetails {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  website?: string;
  description?: string;
  logo?: string;
  packages: CompanyPackage[];
}

interface Props {
  companyId: number | null;
  open: boolean;
  onClose: () => void;
}

export function CompanyInfoModal({ companyId, open, onClose }: Props) {
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !companyId) return;
    setLoading(true);
    setCompany(null);
    fetch(`/api/companies/${companyId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCompany(data))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [open, companyId]);

  const goToPackage = (pkg: CompanyPackage) => {
    onClose();
    navigate(`/package/${pkg.type}/${pkg.id}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-white min-w-0">
                <Building2 className="w-5 h-5 shrink-0" />
                <span className="font-bold text-lg truncate">Tur Firma</span>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {loading && (
                <div className="flex justify-center gap-1 py-10">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                </div>
              )}

              {!loading && !company && (
                <p className="text-center text-slate-400 py-10">Firma haqida ma'lumot topilmadi.</p>
              )}

              {!loading && company && (
                <>
                  <div className="flex items-start gap-4 mb-5">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 leading-snug">{company.name}</h2>
                      {company.description && (
                        <p className="text-slate-500 text-sm mt-1">{company.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {company.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-blue-500 shrink-0" /> {company.phone}
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" /> {company.address}
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Globe className="w-4 h-4 shrink-0" /> {company.website}
                      </div>
                    )}
                  </div>

                  {company.packages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Bu firmaning boshqa paketlari
                      </h3>
                      <div className="space-y-2">
                        {company.packages.map((pkg) => (
                          <button
                            key={`${pkg.type}-${pkg.id}`}
                            onClick={() => goToPackage(pkg)}
                            className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 p-2.5 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                          >
                            <PackageImage src={pkg.image} alt={pkg.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 text-sm truncate">{pkg.title}</p>
                              <p className="text-xs text-slate-400">${pkg.price.toLocaleString()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
