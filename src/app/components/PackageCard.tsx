import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Star, Clock, Heart, Share2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { getAppLang } from "../utils/locale";
import { formatDateRange } from "../utils/bookingDates";
import { PackageImage } from "./PackageImage";
import { CompanyInfoModal } from "./CompanyInfoModal";

interface PackageCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  price: number;
  priceCurrency?: string;
  rating: number;
  included: string[];
  type?: "domestic" | "international";
  country?: string;
  hotel?: string;
  flightIncluded?: boolean;
  companyId?: number;
  companyName?: string;
  translations?: {
    uz?: { title?: string; description?: string; duration?: string };
    ru?: { title?: string; description?: string; duration?: string };
  };
}

export function PackageCard({
  id,
  title,
  description,
  image,
  duration,
  startDate,
  endDate,
  price,
  priceCurrency,
  rating,
  included,
  type = "domestic",
  country,
  hotel,
  flightIncluded,
  companyId,
  companyName,
  translations,
}: PackageCardProps) {
  const { t, i18n } = useTranslation();
  const lang = getAppLang(i18n.language);
  const localTitle = translations?.[lang]?.title || title;
  const localDescription = translations?.[lang]?.description || description;
  const localDuration = translations?.[lang]?.duration || duration;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const navigate = useNavigate();

  return (
    <>
    <motion.div
      onClick={() => navigate(`/package/${type}/${id}`)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[16/10]">
        <PackageImage
          src={image}
          alt={localTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-slate-700"
              }`}
            />
          </button>
          <button
            onClick={(event) => event.stopPropagation()}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-5 h-5 text-slate-700" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-slate-900">{rating}</span>
          </div>
        </div>
        {companyName && (
          <div className="absolute top-4 left-4">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowCompanyModal(true);
              }}
              className="bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {companyName}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        {country && (
          <div className="text-xs sm:text-sm text-purple-600 font-semibold mb-1.5 sm:mb-2">
            {country}
          </div>
        )}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-1.5 sm:mb-2 line-clamp-2">{localTitle}</h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {localDescription}
        </p>

        {hotel && (
          <div className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">
            <span className="font-semibold text-slate-700">Hotel:</span> {hotel}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{localDuration}</span>
          </div>
          {startDate && endDate && (
            <span className="text-slate-400">
              {formatDateRange(startDate, endDate)}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            type === 'domestic' ? 'bg-green-100 text-green-700' :
            type === 'international' ? 'bg-blue-100 text-blue-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {type === 'domestic' ? "Ichki" : type === 'international' ? "Xalqaro" : "Combo"}
          </span>
          {flightIncluded && (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">{t("package.flightIncluded")}</span>
              <span className="sm:hidden">✈️</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-3 sm:pt-4 mb-3 sm:mb-4">
          <div className="text-xs text-slate-400 mb-1.5 sm:mb-2">
            {t("package.included")}:
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {included.slice(0, 3).map((item, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 sm:py-1 rounded-full border border-slate-200"
              >
                {item}
              </span>
            ))}
            {included.length > 3 && (
              <span className="text-xs text-slate-400">
                +{included.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400">
              {t("package.from")}
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
              {priceCurrency === 'UZS' ? `${price.toLocaleString()} so'm` : `$${price.toLocaleString()}`}
            </div>
          </div>
          <span className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all whitespace-nowrap shrink-0">
            {t("package.viewDetails")}
          </span>
        </div>
      </div>
    </motion.div>
    {companyId && (
      <CompanyInfoModal
        companyId={companyId}
        open={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
      />
    )}
    </>
  );
}
