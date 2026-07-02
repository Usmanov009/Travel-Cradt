import { Outlet, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Globe, Plane, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { AiChatWidget } from "./AiChatWidget";
import { BottomNav } from "./BottomNav";
import { useTelegramWebApp } from "../hooks/useTelegramWebApp";

export function Layout() {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isTelegram } = useTelegramWebApp();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TravelCraft AI
              </span>
            </Link>

            {!isTelegram && (
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-slate-700 rounded"></span>
                  <span className="w-full h-0.5 bg-slate-700 rounded"></span>
                  <span className="w-full h-0.5 bg-slate-700 rounded"></span>
                </div>
              </button>
            )}

            {!isTelegram && (
              <div className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className="text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t("nav.home")}
                </Link>
                <Link
                  to="/domestic-travel"
                  className="text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {t("nav.domestic")}
                </Link>
                <Link
                  to="/international-travel"
                  className="text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {t("nav.international")}
                </Link>
                <Link
                  to="/custom-package"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("nav.customPackage")}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {t("nav.dashboard")}
                </Link>

                <div className="flex items-center gap-2 ml-4 border-l pl-4">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <button
                    onClick={() => changeLanguage("uz")}
                    className={`px-2 py-1 rounded ${
                      i18n.language === "uz"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    UZ
                  </button>
                  <button
                    onClick={() => changeLanguage("ru")}
                    className={`px-2 py-1 rounded ${
                      i18n.language === "ru"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    RU
                  </button>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-2 py-1 rounded ${
                      i18n.language === "en"
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            )}

            {isTelegram && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeLanguage("uz")}
                  className={`px-2 py-1 text-xs rounded ${
                    i18n.language === "uz"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  UZ
                </button>
                <button
                  onClick={() => changeLanguage("ru")}
                  className={`px-2 py-1 text-xs rounded ${
                    i18n.language === "ru"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-1 text-xs rounded ${
                    i18n.language === "en"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  EN
                </button>
              </div>
            )}
          </div>

          {!isTelegram && isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <Link
                to="/"
                className="block text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/domestic-travel"
                className="block text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.domestic")}
              </Link>
              <Link
                to="/international-travel"
                className="block text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.international")}
              </Link>
              <Link
                to="/custom-package"
                className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.customPackage")}
              </Link>
              <Link
                to="/dashboard"
                className="block text-slate-700 hover:text-blue-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Globe className="w-4 h-4 text-slate-500" />
                <button
                  onClick={() => changeLanguage("uz")}
                  className={`px-3 py-1 rounded ${
                    i18n.language === "uz"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  UZ
                </button>
                <button
                  onClick={() => changeLanguage("ru")}
                  className={`px-3 py-1 rounded ${
                    i18n.language === "ru"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-3 py-1 rounded ${
                    i18n.language === "en"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className={isTelegram ? "pb-20" : undefined}>
        <Outlet />
      </main>

      <AiChatWidget raised={isTelegram} />

      {isTelegram && <BottomNav />}

      <footer className="bg-slate-900 text-white py-10 sm:py-12 mt-16 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 md:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">TravelCraft AI</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white">{t("nav.domestic")}</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Samarkand</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bukhara</li>
                <li className="hover:text-white transition-colors cursor-pointer">Khiva</li>
                <li className="hover:text-white transition-colors cursor-pointer">Chimgan</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white">{t("nav.international")}</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Turkey</li>
                <li className="hover:text-white transition-colors cursor-pointer">Dubai</li>
                <li className="hover:text-white transition-colors cursor-pointer">Egypt</li>
                <li className="hover:text-white transition-colors cursor-pointer">Thailand</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white">Contact</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-sm">
                <li>support@travelcraft.ai</li>
                <li>+998 XX XXX XX XX</li>
                <li>Tashkent, Uzbekistan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 sm:pt-8 text-center text-slate-400 text-xs sm:text-sm">
            © 2026 TravelCraft AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
