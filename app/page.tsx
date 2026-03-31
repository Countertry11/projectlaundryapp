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
  Sparkles,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { AnimatedItem, AnimatedPage } from "@/components/AnimatedPage";

// Constants
const DEMO_ACCOUNTS = [
  { role: "Admin", username: "", password: "admin123" },
  { role: "Subardi", username: "", password: "anjay123" },
  { role: "Owner", username: "", password: "owner123" },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Handle redirect when user is authenticated
  useEffect(() => {
    if (user && !isLoading) {
      const timer = setTimeout(() => {
        router.push(`/${user.role}`);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, router]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  }, [error]);

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Username dan password harus diisi");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("remembered_user", formData.username);
        } else {
          localStorage.removeItem("remembered_user");
        }
      } else {
        setError(result.error || "Username atau password salah");
        // Clear password field on error
        setFormData(prev => ({ ...prev, password: "" }));
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle demo account fill
  const handleDemoAccountClick = useCallback((username: string, password: string) => {
    setFormData({ username, password });
    setError("");
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Check for remembered user on mount
  useEffect(() => {
    const rememberedUser = localStorage.getItem("remembered_user");
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser }));
      setRememberMe(true);
    }
  }, []);

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Pattern with slow floating animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s', animationDuration: '9s' }}></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/40 overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-scaleIn">
        
        {/* Left Side - Branding (Desktop only) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative flex-col justify-between p-10 text-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white/20 rounded-full animate-pulse-soft"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white/20 rounded-full animate-float" style={{ animationDuration: '12s' }}></div>
          </div>

          {/* Logo */}
          <AnimatedItem index={1} animation="slideInLeft" className="relative z-10 flex items-center gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:scale-110 transition-transform duration-300">
              <Store className="w-6 h-6 animate-wiggle" aria-hidden="true" style={{ animationDelay: '1s' }} />
            </div>
            <span className="font-bold text-lg tracking-wide">
              UKK LAUNDRY
            </span>
          </AnimatedItem>

          {/* Content */}
          <div className="relative z-10 my-auto">
            <AnimatedItem index={2} animation="slideInLeft">
              <h1 className="text-4xl font-extrabold leading-tight mb-4">
                Kelola <br />
                <span className="text-blue-200">Bisnis Laundry</span> Anda
              </h1>
            </AnimatedItem>
            <AnimatedItem index={3} animation="slideInLeft">
              <p className="text-blue-100/80 text-sm leading-relaxed max-w-xs">
                Sistem manajemen laundry modern untuk efisiensi transaksi dan kepuasan pelanggan.
              </p>
            </AnimatedItem>
            
            {/* Features */}
            <div className="mt-8 space-y-3">
              {["Manajemen Transaksi", "Laporan Waktu Nyata", "Peran Multi-pengguna"].map((feature, i) => (
                <AnimatedItem key={i} index={4 + i} animation="slideInLeft" className="flex items-center gap-2 text-sm text-white/80">
                  <div className="w-1.5 h-1.5 bg-blue-200 rounded-full" aria-hidden="true"></div>
                  {feature}
                </AnimatedItem>
              ))}
            </div>
          </div>

          {/* Footer */}
          <AnimatedItem index={8} animation="slideInLeft" className="relative z-10 flex items-center gap-2 text-xs text-blue-200/60 transition-transform hover:translate-x-1 duration-300">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Sistem Aman © {new Date().getFullYear()}</span>
          </AnimatedItem>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 text-center animate-fadeInUp">
            <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-3 hover:scale-105 transition-transform duration-300">
              <Store className="w-8 h-8 text-blue-600 animate-wiggle" aria-hidden="true" style={{ animationDelay: '1s' }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laundry<span className="text-blue-600">UKK</span>
            </h1>
          </div>

          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <AnimatedItem index={2} className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-600 animate-pulse-soft" aria-hidden="true" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Selamat Datang!
                </h2>
              </div>
              <p className="text-gray-500">
                Silakan masuk dengan akun Anda
              </p>
            </AnimatedItem>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Error Message */}
              {error && (
                <AnimatedItem index={0} animation="scaleIn" className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
                  <div role="alert" aria-live="polite" className="flex items-start gap-3 w-full">
                    <div className="bg-red-100 p-1 rounded-full text-red-600 flex-shrink-0">
                      <ShieldCheck size={16} aria-hidden="true" />
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      {error}
                    </div>
                  </div>
                </AnimatedItem>
              )}

              {/* Username Field */}
              <AnimatedItem index={3} className="space-y-2">
                <label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  Nama Pengguna
                </label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 pointer-events-none transition-colors group-focus-within:text-blue-600">
                    <User size={18} aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-300"
                    placeholder="Masukkan Nama Pengguna"
                    disabled={isSubmitting}
                    autoComplete="off"
                    autoFocus
                    aria-invalid={!!error}
                  />
                </div>
              </AnimatedItem>

              {/* Password Field */}
              <AnimatedItem index={4} className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center text-gray-400 pointer-events-none z-10 transition-colors group-focus-within:text-blue-600">
                    <Lock size={18} aria-hidden="true" />
                  </div>
                  
                  {/* Password Input */}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 pl-12 pr-14 py-3.5 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-gray-300"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    autoComplete="off"
                    aria-invalid={!!error}
                  />
                  
                  {/* Eye Button */}
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`
                      absolute right-2 top-1/2 -translate-y-1/2
                      w-10 h-10 flex items-center justify-center
                      text-gray-400 hover:text-gray-600
                      focus:outline-none focus:text-gray-600
                      focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                      rounded-lg transition-all duration-200
                      ${showPassword ? 'text-blue-600' : 'text-gray-400'}
                      hover:bg-gray-100 active:bg-gray-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff size={20} aria-hidden="true" className="animate-scaleIn" />
                    ) : (
                      <Eye size={20} aria-hidden="true" className="animate-scaleIn" />
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {formData.password && !error && (
                  <div className="text-xs text-gray-500 mt-1 animate-fadeIn">
                    {formData.password.length < 6 ? (
                      <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> Kata Sandi terlalu pendek</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1"><Check size={12}/> Kata Sandi Benar</span>
                    )}
                  </div>
                )}
              </AnimatedItem>

              {/* Submit Button */}
              <AnimatedItem index={5}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden relative group"
                  aria-label={isSubmitting ? "Memproses login..." : "Masuk"}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:transition-all group-hover:duration-700 group-hover:ease-out group-hover:translate-x-[150%]"></div>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight size={18} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </AnimatedItem>

              {/* Demo Accounts */}
              <AnimatedItem index={6} className="bg-gray-50 rounded-xl p-4 mt-6 border border-gray-100">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-600" aria-hidden="true" />
                  Akun Demo (Klik untuk mengisi):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {DEMO_ACCOUNTS.map((account, idx) => (
                    <AnimatedItem key={account.role} index={7 + idx} animation="scaleIn">
                      <button
                        type="button"
                        onClick={() => handleDemoAccountClick(account.username, account.password)}
                        className="w-full bg-white p-2.5 rounded-lg border border-gray-200 text-left hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 group"
                        disabled={isSubmitting}
                      >
                        <p className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{account.role}</p>
                        <p className="text-gray-400 text-[10px] break-all group-hover:text-blue-500/70 transition-colors">{account.username}:{account.password}</p>
                      </button>
                    </AnimatedItem>
                  ))}
                </div>
              </AnimatedItem>
            </form>

            {/* Register Link */}
            <AnimatedItem index={10} className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Belum punya akun Kasir?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline hover:underline-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                >
                  Daftar Sebagai Kasir
                </Link>
              </p>
            </AnimatedItem>
          </div>
        </div>
      </div>

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 rounded-lg shadow-lg z-50">
        Lewati ke konten utama
      </a>
    </AnimatedPage>
  );
}
