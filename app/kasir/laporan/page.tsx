"use client";

import { useCallback, useEffect, useState } from "react";
import { FaChartBar, FaCalendar, FaStore } from "react-icons/fa";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { resolveKasirOutletAccess } from "@/lib/kasirOutletAccess.mjs";
import {
  filterRowsByReportDate,
  getReportDateFilterYearOptions,
} from "@/lib/reportDateFilters.mjs";
import { formatReportDate } from "@/lib/reportDateFormat.mjs";
import { formatRupiah } from "@/utils";
import { exportToPDF } from "@/utils/exportPdf";
import { AnimatedPage } from "@/components/AnimatedPage";
import ReportDateFilters from "@/components/ReportDateFilters";
import Table from "@/components/table";
import Card, { StatsCard } from "@/components/card";
import ReportExportPdfButton from "@/components/ReportExportPdfButton";

interface LaporanHarian {
  tanggal: string;
  totalTransaksi: number;
  totalPendapatan: number;
}

interface OutletInfo {
  id: string;
  name: string;
}

interface ReportTransactionRow {
  id: string;
  transaction_date?: string;
  grand_total?: number | string;
  payment_status?: string;
  outlet_id?: string;
}

export default function LaporanKasirPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<LaporanHarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [outletInfo, setOutletInfo] = useState<OutletInfo | null>(null);
  const [noOutletAssigned, setNoOutletAssigned] = useState(false);
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [yearOptions, setYearOptions] = useState<string[]>([]);

  const loadOutletAndLaporan = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setNoOutletAssigned(false);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("outlet_id")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      const { data: outletRows } = await supabase
        .from("outlets")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      const outletAccess = resolveKasirOutletAccess(
        (outletRows as OutletInfo[]) || [],
        userData?.outlet_id,
      );

      if (!outletAccess.hasAssignedOutlet) {
        setNoOutletAssigned(true);
        setOutletInfo(null);
        setLaporan([]);
        setTotalPendapatan(0);
        setTotalTransaksi(0);
        setLoading(false);
        return;
      }

      setOutletInfo({
        id: outletAccess.outletId,
        name: outletAccess.displayLabel,
      });

      const { data, error } = await supabase
        .from("transactions")
        .select("id, transaction_date, grand_total, payment_status, outlet_id")
        .eq("outlet_id", outletAccess.outletId)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      const rows = ((data || []) as ReportTransactionRow[]);
      setYearOptions(getReportDateFilterYearOptions(rows));
      const filteredRows = filterRowsByReportDate(
        rows,
        {
          day: selectedDay,
          month: selectedMonth,
          year: selectedYear,
        },
      ) as ReportTransactionRow[];

      // Group by date
      const grouped: Record<string, LaporanHarian> = {};
      let totalPend = 0;

      filteredRows.forEach((trx) => {
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
      setTotalTransaksi(filteredRows.length);
      setLaporan(Object.values(grouped));
    } catch (error) {
      console.error("Error loading laporan:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, selectedMonth, selectedYear, user]);

  useEffect(() => {
    void loadOutletAndLaporan();
  }, [loadOutletAndLaporan]);

  // Fungsi Export PDF
  function handleExportPDF() {
    if (laporan.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    setExporting(true);
    try {
      exportToPDF({
        title: `Laporan Harian - ${outletInfo?.name || "Outlet"}`,
        subtitle: `Kasir: ${user?.full_name || "-"} | Outlet: ${outletInfo?.name || "-"} | Total Pendapatan: ${formatRupiah(totalPendapatan)} | Total Transaksi: ${totalTransaksi}`,
        filename: `laporan-kasir-${outletInfo?.name?.toLowerCase().replace(/\s+/g, "-") || "outlet"}-${new Date().toISOString().split("T")[0]}`,
        columns: [
          { key: "tanggal", label: "Tanggal" },
          { key: "totalTransaksi", label: "Jumlah Transaksi" },
          { key: "totalPendapatan", label: "Total Pendapatan" },
        ],
        data: laporan as unknown as Record<string, unknown>[],
        formatters: {
          tanggal: (v: unknown) => formatReportDate(String(v || "")),
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
        <span className="font-medium">
          {formatReportDate(String(value || ""))}
        </span>
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

  // If no outlet assigned
  if (!loading && noOutletAssigned) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-amber-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Belum Ada Toko Ditugaskan
          </h2>
          <p className="text-gray-500 text-sm">
            Anda belum ditugaskan ke toko manapun. Silakan hubungi Admin untuk
            mendapatkan penugasan toko.
          </p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Kasir</h1>
          <p className="text-gray-600">
            Ringkasan transaksi harian
            {outletInfo && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                <FaStore size={10} /> {outletInfo.name}
              </span>
            )}
          </p>
        </div>
        <ReportExportPdfButton
          onClick={handleExportPDF}
          disabled={loading || exporting || laporan.length === 0}
          exporting={exporting}
        />
      </div>

      <ReportDateFilters
        day={selectedDay}
        month={selectedMonth}
        year={selectedYear}
        yearOptions={yearOptions}
        onDayChange={setSelectedDay}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

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

      <Card icon={<FaCalendar />} title="Laporan Data Laundry" noPadding>
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <Table
            data={laporan}
            columns={columns}
            emptyMessage="Belum ada data laporan untuk outlet ini"
          />
        )}
      </Card>
    </AnimatedPage>
  );
}
