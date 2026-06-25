import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ClipboardList, ArrowRight, Trash2, Pencil, Check,
  Plane, MapPin, Sparkles, DollarSign, Users, Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { getPackageImageByRef } from "../data/packageMedia";
import { PackageImage } from "../components/PackageImage";
import {
  recalculateBookingPrice,
  resolveBasePrice,
  type StoredBooking,
} from "../utils/pricing";

const TYPE_CONFIG = {
  domestic:      { label: "Ichki tur",    icon: <MapPin className="w-3.5 h-3.5" />,     color: "bg-blue-100 text-blue-700" },
  international: { label: "Xalqaro tur",  icon: <Plane className="w-3.5 h-3.5" />,      color: "bg-purple-100 text-purple-700" },
  custom:        { label: "Maxsus tur",   icon: <Sparkles className="w-3.5 h-3.5" />,   color: "bg-amber-100 text-amber-700" },
};

export function DashboardPage() {
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTravelDate, setEditTravelDate] = useState("");
  const [editGuests, setEditGuests] = useState(1);

  const loadBookings = () => {
    const stored: StoredBooking[] = JSON.parse(
      localStorage.getItem("travelcraft_bookings") || "[]",
    );
    setBookings(stored);
    return stored;
  };

  const syncStatuses = async (stored: StoredBooking[]) => {
    const withDbId = stored.filter((b) => b.dbId);
    if (withDbId.length === 0) return;
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) return;
      const dbRows: any[] = await res.json();
      let changed = false;
      const updated = stored.map((b) => {
        if (!b.dbId) return b;
        const row = dbRows.find((r) => r.id === b.dbId);
        if (row && row.status !== b.status) {
          changed = true;
          return { ...b, status: row.status };
        }
        return b;
      });
      if (changed) {
        localStorage.setItem("travelcraft_bookings", JSON.stringify(updated));
        setBookings(updated);
      }
    } catch {}
  };

  useEffect(() => {
    const stored = loadBookings();
    syncStatuses(stored);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "travelcraft_bookings") loadBookings();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totalSpent = bookings.reduce((s, b) => s + b.price, 0);
  const domesticCount = bookings.filter((b) => b.type === "domestic").length;
  const intlCount = bookings.filter((b) => b.type === "international").length;

  const handleClearBooking = (id: number, type: string) => {
    const next = bookings.filter((item) => !(item.id === id && item.type === type));
    setBookings(next);
    localStorage.setItem("travelcraft_bookings", JSON.stringify(next));
  };

  const handleStartEdit = (booking: StoredBooking) => {
    setEditingKey(`${booking.type}-${booking.id}`);
    setEditName(booking.name);
    setEditTravelDate(booking.travelDate ?? "");
    setEditGuests(booking.guests);
  };

  const previewPrice = (booking: StoredBooking) =>
    recalculateBookingPrice({ ...booking, guests: editGuests });

  const handleSaveEdit = (booking: StoredBooking) => {
    const updated = bookings.map((item) => {
      if (item.id !== booking.id || item.type !== booking.type) return item;
      const next = {
        ...item,
        name: editName,
        travelDate: editTravelDate || undefined,
        guests: Math.max(1, editGuests),
        basePrice: resolveBasePrice(item),
      };
      return { ...next, price: recalculateBookingPrice(next) };
    });
    setBookings(updated);
    localStorage.setItem("travelcraft_bookings", JSON.stringify(updated));
    setEditingKey(null);
  };

  const stats = [
    {
      label: "Jami buyurtmalar",
      value: bookings.length,
      icon: <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
    },
    {
      label: "Jami xarajat",
      value: `$${totalSpent.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Ichki turlar",
      value: domesticCount,
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
    },
    {
      label: "Xalqaro turlar",
      value: intlCount,
      icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
      gradient: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-10 md:py-14">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
              Mening sayohatlarim
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm sm:text-base max-w-md">
              Buyurtmalarni boshqaring va sayohat tarixingizni ko'ring.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              to="/domestic-travel"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 hover:shadow-sm transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ichki turlar</span>
              <span className="sm:hidden">Ichki</span>
            </Link>
            <Link
              to="/international-travel"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 hover:shadow-sm transition"
            >
              <Plane className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xalqaro turlar</span>
              <span className="sm:hidden">Xalqaro</span>
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${stat.bg} rounded-2xl p-4 sm:p-5 border border-white shadow-sm`}
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${stat.gradient} text-white mb-3 shadow-sm`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Bookings ── */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-14 text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold text-slate-800 mb-2">
              Hali buyurtma yo'q
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-sm mx-auto">
              Tur tanlang va "Band qilish" tugmasini bosing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/domestic-travel"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-white text-sm font-semibold hover:shadow-lg transition"
              >
                <MapPin className="w-4 h-4" />
                Ichki turlar
              </Link>
              <Link
                to="/international-travel"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-2.5 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
              >
                <Plane className="w-4 h-4" />
                Xalqaro turlar
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                Buyurtmalar
                <span className="ml-2 text-xs sm:text-sm font-normal text-slate-500">
                  ({bookings.length} ta)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {bookings.map((booking, idx) => {
                const bookingKey = `${booking.type}-${booking.id}`;
                const isEditing = editingKey === bookingKey;
                const cfg = TYPE_CONFIG[booking.type];
                const coverImage =
                  booking.image ??
                  getPackageImageByRef(booking.type, booking.id);

                return (
                  <motion.div
                    key={bookingKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card top color bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${
                      booking.type === "domestic" ? "from-blue-500 to-cyan-500" :
                      booking.type === "international" ? "from-purple-500 to-pink-500" :
                      "from-amber-400 to-orange-500"
                    }`} />

                    {coverImage && (
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                        <PackageImage
                          src={coverImage}
                          alt={booking.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {/* Type badge + price */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          ${booking.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 mb-3">
                        {booking.title}
                      </h3>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm bg-slate-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{booking.name || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span>{booking.guests} mehmon</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            Bron: {new Date(booking.bookedAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                        {booking.travelDate && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                            <span className="truncate text-emerald-700 font-medium">
                              Sayohat: {new Date(booking.travelDate).toLocaleDateString("uz-UZ")}
                            </span>
                          </div>
                        )}
                        {/* Status badge */}
                        {booking.status && (
                          <div className="col-span-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {booking.status === "accepted" ? "✅ Qabul qilindi" : booking.status === "rejected" ? "❌ Rad etildi" : "⏳ Kutmoqda"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => isEditing ? handleSaveEdit(booking) : handleStartEdit(booking)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition ${
                            isEditing
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {isEditing
                            ? <><Check className="w-3.5 h-3.5" /> Saqlash</>
                            : <><Pencil className="w-3.5 h-3.5" /> Tahrirlash</>
                          }
                        </button>
                        {booking.status !== "accepted" && (
                          <button
                            onClick={() => handleClearBooking(booking.id, booking.type)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 px-3 py-2 text-xs sm:text-sm text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">O'chirish</span>
                          </button>
                        )}
                      </div>

                      {/* Edit form */}
                      {isEditing && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1 text-xs sm:col-span-2">
                            <span className="font-medium text-slate-600">Ism Familiya</span>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="To'liq ism va familiya"
                              className="rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-xs">
                            <span className="font-medium text-slate-600">Sayohat sanasi</span>
                            <input
                              type="date"
                              value={editTravelDate}
                              onChange={(e) => setEditTravelDate(e.target.value)}
                              className="rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-xs">
                            <span className="font-medium text-slate-600">Odamlar soni</span>
                            <input
                              type="number"
                              min={1}
                              value={editGuests}
                              onChange={(e) => setEditGuests(Math.max(1, Number(e.target.value)))}
                              className="rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            {editGuests !== booking.guests && (
                              <span className="text-emerald-600 font-semibold mt-1">
                                Yangi narx: ${previewPrice(booking).toLocaleString()}
                              </span>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Back to home ── */}
        {bookings.length > 0 && (
          <div className="mt-8 sm:mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Bosh sahifaga qaytish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
