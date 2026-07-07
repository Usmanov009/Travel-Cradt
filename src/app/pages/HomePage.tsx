import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { motion } from "motion/react";
import { usePackages } from "../hooks/usePackages";
import {
  MapPin, Plane, Globe2, Mountain, Building2, Palmtree,
  Sparkles, ShieldCheck, Headphones, BadgeDollarSign,
  Star, Users, Flag, Compass, Home, Car,
} from "lucide-react";
import type { TravelPackage } from "../data/packages";
import { getAppLang } from "../utils/locale";
import { getCategoryImage, PACKAGE_MEDIA } from "../data/packageMedia";
import { PackageImage } from "../components/PackageImage";
import { COMBO_TOURS } from "../data/comboTours";
import { ComboTourCard } from "../components/ComboTourCard";

const HERO_DOMESTIC_IMAGE = PACKAGE_MEDIA["domestic-1"].cover;
const HERO_INTERNATIONAL_IMAGE = PACKAGE_MEDIA["international-2"].cover;
const HERO_COMBO_IMAGE = COMBO_TOURS[0].images[0];
const HERO_RENTAL_IMAGE =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&q=80&auto=format";

export function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = getAppLang(i18n.language);

  const { packages: domesticAll } = usePackages("domestic");
  const { packages: internationalAll } = usePackages("international");
  const popularDomestic = domesticAll.slice(0, 4);
  const popularInternational = internationalAll.slice(0, 4);

  const getLocalTitle = (pkg: TravelPackage) =>
    pkg.translations?.[lang]?.title || pkg.title;
  const getLocalVibe = (pkg: TravelPackage) =>
    pkg.translations?.[lang]?.vibe || pkg.vibe || "";

  return (
    <div>
      <section className="relative min-h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#06B6D4] to-[#1E3A8A]">
          <div className="absolute inset-0 bg-black/30"></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 md:py-24 min-h-[100dvh] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white mb-8 md:mb-16"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-normal sm:leading-snug md:leading-tight [text-shadow:0_2px_16px_rgba(0,0,0,0.35)]">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mt-3 sm:mt-4 leading-relaxed [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
              {t("hero.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
            {/* ── Combo tours banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="group"
            >
              <Link
                to="/combo-tours"
                className="relative flex min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-[#F59E0B]/40 transition-all duration-500"
              >
                <div className="absolute inset-0 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <PackageImage
                    src={HERO_COMBO_IMAGE}
                    alt="Combo turlar"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#F59E0B]/75 via-[#D97706]/80 to-slate-900/95" />
                </div>
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/30">
                    <Sparkles className="w-3 h-3" /> Premium
                  </span>
                </div>
                <div className="relative z-10 p-4 sm:p-6 md:p-9 text-white">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{COMBO_TOURS.length} ta tur</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>2 mamlakat</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300 text-yellow-300" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-snug">
                    Combo Tours
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-100 mb-3 sm:mb-5 line-clamp-2 max-w-xs">
                    {t("hero.comboDesc")}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all w-fit">
                    Ko'rish
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* ── Rentals banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="group"
            >
              <Link
                to="/menu"
                className="relative flex min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-[#06B6D4]/40 transition-all duration-500"
              >
                <div className="absolute inset-0 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <PackageImage
                    src={HERO_RENTAL_IMAGE}
                    alt="Ijaralar"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#06B6D4]/75 via-[#0891B2]/80 to-slate-900/95" />
                </div>
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/30">
                    <Home className="w-3 h-3" /> Ijara
                  </span>
                </div>
                <div className="relative z-10 p-4 sm:p-6 md:p-9 text-white">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Uy ijarasi</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Mashina</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300 text-yellow-300" />
                      <span>4.8</span>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-snug">
                    Ijara menusi
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 mb-3 sm:mb-5 line-clamp-2 max-w-xs">
                    {t("hero.rentalsDesc")}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-[#06B6D4] px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all w-fit">
                    Ko'rish
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* ── Domestic banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="group"
            >
              <Link
                to="/domestic-travel"
                className="relative flex min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-[#1E3A8A]/40 transition-all duration-500"
              >
                {/* Background photo + gradient overlay */}
                <div className="absolute inset-0 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <PackageImage
                    src={HERO_DOMESTIC_IMAGE}
                    alt="O'zbekiston ichki sayohat"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A]/75 via-[#1E40AF]/80 to-slate-900/95" />
                </div>
                {/* Top badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/30">
                    <MapPin className="w-3 h-3" /> O'zbekiston
                  </span>
                </div>
                {/* Content */}
                <div className="relative z-10 p-4 sm:p-6 md:p-9 text-white">
                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Mountain className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>13 ta tur</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Tarixiy</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300 text-yellow-300" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-snug">
                    {t("hero.domestic")}
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 mb-3 sm:mb-5 line-clamp-2 max-w-xs">
                    {t("hero.domesticDesc")}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all w-fit">
                    Ko'rish
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* ── International banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="group"
            >
              <Link
                to="/international-travel"
                className="relative flex min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-[#06B6D4]/40 transition-all duration-500"
              >
                {/* Background photo + gradient overlay */}
                <div className="absolute inset-0 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <PackageImage
                    src={HERO_INTERNATIONAL_IMAGE}
                    alt="Xalqaro sayohat"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#06B6D4]/70 via-[#0891B2]/80 to-slate-900/95" />
                </div>
                {/* Top badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/30">
                    <Globe2 className="w-3 h-3" /> 15+ mamlakat
                  </span>
                </div>
                {/* Content */}
                <div className="relative z-10 p-4 sm:p-6 md:p-9 text-white">
                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>12 ta tur</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Palmtree className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Luxury</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 text-xs">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-300 text-yellow-300" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-snug">
                    {t("hero.international")}
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100 mb-3 sm:mb-5 line-clamp-2 max-w-xs">
                    {t("hero.internationalDesc")}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white text-[#06B6D4] px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm group-hover:gap-3 transition-all w-fit">
                    Ko'rish
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce hidden sm:flex">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Domestic ── */}
      <section className="py-12 md:py-20 bg-[#F5F5F4]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] bg-clip-text text-transparent">
            {t("popular.domestic")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {popularDomestic.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              >
                <Link to={`/package/${pkg.type}/${pkg.id}`} className="block relative">
                  <div className="aspect-[3/4] overflow-hidden">
                    <PackageImage
                      src={pkg.image}
                      alt={getLocalTitle(pkg)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 pointer-events-none text-white">
                    <h3 className="text-xs sm:text-lg md:text-2xl font-bold text-white line-clamp-2 leading-relaxed">{getLocalTitle(pkg)}</h3>
                    <p className="text-xs text-white/80 mt-1 line-clamp-1 hidden sm:block leading-relaxed">{getLocalVibe(pkg)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="py-10 md:py-16 bg-[#F5F5F4] border-b border-[#1E3A8A]/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: <Compass className="w-7 h-7 md:w-9 md:h-9" />, value: "100+", label: t("stats.destinations"), color: "from-[#06B6D4] to-[#1E3A8A]" },
              { icon: <Users className="w-7 h-7 md:w-9 md:h-9" />, value: "5 000+", label: t("stats.travelers"), color: "from-[#1E3A8A] to-[#06B6D4]" },
              { icon: <Flag className="w-7 h-7 md:w-9 md:h-9" />, value: "15+", label: t("stats.countries"), color: "from-[#F59E0B] to-[#D97706]" },
              { icon: <Star className="w-7 h-7 md:w-9 md:h-9" />, value: "4.9★", label: t("stats.rating"), color: "from-[#06B6D4] to-[#0891B2]" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center bg-white rounded-2xl p-5 md:p-7 border border-[#1E3A8A]/10 hover:shadow-lg transition-shadow"
              >
                <div className={`bg-gradient-to-br ${stat.color} text-white rounded-xl p-2.5 md:p-3 mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A]">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[#6B7280] mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories Grid ── */}
      <section className="py-12 md:py-16 bg-[#F5F5F4]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-[#1E3A8A]"
          >
            {t("categories.title")}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {[
              { to: "/domestic-travel?cat=historical", cat: "historical", icon: "🏛️", label: t("categories.historical"), bg: "from-[#F59E0B] to-[#D97706]" },
              { to: "/domestic-travel?cat=nature", cat: "nature", icon: "🌿", label: t("categories.nature"), bg: "from-[#06B6D4] to-[#0891B2]" },
              { to: "/domestic-travel?cat=pilgrimage", cat: "pilgrimage", icon: "🕌", label: t("categories.pilgrimage"), bg: "from-[#1E3A8A] to-[#1E40AF]" },
              { to: "/domestic-travel?cat=family", cat: "family", icon: "👨‍👩‍👧‍👦", label: t("categories.family"), bg: "from-[#06B6D4] to-[#1E3A8A]" },
              { to: "/domestic-travel?cat=adventure", cat: "adventure", icon: "⛺", label: t("categories.adventure"), bg: "from-[#1E3A8A] to-[#06B6D4]" },
              { to: "/international-travel?cat=beach", cat: "beach", icon: "🏖️", label: t("categories.beach"), bg: "from-[#F59E0B] to-[#06B6D4]" },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={cat.to}
                  className="group relative flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 bg-white rounded-2xl border border-[#1E3A8A]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {getCategoryImage(cat.cat) && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PackageImage
                        src={getCategoryImage(cat.cat)!}
                        alt={cat.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  )}
                  <div className={`relative z-10 bg-gradient-to-br ${cat.bg} w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <span className="relative z-10 text-xs sm:text-sm font-semibold text-[#1E3A8A] text-center leading-tight group-hover:text-white transition-colors">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Combo Tours (eksklyuziv) ── */}
      <section className="py-14 md:py-20 bg-[#F5F5F4] relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/10 backdrop-blur-md border border-[#1E3A8A]/20 text-[#F59E0B] px-3 py-1 rounded-full mb-3 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                TripCraft eksklyuziv
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A]">
                ✨ Combo Tours
              </h2>
              <p className="text-[#6B7280] mt-2 max-w-xl text-sm sm:text-base">
                Bitta safarda ikkita davlat — oldindan tayyorlangan premium marshrutlar.
              </p>
            </div>
            <Link
              to="/combo-tours"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#F59E0B]/30 transition-all self-start sm:self-auto"
            >
              Barchasini ko'rish
              <Compass className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {COMBO_TOURS.slice(0, 3).map((tour) => (
              <ComboTourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why TravelCraft AI ── */}
      <section className="py-12 md:py-20 bg-[#F5F5F4]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-[#1E3A8A]"
          >
            {t("features.title")}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {[
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: t("features.ai"),
                desc: t("features.aiDesc"),
                gradient: "from-[#06B6D4] to-[#1E3A8A]",
                bg: "bg-[#E5E7EB]",
              },
              {
                icon: <BadgeDollarSign className="w-7 h-7" />,
                title: t("features.price"),
                desc: t("features.priceDesc"),
                gradient: "from-[#F59E0B] to-[#D97706]",
                bg: "bg-[#FEF3C7]",
              },
              {
                icon: <Headphones className="w-7 h-7" />,
                title: t("features.support"),
                desc: t("features.supportDesc"),
                gradient: "from-[#1E3A8A] to-[#06B6D4]",
                bg: "bg-[#DBEAFE]",
              },
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                title: t("features.secure"),
                desc: t("features.secureDesc"),
                gradient: "from-[#06B6D4] to-[#0891B2]",
                bg: "bg-[#E0F2FE]",
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${feat.bg} rounded-2xl p-6 md:p-7 border border-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`bg-gradient-to-br ${feat.gradient} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1E3A8A] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular International ── */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#F5F5F4] to-[#E5E7EB]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12 bg-gradient-to-r from-[#06B6D4] to-[#1E3A8A] bg-clip-text text-transparent">
            {t("popular.international")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {popularInternational.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all"
              >
                <Link to={`/package/${pkg.type}/${pkg.id}`} className="block relative">
                  <div className="aspect-[3/4] overflow-hidden">
                    <PackageImage
                      src={pkg.image}
                      alt={getLocalTitle(pkg)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 pointer-events-none text-white">
                    <h3 className="text-xs sm:text-lg md:text-2xl font-bold text-white line-clamp-2 leading-relaxed">{getLocalTitle(pkg)}</h3>
                    <p className="text-xs text-white/80 mt-1 line-clamp-1 hidden sm:block leading-relaxed">{getLocalVibe(pkg)}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-14 md:py-24 bg-gradient-to-br from-[#1E3A8A] via-[#06B6D4] to-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              AI-powered
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {t("cta.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 md:mb-10">
              {t("cta.desc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/custom-package"
                className="group inline-flex items-center gap-2 bg-[#F59E0B] text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                <Sparkles className="w-5 h-5" />
                {t("cta.button")}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/domestic-travel"
                className="inline-flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                <MapPin className="w-5 h-5" />
                {t("nav.domestic")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
