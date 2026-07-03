import { useMemo, useState } from "react";
import { Sparkles, LayoutGrid } from "lucide-react";
import { COMBO_TOURS, COMBO_CATEGORY_LABELS, type ComboCategory } from "../data/comboTours";
import { ComboTourCard } from "../components/ComboTourCard";

const CATEGORY_ORDER: ComboCategory[] = [
  "europe",
  "asia",
  "middle-east",
  "america",
  "luxury",
  "family",
  "adventure",
  "honeymoon",
];

export function ComboToursPage() {
  const [activeCategory, setActiveCategory] = useState<ComboCategory | "all">("all");

  const filteredTours = useMemo(() => {
    if (activeCategory === "all") return COMBO_TOURS;
    return COMBO_TOURS.filter((tour) => tour.categories.includes(activeCategory));
  }, [activeCategory]);

  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white py-14 md:py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 px-4 py-1.5 rounded-full mb-4 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            TripCraft eksklyuziv
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            ✨ Combo Tours
          </h1>
          <p className="text-base sm:text-xl text-white/70 max-w-2xl leading-relaxed">
            Bitta safarda ikkita davlat. Oldindan tayyorlangan, eng foydali marshrutlar bo'yicha
            tanlangan premium combo paketlarimiz bilan tanishing.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">Kategoriya bo'yicha filtrlash</span>
        </div>
        <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 sm:px-5 py-2 rounded-full whitespace-nowrap transition-all text-xs sm:text-sm font-semibold ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            Barchasi
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 py-2 rounded-full whitespace-nowrap transition-all text-xs sm:text-sm font-semibold ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {COMBO_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-4">
          <span className="font-semibold text-slate-800">{filteredTours.length}</span> ta Combo Tour topildi
        </p>

        {filteredTours.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="text-5xl mb-4">🧭</div>
            <p className="text-slate-500 text-base sm:text-lg">
              Bu kategoriya bo'yicha Combo Tour topilmadi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredTours.map((tour) => (
              <ComboTourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
