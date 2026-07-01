import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { CalendarDays, CheckCircle2, ArrowLeft, Star } from "lucide-react";
import type { TravelPackage } from "../data/packages";
import { getPackageImages } from "../data/packageMedia";
import { mapDbPackage } from "../hooks/usePackages";
import { getAppLang } from "../utils/locale";
import { PackageImage } from "../components/PackageImage";
import { useAuth } from "../contexts/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { DestinationMap } from "../components/DestinationMap";
import { calculatePackagePrice } from "../utils/pricing";
import type { StoredBooking } from "../utils/pricing";

export function PackageDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = getAppLang(i18n.language);
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<TravelPackage | null>(null);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [existingBooking, setExistingBooking] = useState<StoredBooking | null>(null);

  const totalPrice = packageData
    ? calculatePackagePrice(packageData.price, Math.max(1, guests))
    : 0;

  useEffect(() => {
    if (!params.id) return;
    setPkgLoading(true);
    fetch(`/api/packages/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPackageData(data ? mapDbPackage(data) : null))
      .catch(() => setPackageData(null))
      .finally(() => setPkgLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!packageData) return;
    const bookings: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
    const match = bookings.find(
      (item) => item.type === packageData.type && item.id === packageData.id,
    );
    if (match) {
      setExistingBooking(match);
      setName(match.name);
      setPhone(match.phone);
      setGuests(match.guests ?? 1);
    } else if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [packageData, user]);

  // Telegram WebApp orqali kirgan bo'lsa, ism va raqamni avtomatik to'ldirish
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    const telegramId = tg.initDataUnsafe?.user?.id;
    if (!telegramId) return;

    fetch(`/api/tg-user/${telegramId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
      })
      .catch(() => {});
  }, []);

  const handleBooking = async () => {
    if (!packageData) return;

    // Telegram WebApp foydalanuvchilari login talab qilmaydi
    const tg = (window as any).Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id?.toString() ?? null;
    if (!user && !telegramId) { setShowLoginModal(true); return; }

    if (!name.trim() || !phone.trim()) {
      setMessage(t("detail.enterNamePhone"));
      return;
    }

    const bookings: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
    const existingIndex = bookings.findIndex(
      (item) => item.type === packageData.type && item.id === packageData.id,
    );
    const finalPrice = calculatePackagePrice(packageData.price, guests);
    const bookingRecord: StoredBooking = {
      id: packageData.id,
      type: packageData.type,
      title: packageData.title,
      basePrice: packageData.price,
      price: finalPrice,
      name: name.trim(),
      phone: phone.trim(),
      guests,
      bookedAt: new Date().toISOString(),
      image: packageData.image,
    };

    if (existingIndex !== -1) {
      bookings[existingIndex] = bookingRecord;
      setMessage(t("detail.bookingUpdated"));
    } else {
      bookings.push(bookingRecord);
      setMessage(t("detail.tourBooked"));
    }

    localStorage.setItem("travelcraft_bookings", JSON.stringify(bookings));
    setExistingBooking(bookingRecord);

    // NeonDB ga ham saqlash (admin panel ko'rishi uchun)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: packageData.title,
          type: packageData.type,
          price: finalPrice,
          name: name.trim(),
          phone: phone.trim(),
          guests,
          days: 1,
          status: "pending",
          telegram_id: telegramId,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        // dbId va status ni localStorage ga saqlash
        const fresh: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
        const idx = fresh.findIndex(
          (item) => item.type === packageData.type && item.id === packageData.id,
        );
        if (idx !== -1) {
          fresh[idx] = { ...fresh[idx], dbId: saved.id, status: "pending" };
          localStorage.setItem("travelcraft_bookings", JSON.stringify(fresh));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("[booking] DB saqlashda xato:", errData.error || res.status);
      }
    } catch (err) {
      console.error("[booking] tarmoq xatosi:", err);
    }

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  if (pkgLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-400">
        Yuklanmoqda...
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <h2 className="text-3xl font-bold mb-4">{t("detail.packageNotFound")}</h2>
          <p className="text-slate-600 mb-6">{t("detail.packageNotFoundDesc")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("detail.backToHome")}
          </Link>
        </div>
      </div>
    );
  }

  const localTitle = packageData.translations?.[lang]?.title || packageData.title;
  const localDescription = packageData.translations?.[lang]?.description || packageData.description;
  const localVibe = packageData.translations?.[lang]?.vibe || packageData.vibe;
  const localDuration = packageData.translations?.[lang]?.duration || packageData.duration;
  const galleryImages = getPackageImages(packageData);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 rounded-3xl overflow-hidden shadow-xl bg-white">
          <PackageImage src={packageData.image} alt={localTitle} className="w-full h-48 sm:h-72 lg:h-[420px] object-cover" />
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-slate-50 border-t border-slate-100">
              {galleryImages.map((src, index) => (
                <div key={src} className="aspect-[4/3] overflow-hidden rounded-xl">
                  <PackageImage
                    src={src}
                    alt={`${localTitle} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="p-5 sm:p-8 md:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                  {packageData.type === "domestic" ? t("detail.domestic") : t("detail.international")} {t("detail.packageLabel")}
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{localTitle}</h1>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-sm text-slate-500">{t("detail.from")}</p>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">${totalPrice}</p>
                {guests > 1 && (
                  <p className="text-xs text-slate-400 mt-1">
                    ${packageData.price} × {guests} mehmon
                  </p>
                )}
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8">{localDescription}</p>

            {localVibe || packageData.video ? (
              <div className="grid gap-6 mb-8">
                {localVibe && (
                  <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
                    <h2 className="text-2xl font-semibold mb-3">{t("detail.tripVibe")}</h2>
                    <p className="text-slate-700 leading-relaxed">{localVibe}</p>
                  </div>
                )}
                {packageData.video && (
                  <div className="rounded-3xl overflow-hidden shadow-lg bg-black">
                    <div className="aspect-video">
                      <iframe
                        src={packageData.video}
                        title={`${packageData.title} video`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {packageData.country && (
              <div className="mb-8">
                <DestinationMap
                  query={`${localTitle}, ${packageData.country}`}
                  title={t("detail.destination")}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <p className="text-sm text-slate-500">{t("detail.duration")}</p>
                <p className="mt-3 text-lg font-semibold">{localDuration}</p>
              </div>
              {packageData.country && (
                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                  <p className="text-sm text-slate-500">{t("detail.destination")}</p>
                  <p className="mt-3 text-lg font-semibold">{packageData.country}</p>
                </div>
              )}
              {packageData.hotel && (
                <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                  <p className="text-sm text-slate-500">{t("detail.hotel")}</p>
                  <p className="mt-3 text-lg font-semibold">{packageData.hotel}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {packageData.included.map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 p-5 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <div className="flex flex-col gap-4 md:flex-row items-start justify-between mb-4">
                <div>
                  <p className="text-sm opacity-80">{t("detail.bookingConfirmation")}</p>
                  <p className="text-2xl font-bold">{t("detail.reserveToday")}</p>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>{packageData.rating}</span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    {t("detail.yourName")}
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t("detail.namePlaceholder")}
                      className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm">
                    {t("detail.phoneNumber")}
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2 text-sm max-w-sm">
                  {t("detail.guests")}
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(event) => setGuests(Number(event.target.value))}
                    className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </label>

                <div className="rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-white/90">
                  <p className="font-semibold">{t("detail.bookingDetails")}</p>
                  <p className="mt-2">{t("detail.bookingDetailsDesc")}</p>
                  <p className="mt-3 text-lg font-bold text-white">
                    Jami: ${totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-white text-blue-600 px-8 py-4 font-semibold shadow-lg hover:bg-slate-100 transition md:w-auto"
              >
                <CalendarDays className="w-5 h-5" />
                {existingBooking ? t("detail.updateBooking") : t("detail.bookTour")}
              </button>
              {message && <p className="mt-4 text-sm text-white/90">{message}</p>}
            </div>
          </div>
        </div>

        <aside className="lg:w-1/3 space-y-4 sm:space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4">{t("detail.needHelp")}</h2>
            <p className="text-slate-600 mb-4">
              {t("detail.supportDesc")}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">+998</span>
                <div>
                  <p className="font-semibold">{t("detail.phone")}</p>
                  <p className="text-sm text-slate-500">+998 XX XXX XX XX</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">✉</span>
                <div>
                  <p className="font-semibold">{t("detail.email")}</p>
                  <p className="text-sm text-slate-500">support@travelcraft.ai</p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4">{t("detail.quickLinks")}</h2>
            <div className="space-y-3">
              <Link
                to="/dashboard"
                className="block rounded-2xl bg-blue-600 px-4 py-3 text-white text-center hover:bg-blue-700 transition"
              >
                {t("detail.openDashboard")}
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition"
              >
                {t("detail.backToPackages")}
              </button>
            </div>
          </div>
        </aside>
      </div>
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleBooking}
      />
    </div>
  );
}
