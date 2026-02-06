"use client";
import {
  Lock,
  User,
  Loader2,
  Store,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect otomatis jika sudah login
  useEffect(() => {
    if (user && !isLoading) {
      router.push(`/${user.role}`);
    }
  }, [user, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(username, password);

    if (result.success) {
      const storedUser = localStorage.getItem("laundry_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        router.push(`/${userData.role}`);
      }
    } else {
      setError(result.error || "Username atau password salah");
    }

    setIsSubmitting(false);
  };

  return (
    // CONTAINER UTAMA: Full Screen Blue dengan Pattern
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Decor: Abstract Shapes agar tidak flat */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-500/30 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-600/30 rounded-full blur-[100px]" />
        {/* Pattern Grid Halus */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 mix-blend-overlay"></div>
      </div>

      {/* --- MAIN CARD: SPLIT LAYOUT (Kiri Branding, Kanan Form) --- */}
      <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in duration-500">
        {/* BAGIAN KIRI: Visual Branding (Biru) - Hilang di Mobile, Muncul di Desktop */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 relative flex-col justify-between p-10 text-white overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"></div>

          {/* Logo Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide uppercase opacity-90">
              UKK Laundry
            </span>
          </div>

          {/* Tengah: Ilustrasi Teks Besar */}
          <div className="relative z-10 my-auto">
            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Kelola <br />
              <span className="text-blue-200">Usaha</span> Anda.
            </h2>
            <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
              Sistem manajemen laundry modern untuk efisiensi transaksi dan
              kepuasan pelanggan yang lebih baik.
            </p>
          </div>

          {/* Footer Kiri */}
          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-blue-200/60">
            <ShieldCheck size={14} />
            <span>Secure Enterprise System &copy; 2026</span>
          </div>
        </div>

        {/* BAGIAN KANAN: Form Login (Putih) */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          {/* Header Mobile Only (Logo muncul di atas saat mobile) */}
          <div className="md:hidden mb-8 text-center">
            <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-3">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laundry<span className="text-blue-600">UKK</span>
            </h1>
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang!
              </h3>
              <p className="text-gray-500">
                Silakan masuk dengan akun petugas Anda.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-pulse">
                  <div className="bg-red-500/10 p-1 rounded-full text-red-600 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="text-sm text-red-600 font-semibold">
                    {error}
                  </div>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-12 pr-4 py-4 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-gray-400"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2 group">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-12 pr-12 py-4 rounded-xl outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Tombol Login Besar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Sedang Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 font-bold hover:underline transition-all"
                >
                  Daftar Kasir Baru
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
