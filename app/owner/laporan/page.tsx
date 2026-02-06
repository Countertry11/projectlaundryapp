"use client";

import React, { useState } from "react";
import { 
  FileText, Download, Printer, TrendingUp, 
  ChevronRight, Calendar, Search, Store,
  ArrowUpRight, BarChart3
} from "lucide-react";

export default function LaporanOwnerPage() {
    const [filterOutlet, setFilterOutlet] = useState("semua");

    // Data Mock Laporan Owner (Agregasi dari tb_transaksi & tb_outlet)
    const reports = [
        { id: 1, outlet: "Outlet Pusat", pendapatan: 5400000, transaksi: 42, tgl: "Jan 2026" },
        { id: 2, outlet: "Outlet Cabang A", pendapatan: 3200000, transaksi: 28, tgl: "Jan 2026" },
        { id: 3, outlet: "Outlet Cabang B", pendapatan: 1500000, transaksi: 12, tgl: "Jan 2026" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 text-slate-800 font-sans">
            
            {/* Header - Ringkas & Profesional */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-100">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-800 tracking-tight">Laporan Manajerial</h1>
                        <p className="text-gray-400 text-[11px] font-medium">Analisis pendapatan seluruh cabang laundry.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all">
                        <Printer size={14} /> Cetak
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-100 transition-all">
                        <Download size={14} /> Export Excel
                    </button>
                </div>
            </div>

            {/* Filter Panel - Slim Design */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <select 
                            className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={filterOutlet}
                            onChange={(e) => setFilterOutlet(e.target.value)}
                        >
                            <option value="semua">Semua Outlet</option>
                            <option value="pusat">Outlet Pusat</option>
                            <option value="cabang_a">Outlet Cabang A</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <input type="date" className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none px-2" />
                        <ChevronRight size={14} className="text-gray-300" />
                        <input type="date" className="bg-transparent border-none text-[11px] font-bold text-gray-600 outline-none px-2" />
                    </div>
                    <button className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                        Filter Data
                    </button>
                </div>
            </div>

            {/* Main Content: Table Laporan */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Rekapitulasi Per Cabang</h3>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input type="text" placeholder="Cari outlet..." className="bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold outline-none focus:border-blue-500/50 w-48" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Nama Outlet</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Periode</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Total Transaksi</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Total Pendapatan</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports.map((report) => (
                                <tr key={report.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                {report.outlet.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-gray-800">{report.outlet}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-[11px] font-medium text-gray-500">{report.tgl}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black">
                                            {report.transaksi} Order
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-xs font-black text-gray-800">Rp {report.pendapatan.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-tight flex items-center gap-1 justify-end ml-auto">
                                            Detail <ArrowUpRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white">
                                <td colSpan={3} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Konsolidasi Seluruh Outlet</td>
                                <td className="px-6 py-4 text-right text-sm font-black text-blue-400">Rp 10.100.000</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}