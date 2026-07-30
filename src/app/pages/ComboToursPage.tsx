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
      <div className="relative bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#F59E0B] text-white py-14 md:py-20 overflow-hidden">
        <div className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 rounded-full bg-[#F59E0B]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-[#06B6D4]/10 blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-[#F59E0B] px-4 py-1.5 rounded-full mb-4 text-sm font-semibold">
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
          <LayoutGrid className="w-4 h-4 text-[#6B7280]" />
          <span className="text-sm text-[#6B7280]">Kategoriya bo'yicha filtrlash</span>
        </div>
        <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 sm:px-5 py-2 rounded-full whitespace-nowrap transition-all text-xs sm:text-sm font-semibold ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg"
                : "bg-[#F5F5F4] text-[#1E3A8A] hover:bg-[#E5E7EB] border border-[#1E3A8A]/10"
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
                  ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-lg"
                  : "bg-[#F5F5F4] text-[#1E3A8A] hover:bg-[#E5E7EB] border border-[#1E3A8A]/10"
              }`}
            >
              {COMBO_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <p className="text-sm text-[#6B7280] mb-4">
          <span className="font-semibold text-[#1E3A8A]">{filteredTours.length}</span> ta Combo Tour topildi
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
