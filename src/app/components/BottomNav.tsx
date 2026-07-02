import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { Home, MapPin, Globe2, Sparkles, LayoutGrid } from "lucide-react";

const items = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/domestic-travel", labelKey: "nav.domestic", icon: MapPin },
  { to: "/international-travel", labelKey: "nav.international", icon: Globe2 },
  { to: "/custom-package", labelKey: "nav.customPackage", icon: Sparkles },
  { to: "/menu", labelKey: "menu.title", icon: LayoutGrid },
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
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-slate-500"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="truncate max-w-[64px]">{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
