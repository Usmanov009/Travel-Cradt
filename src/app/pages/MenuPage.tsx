import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Building2, Plane, CalendarCheck, ChevronRight, LayoutGrid, Home, Car, Sparkles } from "lucide-react";

export function MenuPage() {
  const { t } = useTranslation();

  const tiles = [
    {
      to: "/combo-tours",
      icon: Sparkles,
      title: "✨ Combo Tours",
      desc: "Bitta safarda ikkita davlat — tayyor premium marshrutlar",
      highlight: true,
    },
    {
      to: "/companies",
      icon: Building2,
      title: t("menu.companies"),
      desc: t("menu.companiesDesc"),
    },
    {
      to: "/house-rent",
      icon: Home,
      title: t("menu.houseRent"),
      desc: t("menu.houseRentDesc"),
    },
    {
      to: "/car-rent",
      icon: Car,
      title: t("menu.carRent"),
      desc: t("menu.carRentDesc"),
    },
    {
      to: "/travel-offers",
      icon: Plane,
      title: t("menu.travelOffers"),
      desc: t("menu.travelOffersDesc"),
    },
    {
      to: "/dashboard",
      icon: CalendarCheck,
      title: t("menu.bookings"),
      desc: t("menu.bookingsDesc"),
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#06B6D4] text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <LayoutGrid className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">{t("menu.title")}</h1>
          </div>
          <p className="text-base sm:text-xl text-blue-100">{t("menu.subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-4">
        {tiles.map(({ to, icon: Icon, title, desc, highlight }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-4 rounded-2xl border p-5 hover:shadow-lg transition-all ${
              highlight
                ? "bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] border-[#F59E0B]/40 hover:border-[#F59E0B]"
                : "bg-[#F5F5F4] border-[#1E3A8A]/10 hover:border-[#06B6D4]/50"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                highlight
                  ? "bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
                  : "bg-gradient-to-br from-[#E5E7EB] to-[#DBEAFE]"
              }`}
            >
              <Icon className={`w-7 h-7 ${highlight ? "text-white" : "text-[#1E3A8A]"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold ${highlight ? "text-white" : "text-[#1E3A8A]"}`}>{title}</h3>
              <p className={`text-sm ${highlight ? "text-white/60" : "text-[#6B7280]"}`}>{desc}</p>
            </div>
            <ChevronRight className={`w-5 h-5 shrink-0 ${highlight ? "text-white/30" : "text-[#6B7280]"}`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
