import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, Clock, MapPinned, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { PackageImage } from "./PackageImage";
import type { ComboTour } from "../data/comboTours";

interface ComboTourCardProps {
  tour: ComboTour;
}

export function ComboTourCard({ tour }: ComboTourCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-[1.75rem] overflow-hidden bg-slate-900 shadow-lg hover:shadow-2xl hover:shadow-amber-500/25 transition-shadow duration-500"
    >
      {/* Premium ribbon */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        Combo Tour
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
        {tour.rating}
      </div>

      {/* Split hero images */}
      <div
        onClick={() => navigate(`/combo-tours/${tour.slug}`)}
        className="relative aspect-[16/10] flex cursor-pointer"
      >
        {tour.countries.map((c, i) => (
          <div key={c.name} className={`relative h-full overflow-hidden ${i === 0 ? "w-1/2 border-r border-white/20" : "w-1/2"}`}>
            <PackageImage
              src={c.image}
              alt={c.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />
        {/* Flag badges over the seam */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5">
          {tour.countries.map((c, i) => (
            <span key={c.name} className="flex items-center gap-1 text-white text-sm font-semibold">
              {i > 0 && <span className="text-amber-300 mx-0.5">+</span>}
              <span className="text-lg leading-none">{c.flag}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-6 text-white bg-gradient-to-b from-slate-900 to-slate-950">
        <h3 className="text-lg sm:text-xl font-bold mb-1.5">{tour.title}</h3>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">{tour.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/70 mb-4">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
            <MapPinned className="w-3.5 h-3.5" />
            {tour.countries.length} davlat
          </div>
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
            <Clock className="w-3.5 h-3.5" />
            {tour.duration}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {tour.included.slice(0, 3).map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-white/80 text-xs px-2.5 py-1 rounded-full"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {item}
            </span>
          ))}
          {tour.included.length > 3 && (
            <span className="text-xs text-white/50 px-1 py-1">+{tour.included.length - 3}</span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-white/50">Narxi (1 kishi uchun)</div>
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              ${tour.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/combo-tours/${tour.slug}`)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            Batafsil ko'rish
          </button>
          <button
            onClick={() => navigate(`/combo-tours/${tour.slug}?book=1`)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-bold py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            Bron qilish
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
