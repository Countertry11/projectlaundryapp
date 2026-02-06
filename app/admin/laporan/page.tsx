"use client";

import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaCalendar,
  FaDownload,
  FaStore,
  FaCalendarAlt,
  FaArrowLeft,
  FaFileExcel,
  FaFilePdf
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Import types & utils (disesuaikan dengan path proyek Anda)
import { LaporanHarian, LaporanPaket, LaporanBulanan } from "@/types";
import { formatRupiah, formatDate } from "@/utils";
import Table from "@/components/Table";
import Card, { StatsCard } from "@/components/Card";
import Button from "@/components/Button";

// Mock interface untuk Outlet [cite: 72-76]
interface Outlet {
  id: number;
  nama: string;
}

export default function LaporanAdminPage() {
  const router = useRouter();
  
  // State Logika Laporan
  const [laporanHarian, setLaporanHarian] = useState<LaporanHarian[]>([]);
  const [laporanPaket, setLaporanPaket] = useState<LaporanPaket[]>([]);
  const [laporanBulanan, setLaporanBulanan] = useState<LaporanBulanan[]>([]);
  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState<Outlet[]>([
    { id: 1, nama: "Outlet Surabaya Utama" },
    { id: 2, nama: "Outlet Malang Branch" }
  ]);
  const [selectedOutlet, setSelectedOutlet] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State Stats (Total Pendapatan & Transaksi) 
  const [totalPendapatan, setTotalPendapatan] = useState(1250000); 
  const [totalTransaksi, setTotalTransaksi] = useState(25);

  // Konfigurasi Kolom Tabel Detail (Disesuaikan dengan Gambar 2)
  const columnsHarian = [
    { 
      key: "tanggal", 
      label: "Tanggal", 
      render: (v: any) => <span className="font-medium text-gray-500">{v}</span> 
    },
    { key: "totalTransaksi", label: "Transaksi" },
    { 
      key: "totalPendapatan", 
      label: "Pendapatan", 
      render: (v: number) => <span className="font-bold text-gray-800">{formatRupiah(v)}</span> 
    },
    { 
      key: "totalBelumDibayar", 
      label: "Belum Dibayar",
      render: (v: number) => <span className="text-red-500 font-medium">{formatRupiah(v)}</span>
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-blue-600"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">Rekapitulasi Laporan</h1>
              <p className="text-gray-500 font-medium italic">Aplikasi Pengelolaan Laundry UKK</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Cabang [cite: 72] */}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
              <FaStore className="text-blue-500" />
              <select 
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Semua Cabang</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </div>

            {/* Tombol Ekspor */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="!rounded-2xl border-gray-200 font-bold text-blue-600 gap-2 hover:bg-blue-50"
                onClick={() => {}}
              >
                <FaFilePdf /> PDF
              </Button>
              <Button 
                className="!rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 shadow-lg shadow-emerald-100"
                onClick={() => {}}
              >
                <FaFileExcel /> Excel
              </Button>
            </div>
          </div>
        </div>

        {/* --- STATS SECTION (Model Card Gambar 1) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Pendapatan</p>
              <h3 className="text-4xl font-black text-gray-800 tracking-tight">{formatRupiah(totalPendapatan)}</h3>
            </div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaChartBar size={28} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Transaksi</p>
              <h3 className="text-4xl font-black text-gray-800 tracking-tight">{totalTransaksi} <span className="text-lg text-gray-400">Pesanan</span></h3>
            </div>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCalendar size={28} />
            </div>
          </div>
        </div>

        {/* --- MAIN TABLES SECTION --- */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Tabel Detail Harian (Lebar) */}
          <Card 
            icon={<FaCalendarAlt className="text-blue-600" />} 
            title="Detail Laporan Harian" 
            noPadding
            className="rounded-[2.5rem] shadow-xl overflow-hidden border-none"
          >
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Data Real-time Outlet</span>
               <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-gray-500">Tahun:</label>
                 <select 
                   className="bg-white border border-gray-200 rounded-xl px-3 py-1 text-xs font-bold outline-none"
                   value={selectedYear}
                   onChange={(e) => setSelectedYear(Number(e.target.value))}
                 >
                   <option>{new Date().getFullYear()}</option>
                   <option>{new Date().getFullYear() - 1}</option>
                 </select>
               </div>
            </div>
            <Table
              data={laporanHarian}
              columns={columnsHarian}
              loading={loading}
              emptyMessage="Pilih filter untuk menampilkan data laporan"
              className="!border-none"
            />
          </Card>

          {/* Laporan Per Paket */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card title="Laporan Per Paket" icon={<FaChartBar />} noPadding className="rounded-[2.5rem]">
                <Table 
                  data={laporanPaket} 
                  columns={[
                    { key: "nama_paket", label: "Paket", render: (v) => <span className="font-bold text-blue-600">{v}</span> },
                    { key: "jumlahTerjual", label: "Terjual" },
                    { key: "totalPendapatan", label: "Total", render: (v: number) => formatRupiah(v) }
                  ]}
                />
             </Card>

             <Card title="Laporan Bulanan" icon={<FaCalendarAlt />} noPadding className="rounded-[2.5rem]">
                <Table 
                  data={laporanBulanan} 
                  columns={[
                    { key: "bulan", label: "Bulan" },
                    { key: "totalTransaksi", label: "Transaksi" },
                    { key: "totalPendapatan", label: "Pendapatan", render: (v: number) => formatRupiah(v) }
                  ]}
                />
             </Card>
          </div>
        </div>

        <footer className="text-center pt-10 pb-4">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">
            UKK RPL 2026 • Laporan Administrasi Laundry
          </p>
        </footer>
      </div>
    </div>
  );
}