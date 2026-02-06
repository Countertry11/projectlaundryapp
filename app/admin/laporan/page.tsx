"use client";

import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaCalendar,
  FaStore,
  FaCalendarAlt,
  FaArrowLeft,
  FaFilePdf,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils";
import { exportToPDF } from "@/utils/exportPdf";
import Table from "@/components/table";
import Card from "@/components/card";

interface LaporanHarian {
  tanggal: string;
  totalTransaksi: number;
  totalPendapatan: number;
  totalBelumDibayar: number;
}

interface Outlet {
  id: string;
  name: string;
}

export default function LaporanAdminPage() {
  const router = useRouter();

  const [laporanHarian, setLaporanHarian] = useState<LaporanHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string | "all">("all");

  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);

  useEffect(() => {
    fetchOutlets();
    fetchTransactions();
  }, [selectedOutlet]);

  async function fetchOutlets() {
    const { data } = await supabase.from("outlets").select("id, name");
    setOutlets(data || []);
  }

  async function fetchTransactions() {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("id, transaction_date, grand_total, payment_status")
        .order("transaction_date", { ascending: false });

      if (selectedOutlet !== "all") {
        query = query.eq("outlet_id", selectedOutlet);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate totals
      let pendapatan = 0;
      let belumDibayar = 0;
      const grouped: Record<string, LaporanHarian> = {};

      (data || []).forEach((trx) => {
        const tanggal = trx.transaction_date?.split("T")[0] || "Unknown";
        pendapatan += Number(trx.grand_total) || 0;

        if (trx.payment_status !== "paid") {
          belumDibayar += Number(trx.grand_total) || 0;
        }

        if (!grouped[tanggal]) {
          grouped[tanggal] = {
            tanggal,
            totalTransaksi: 0,
            totalPendapatan: 0,
            totalBelumDibayar: 0,
          };
        }
        grouped[tanggal].totalTransaksi += 1;
        grouped[tanggal].totalPendapatan += Number(trx.grand_total) || 0;
        if (trx.payment_status !== "paid") {
          grouped[tanggal].totalBelumDibayar += Number(trx.grand_total) || 0;
        }
      });

      setTotalPendapatan(pendapatan);
      setTotalTransaksi(data?.length || 0);
      setLaporanHarian(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fungsi Export PDF
  function handleExportPDF() {
    if (laporanHarian.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    setExporting(true);
    try {
      const outletName =
        selectedOutlet === "all"
          ? "Semua Cabang"
          : outlets.find((o) => o.id === selectedOutlet)?.name || "Unknown";

      exportToPDF({
        title: "Laporan Harian Laundry",
        subtitle: `Outlet: ${outletName} | Total Pendapatan: ${formatRupiah(totalPendapatan)} | Total Transaksi: ${totalTransaksi}`,
        filename: `laporan-harian-${new Date().toISOString().split("T")[0]}`,
        columns: [
          { key: "tanggal", label: "Tanggal" },
          { key: "totalTransaksi", label: "Jumlah Transaksi" },
          { key: "totalPendapatan", label: "Total Pendapatan" },
          { key: "totalBelumDibayar", label: "Belum Dibayar" },
        ],
        data: laporanHarian as unknown as Record<string, unknown>[],
        formatters: {
          totalPendapatan: (v: unknown) => formatRupiah(Number(v)),
          totalBelumDibayar: (v: unknown) => formatRupiah(Number(v)),
        },
      });

      alert("PDF berhasil diunduh!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengekspor PDF!");
    } finally {
      setExporting(false);
    }
  }

  const columnsHarian = [
    {
      key: "tanggal",
      label: "Tanggal",
      render: (v: unknown) => (
        <span className="font-medium text-gray-500">{String(v)}</span>
      ),
    },
    { key: "totalTransaksi", label: "Transaksi" },
    {
      key: "totalPendapatan",
      label: "Pendapatan",
      render: (v: unknown) => (
        <span className="font-bold text-gray-800">
          {formatRupiah(Number(v))}
        </span>
      ),
    },
    {
      key: "totalBelumDibayar",
      label: "Belum Dibayar",
      render: (v: unknown) => (
        <span className="text-red-500 font-medium">
          {formatRupiah(Number(v))}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-blue-600"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                Rekapitulasi Laporan
              </h1>
              <p className="text-gray-500 font-medium italic">
                Aplikasi Pengelolaan Laundry UKK
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Cabang */}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
              <FaStore className="text-blue-500" />
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">Semua Cabang</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={loading || exporting || laporanHarian.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 font-bold text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <FaFilePdf />
              )}
              {exporting ? "Mengekspor..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Total Pendapatan
              </p>
              <h3 className="text-4xl font-black text-gray-800 tracking-tight">
                {formatRupiah(totalPendapatan)}
              </h3>
            </div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaChartBar size={28} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-all">
            <div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Total Transaksi
              </p>
              <h3 className="text-4xl font-black text-gray-800 tracking-tight">
                {totalTransaksi}{" "}
                <span className="text-lg text-gray-400">Pesanan</span>
              </h3>
            </div>
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCalendar size={28} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <Card
          icon={<FaCalendarAlt className="text-blue-600" />}
          title="Detail Laporan Harian"
          noPadding
          className="rounded-3xl shadow-xl overflow-hidden border-none"
        >
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : (
            <Table
              data={laporanHarian}
              columns={columnsHarian}
              emptyMessage="Belum ada data transaksi"
            />
          )}
        </Card>

        <footer className="text-center pt-10 pb-4">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.6em]">
            UKK RPL 2026 • Laporan Administrasi Laundry
          </p>
        </footer>
      </div>
    </div>
  );
}
