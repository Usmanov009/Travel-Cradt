import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { Home, MapPin, Globe2, Sparkles, LayoutGrid } from "lucide-react";

const items = [
  { to: "/", labelKey: "bottomNav.home", icon: Home, end: true },
  { to: "/domestic-travel", labelKey: "bottomNav.domestic", icon: MapPin },
  { to: "/custom-package", labelKey: "bottomNav.customPackage", icon: Sparkles },
  { to: "/international-travel", labelKey: "bottomNav.international", icon: Globe2 },
  { to: "/menu", labelKey: "bottomNav.menu", icon: LayoutGrid },
];

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-between px-1">
        {items.map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] sm:text-[11px] font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-slate-500"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-center leading-tight max-w-[68px] line-clamp-2">
              {t(labelKey)}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
