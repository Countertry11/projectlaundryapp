"use client";

import React from "react";
import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function OwnerDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 text-slate-800 font-sans">
            {/* Header - Dibuat lebih slim */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-xl font-black text-gray-800 tracking-tight">Dashboard Owner</h1>
                    <p className="text-gray-500 text-xs font-medium">
                        Selamat datang kembali, <span className="text-blue-600 font-bold capitalize">{user?.full_name || "Owner"}</span>
                    </p>
                </div>
            </div>

            {/* Stats Cards - Ikon dan Teks sudah disesuaikan ukurannya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <StatCard title="Total Pendapatan" value="Rp 15.750.000" icon={DollarSign} color="bg-blue-600" />
                <StatCard title="Total Transaksi" value="156" icon={ShoppingCart} color="bg-indigo-600" />
                <StatCard title="Pelanggan Aktif" value="89" icon={Users} color="bg-emerald-600" />
                <StatCard title="Pertumbuhan" value="+12.5%" icon={TrendingUp} color="bg-orange-600" />
            </div>

            {/* Laporan Singkat - Layout lebih rapi */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-black text-gray-800 tracking-[0.1em] uppercase mb-6">Ringkasan Laporan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Pendapatan</p>
                        <p className="text-lg font-black text-gray-800">Rp 15.750.000</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                            ↑ 12% <span className="text-gray-400 font-medium">vs bulan lalu</span>
                        </p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Transaksi</p>
                        <p className="text-lg font-black text-gray-800">156 Pesanan</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                            ↑ 8% <span className="text-gray-400 font-medium">vs bulan lalu</span>
                        </p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Outlet</p>
                        <p className="text-lg font-black text-gray-800">3 Lokasi</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-2 italic">Status: Berjalan Normal</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group overflow-hidden">
            {/* ICON CONTAINER - Ukuran diperkecil dari w-16 ke w-10 */}
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>

            <div className="flex flex-col min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-0.5 truncate">
                    {title}
                </p>
                <h3 className="font-black text-gray-800 leading-tight text-base">
                    {value}
                </h3>
            </div>
        </div>
    );
}