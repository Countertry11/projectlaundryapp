"use client";

import React from "react";
import { Wallet, Layers, Clock, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Data Dummy sesuai screenshot Aktivitas Terkini
const recentTransactions = [
    { invoice: "INV-2026001", member: "Budi Santoso", paket: "Kiloan (5kg)", status: "baru", bayar: "lunas", total: 35000 },
    { invoice: "INV-2026002", member: "Siti Aminah", paket: "Bed Cover", status: "proses", bayar: "lunas", total: 50000 },
    { invoice: "INV-2026003", member: "Doni Tata", paket: "Kaos", status: "selesai", bayar: "belum bayar", total: 15000 },
    { invoice: "INV-2026004", member: "Rina Nose", paket: "Kiloan (3kg)", status: "diambil", bayar: "lunas", total: 21000 },
    { invoice: "INV-2026005", member: "Joko", paket: "Selimut", status: "baru", bayar: "belum bayar", total: 25000 },
];

export default function AdminDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8 text-slate-800 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Admin</h1>
                    <p className="text-gray-500 text-sm">Selamat datang, <span className="capitalize font-semibold text-blue-600">{user?.full_name}</span></p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard title="Pesanan Baru" value="12" icon={Layers} color="bg-blue-600" />
                <StatCard title="Siap Ambil" value="5" icon={Check} color="bg-emerald-500" />
                <StatCard title="Proses Cuci" value="8" icon={Clock} color="bg-orange-500" />
                <StatCard title="Pendapatan" value="Rp 1.250.000" icon={Wallet} color="bg-purple-500" isCurrency={true} />
            </div>

            {/* Tabel Aktivitas Terkini */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-bold text-gray-800">Aktivitas Terkini</h2>
                    <button className="text-blue-600 text-sm font-bold hover:underline">Lihat Semua</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-widest border-b border-gray-50">
                            <tr>
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Pelanggan</th>
                                <th className="px-6 py-4">Paket</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Pembayaran</th>
                                <th className="px-6 py-4 text-right">Total Bayar</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentTransactions.map((trx, index) => (
                                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-5 font-bold text-blue-600">{trx.invoice}</td>
                                    <td className="px-6 py-5 font-bold text-gray-900">{trx.member}</td>
                                    <td className="px-6 py-5 text-gray-500">{trx.paket}</td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider ${trx.status === 'baru' ? 'bg-blue-100 text-blue-600' :
                                                trx.status === 'proses' ? 'bg-orange-100 text-orange-600' :
                                                    trx.status === 'selesai' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {trx.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-wider border ${trx.bayar === 'lunas' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                            }`}>
                                            {trx.bayar === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-black text-gray-900 text-right whitespace-nowrap">
                                        Rp {trx.total.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button className="text-gray-400 hover:text-blue-600 font-bold text-xs">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, isCurrency }: { title: string; value: string; icon: React.ElementType; color: string; isCurrency?: boolean }) {
    return (
        <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group min-w-0">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[18px] ${color} flex items-center justify-center shrink-0 shadow-lg shadow-blue-100/50 group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                    {title}
                </p>
                <h3 className={`font-black text-gray-800 leading-tight ${isCurrency ? 'text-lg xl:text-xl' : 'text-2xl'}`}>
                    {value}
                </h3>
            </div>
        </div>
    );
}
