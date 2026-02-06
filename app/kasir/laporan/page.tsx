"use client";

import { useState, useEffect } from "react";
import { FaChartBar, FaCalendar, FaDownload, FaFilePdf } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatRupiah } from "@/utils";
import { exportToPDF } from "@/utils/exportPdf";
import Table from "@/components/table";
import Card, { StatsCard } from "@/components/card";

interface LaporanHarian {
  tanggal: string;
  totalTransaksi: number;
  totalPendapatan: number;
}

export default function LaporanKasirPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<LaporanHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);

  useEffect(() => {
    loadLaporan();
  }, []);

  const loadLaporan = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select("id, transaction_date, grand_total, payment_status")
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, LaporanHarian> = {};
      let totalPend = 0;

      (data || []).forEach((trx) => {
        const tanggal = trx.transaction_date?.split("T")[0] || "Unknown";
        totalPend += Number(trx.grand_total) || 0;

        if (!grouped[tanggal]) {
          grouped[tanggal] = {
            tanggal,
            totalTransaksi: 0,
            totalPendapatan: 0,
          };
        }
        grouped[tanggal].totalTransaksi += 1;
        grouped[tanggal].totalPendapatan += Number(trx.grand_total) || 0;
      });

      setTotalPendapatan(totalPend);
      setTotalTransaksi(data?.length || 0);
      setLaporan(Object.values(grouped));
    } catch (error) {
      console.error("Error loading laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Export PDF
  function handleExportPDF() {
    if (laporan.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    setExporting(true);
    try {
      exportToPDF({
        title: "Laporan Harian Kasir",
        subtitle: `Kasir: ${user?.full_name || "-"} | Total Pendapatan: ${formatRupiah(totalPendapatan)} | Total Transaksi: ${totalTransaksi}`,
        filename: `laporan-kasir-${new Date().toISOString().split("T")[0]}`,
        columns: [
          { key: "tanggal", label: "Tanggal" },
          { key: "totalTransaksi", label: "Jumlah Transaksi" },
          { key: "totalPendapatan", label: "Total Pendapatan" },
        ],
        data: laporan as unknown as Record<string, unknown>[],
        formatters: {
          totalPendapatan: (v: unknown) => formatRupiah(Number(v)),
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

  const columns = [
    {
      key: "tanggal",
      label: "Tanggal",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-medium">{String(value)}</span>
      ),
    },
    { key: "totalTransaksi", label: "Transaksi", sortable: true },
    {
      key: "totalPendapatan",
      label: "Pendapatan",
      sortable: true,
      render: (value: unknown) => (
        <span className="font-bold text-blue-600">
          {formatRupiah(Number(value))}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Kasir</h1>
          <p className="text-gray-600">Ringkasan transaksi harian</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={loading || exporting || laporan.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <FaFilePdf className="text-red-500" />
          )}
          {exporting ? "Mengekspor..." : "Export PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Total Pendapatan"
          value={formatRupiah(totalPendapatan)}
          icon={<FaChartBar />}
          color="blue"
        />
        <StatsCard
          title="Total Transaksi"
          value={totalTransaksi.toString()}
          icon={<FaCalendar />}
          color="green"
        />
      </div>

      <Card icon={<FaCalendar />} title="Laporan Harian" noPadding>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <Table
            data={laporan}
            columns={columns}
            emptyMessage="Belum ada data laporan"
          />
        )}
      </Card>
    </div>
  );
}
