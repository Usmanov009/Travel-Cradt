import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPinned,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { getComboTourBySlug } from "../data/comboTours";
import { PackageImage } from "../components/PackageImage";
import { LoginModal } from "../components/LoginModal";
import { useAuth } from "../contexts/AuthContext";
import { calculatePackagePrice } from "../utils/pricing";
import type { StoredBooking } from "../utils/pricing";

export function ComboTourDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const tour = params.slug ? getComboTourBySlug(params.slug) : undefined;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [existingBooking, setExistingBooking] = useState<StoredBooking | null>(null);
  const [isTelegramUser, setIsTelegramUser] = useState(false);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      setPhone((prev) => prev || user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (!tour) return;
    const bookings: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
    const match = bookings.find((item) => item.type === "combo" && item.id === tour.id);
    if (match) {
      setExistingBooking(match);
      setName(match.name);
      setPhone(match.phone);
      setGuests(match.guests ?? 2);
    }
  }, [tour]);

  useEffect(() => {
    if (searchParams.get("book") === "1") {
      const el = document.getElementById("combo-booking-form");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  // Telegram WebApp orqali kirgan bo'lsa, ism va raqamni avtomatik to'ldirish
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    const telegramId = tg.initDataUnsafe?.user?.id;
    if (!telegramId) return;

    setIsTelegramUser(true);
    fetch(`/api/tg-user/${telegramId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
      })
      .catch(() => {});
  }, []);

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-slate-500 mb-4">Combo Tour topilmadi.</p>
        <Link to="/combo-tours" className="text-blue-600 font-semibold">
          Combo Tours ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const totalPrice = calculatePackagePrice(tour.price, Math.max(1, guests));

  const handleBooking = async () => {
    // Telegram WebApp foydalanuvchilari login talab qilmaydi
    const tg = (window as any).Telegram?.WebApp;
    const telegramId = tg?.initDataUnsafe?.user?.id?.toString() ?? null;
    if (!user && !telegramId) {
      setShowLoginModal(true);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setMessage("Iltimos, ism va telefon raqamingizni kiriting.");
      return;
    }

    const bookings: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
    const existingIndex = bookings.findIndex((item) => item.type === "combo" && item.id === tour.id);
    const finalPrice = calculatePackagePrice(tour.price, guests);
    const bookingRecord: StoredBooking = {
      id: tour.id,
      type: "combo",
      title: `${tour.title} (Combo Tour)`,
      basePrice: tour.price,
      price: finalPrice,
      name: name.trim(),
      phone: phone.trim(),
      guests,
      days: tour.days,
      bookedAt: new Date().toISOString(),
      image: tour.images?.[0] || "",
    };

    if (existingIndex !== -1) {
      bookings[existingIndex] = bookingRecord;
      setMessage("Combo Tour bronigiz yangilandi.");
    } else {
      bookings.push(bookingRecord);
      setMessage("Combo Tour muvaffaqiyatli bron qilindi!");
    }
    localStorage.setItem("travelcraft_bookings", JSON.stringify(bookings));
    setExistingBooking(bookingRecord);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookingRecord.title,
          type: "combo",
          price: finalPrice,
          name: name.trim(),
          phone: phone.trim(),
          guests,
          days: tour.days,
          status: "pending",
          telegram_id: telegramId,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const fresh: StoredBooking[] = JSON.parse(localStorage.getItem("travelcraft_bookings") || "[]");
        const idx = fresh.findIndex((item) => item.type === "combo" && item.id === tour.id);
        if (idx !== -1) {
          fresh[idx] = { ...fresh[idx], dbId: saved.id, status: "pending" };
          localStorage.setItem("travelcraft_bookings", JSON.stringify(fresh));
        }
      }
    } catch (err) {
      console.error("[combo booking] tarmoq xatosi:", err);
    }

    setTimeout(() => navigate("/dashboard"), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-[42vh] sm:h-[52vh] min-h-[320px] overflow-hidden">
        <div className="absolute inset-0 flex">
          {tour.countries.map((c, i) => (
            <div key={c.name} className={`relative h-full ${i === 0 ? "w-1/2 border-r-2 border-white/20" : "w-1/2"}`}>
              <PackageImage src={c.image} alt={c.name} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20" />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-2 rounded-xl text-sm hover:bg-white/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Orqaga
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <div className="container mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Combo Tour
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {tour.countries.map((c) => c.flag).join(" + ")} {tour.title}
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-2xl">{tour.vibe}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[1.75rem] border border-slate-200 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPinned className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">{tour.countries.length} davlat</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{tour.rating}</span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6">{tour.description}</p>

            <h3 className="font-bold text-slate-800 mb-3">Marshrut yuqori nuqtalari</h3>
            <div className="grid sm:grid-cols-2 gap-2 mb-2">
              {tour.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[1.75rem] border border-slate-200 p-5 sm:p-7 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Narxga nimalar kiradi</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {tour.included.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {tour.countries.map((c) => (
              <div key={c.name} className="rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-sm">
                <div className="aspect-[16/10] relative">
                  <PackageImage src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span>{c.flag}</span> {c.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div id="combo-booking-form" className="sticky top-24 bg-white rounded-[1.75rem] border border-slate-200 p-5 sm:p-7 shadow-lg">
            <div className="mb-4">
              <div className="text-xs text-slate-400">1 kishi uchun narx</div>
              <div className="text-3xl font-bold text-slate-900">${tour.price.toLocaleString()}</div>
            </div>

            <div className="space-y-4 mb-5">
              {isTelegramUser && (
                <div className="rounded-lg border-2 border-green-500 bg-green-50 p-3">
                  <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                    <span>✅</span> Telegram Ro'yxatidan Ma'lumotlar
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Sizning ism va telefon raqamingiz Telegram registratsiyasidan olingan.
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Ism</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ismingiz"
                  readOnly={isTelegramUser}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isTelegramUser ? "opacity-75 cursor-not-allowed bg-slate-50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Telefon</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  readOnly={isTelegramUser}
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isTelegramUser ? "opacity-75 cursor-not-allowed bg-slate-50" : ""
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Mehmonlar soni
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-5">
              <span className="text-slate-500 text-sm">Jami narx</span>
              <span className="text-2xl font-bold text-amber-600">${totalPrice.toLocaleString()}</span>
            </div>

            {message && (
              <div className="mb-4 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                {message}
              </div>
            )}

            <button
              onClick={handleBooking}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all"
            >
              {existingBooking ? "Bronni yangilash" : "Bron qilish"}
            </button>
          </div>
        </div>
      </div>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleBooking} />
    </div>
  );
}
