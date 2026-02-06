"use client";
import { User, Lock, Mail, Phone, UserCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            setError("Password minimal 6 karakter");
            return;
        }

        if (formData.username.length < 3) {
            setError("Username minimal 3 karakter");
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
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 flex items-center justify-center p-6">
                <div className="relative bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-gray-200 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
                    <p className="text-gray-600 mb-4">Akun kasir Anda telah berhasil dibuat.</p>
                    <p className="text-sm text-gray-500">Mengalihkan ke halaman login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-6">
            {/* Dekorasi Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-gray-200">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Kembali ke Login</span>
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/40">
                        <UserCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Daftar <span className="text-blue-600">Kasir</span>
                    </h1>
                    <p className="text-gray-600 font-medium">Buat akun kasir baru untuk sistem laundry</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Masukkan username"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                Email <span className="text-gray-400 text-xs">(opsional)</span>
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@contoh.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                No. Telepon <span className="text-gray-400 text-xs">(opsional)</span>
                            </label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2 ml-1">
                                Konfirmasi Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ulangi password"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-6"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                MENDAFTAR...
                            </>
                        ) : (
                            "DAFTAR SEKARANG"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Sudah punya akun?{" "}
                        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        &copy; 2026 UKK Rekayasa Perangkat Lunak &bull; Versi 2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
