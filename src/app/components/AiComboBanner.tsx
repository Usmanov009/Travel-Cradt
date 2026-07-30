import { useNavigate } from "react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { PackageImage } from "./PackageImage";
import type { ComboRecommendation } from "../utils/comboTours";

interface AiComboBannerProps {
  recommendation: ComboRecommendation;
}

export function AiComboBanner({ recommendation }: AiComboBannerProps) {
  const navigate = useNavigate();
  const { tour, reason } = recommendation;

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-50 to-white shadow-sm hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-32 sm:h-auto relative shrink-0 flex">
          {tour.countries.slice(0, 2).map((c) => (
            <div key={c.name} className="w-1/2 h-full relative overflow-hidden">
              <PackageImage src={c.image} alt={c.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-2">
            <Sparkles className="w-4 h-4" />
            AI tavsiyasi — Combo Tour
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{reason}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-bold text-slate-900">${tour.price.toLocaleString()}</span>
            <span className="text-xs text-slate-400">{tour.duration} · {tour.countries.map((c) => c.flag).join(" ")}</span>
            <button
              onClick={() => navigate(`/combo-tours/${tour.slug}`)}
              className="ml-auto inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl hover:shadow-lg transition-all"
            >
              Ko'rish
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
