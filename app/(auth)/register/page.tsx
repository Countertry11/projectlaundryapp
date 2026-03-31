"use client";
import { User, Lock, Mail, Phone, UserCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { AnimatedPage, AnimatedItem } from "@/components/AnimatedPage";
import { sanitizePhoneNumber } from "@/utils";

export default function RegisterKasirPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        full_name: "",
        email: "",
        phone: "",
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "phone" ? sanitizePhoneNumber(value) : value,
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validasi
        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak cocok");
            return;
        }

        if (formData.password.length < 6) {
            setError("Kata Sandi minimal 6 karakter");
            return;
        }

        if (formData.username.length < 3) {
            setError("Nama pengguna minimal 3 karakter");
            return;
        }

        setIsSubmitting(true);

        try {
            // Cek apakah username sudah ada
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("username", formData.username)
                .single();

            if (existingUser) {
                setError("Username sudah digunakan");
                setIsSubmitting(false);
                return;
            }

            // Insert user baru dengan role kasir
            const { error: insertError } = await supabase.from("users").insert({
                username: formData.username,
                password: formData.password, // Di production, gunakan bcrypt hashing
                role: "kasir",
                full_name: formData.full_name,
                email: formData.email || null,
                phone: formData.phone || null,
                is_active: true,
            });

            if (insertError) {
                console.error("Insert error:", insertError);
                setError("Gagal mendaftar. Silakan coba lagi.");
                setIsSubmitting(false);
                return;
            }

            // Sukses
            setIsSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            console.error("Register error:", err);
            setError("Terjadi kesalahan. Silakan coba lagi.");
        }

        setIsSubmitting(false);
    };

    if (isSuccess) {
        return (
            <AnimatedPage className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 flex items-center justify-center p-6">
                <div className="relative bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-gray-200 text-center animate-scaleIn">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg animate-wiggle">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fadeInUp">Pendaftaran Berhasil!</h2>
                    <p className="text-gray-600 mb-4 animate-fadeInUp" style={{ animationDelay: '100ms' }}>Akun kasir Anda telah berhasil dibuat.</p>
                    <p className="text-sm text-gray-500 animate-fadeInUp" style={{ animationDelay: '200ms' }}>Mengalihkan ke halaman login...</p>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s' }} />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s', animationDuration: '9s' }} />
            </div>

            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-xl p-6 md:p-10 rounded-3xl shadow-2xl shadow-blue-900/40 border border-gray-200 animate-scaleIn">
                {/* Back Button */}
                <AnimatedItem index={1} animation="slideInLeft" className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Kembali ke Login</span>
                    </Link>
                </AnimatedItem>

                <AnimatedItem index={2} className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform">
                        <UserCircle className="w-8 h-8 text-white animate-pulse-soft" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Daftar <span className="text-blue-600">Kasir</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Buat akun kasir baru untuk sistem laundry</p>
                </AnimatedItem>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <AnimatedItem index={0} animation="scaleIn" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                            {error}
                        </AnimatedItem>
                    )}

                    <div className="space-y-4">
                        {/* Full Name */}
                        <AnimatedItem index={3} className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </AnimatedItem>

                        {/* Username */}
                        <AnimatedItem index={4} className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 ml-1">
                                Nama Pengguna <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Masukkan Nama Pengguna"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </AnimatedItem>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <AnimatedItem index={5} className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">
                                    Email <span className="text-gray-400 text-xs font-normal">(opsional)</span>
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="email@contoh.com"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </AnimatedItem>

                            {/* Phone */}
                            <AnimatedItem index={6} className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">
                                    No. Telepon <span className="text-gray-400 text-xs font-normal">(opsional)</span>
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </AnimatedItem>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <AnimatedItem index={7} className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">
                                    Sandi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 kar."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </AnimatedItem>

                            {/* Confirm Password */}
                            <AnimatedItem index={8} className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700 ml-1">
                                    Konfirmasi Sandi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5 pointer-events-none" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Ulangi sandi"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 focus:bg-white hover:border-gray-300 outline-none transition-all text-gray-900"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </AnimatedItem>
                        </div>
                    </div>

                    <AnimatedItem index={9}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:transition-all group-hover:duration-700 group-hover:ease-out group-hover:translate-x-[150%]"></div>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                "Daftar Kasir Baru"
                            )}
                        </button>
                    </AnimatedItem>
                </form>

                <AnimatedItem index={10} className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Sudah punya akun?{" "}
                        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-1 transition-colors">
                            Masuk di sini
                        </Link>
                    </p>
                </AnimatedItem>

                <AnimatedItem index={11} className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-[11px] text-gray-400 font-medium">
                        &copy; 2026 UKK Rekayasa Perangkat Lunak &bull; Versi 2.0
                    </p>
                </AnimatedItem>
            </div>
        </AnimatedPage>
    );
}
