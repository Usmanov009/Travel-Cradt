import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Lock, Phone, Eye, EyeOff, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(phone, password);
      } else {
        if (!name.trim()) { setError("Ism kiriting"); setLoading(false); return; }
        await register(name, phone, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setError(""); setName(""); setPhone(""); setPassword(""); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-lg">TravelCraft AI</span>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold mb-1">
                {mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
              </h2>
              <p className="text-slate-500 text-sm mb-5">
                {mode === "login"
                  ? "Bron qilish uchun telefon raqamingiz bilan kiring"
                  : "Telefon raqamingiz bilan ro'yxatdan o'ting"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ismingiz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Parol"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {loading ? "..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>
                    Hisobingiz yo'qmi?{" "}
                    <button onClick={() => { setMode("register"); reset(); }} className="text-blue-600 font-semibold hover:underline">
                      Ro'yxatdan o'ting
                    </button>
                  </>
                ) : (
                  <>
                    Hisobingiz bormi?{" "}
                    <button onClick={() => { setMode("login"); reset(); }} className="text-blue-600 font-semibold hover:underline">
                      Kiring
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
