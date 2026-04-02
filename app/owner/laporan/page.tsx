"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Printer, Search, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  filterRowsByReportDate,
  getReportDateFilterYearOptions,
} from "@/lib/reportDateFilters.mjs";
import { formatCurrentReportDate } from "@/lib/reportDateFormat.mjs";
import { buildOwnerReportPrintHtml } from "@/lib/ownerReportPrint.mjs";
import { formatRupiah } from "@/utils";
import { exportToPDF } from "@/utils/exportPdf";
import { AnimatedPage, AnimatedItem } from "@/components/AnimatedPage";
import ReportDateFilters from "@/components/ReportDateFilters";
import ReportExportPdfButton from "@/components/ReportExportPdfButton";

interface OutletReport {
  id: string;
  name: string;
  totalTransaksi: number;
  totalPendapatan: number;
}

interface OwnerTransactionRow {
  id: string;
  grand_total?: number | string;
  outlet_id?: string;
  transaction_date?: string;
}

export default function LaporanOwnerPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [outlets, setOutlets] = useState<OutletReport[]>([]);
  const [totalGlobal, setTotalGlobal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const printableReportRef = useRef<HTMLDivElement | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all outlets
      const { data: outletData } = await supabase
        .from("outlets")
        .select("id, name");

      // Fetch all transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("id, grand_total, outlet_id, transaction_date");

      const transactionRows = ((transData || []) as OwnerTransactionRow[]);
      setYearOptions(getReportDateFilterYearOptions(transactionRows));
      const filteredTransactions = filterRowsByReportDate(
        transactionRows,
        {
          day: selectedDay,
          month: selectedMonth,
          year: selectedYear,
        },
      ) as OwnerTransactionRow[];

      // Aggregate by outlet
      const outletMap: Record<string, OutletReport> = {};
      let total = 0;

      (outletData || []).forEach((outlet) => {
        outletMap[outlet.id] = {
          id: outlet.id,
          name: outlet.name,
          totalTransaksi: 0,
          totalPendapatan: 0,
        };
      });

      filteredTransactions.forEach((trx) => {
        total += Number(trx.grand_total) || 0;
        if (trx.outlet_id && outletMap[trx.outlet_id]) {
          outletMap[trx.outlet_id].totalTransaksi += 1;
          outletMap[trx.outlet_id].totalPendapatan +=
            Number(trx.grand_total) || 0;
        }
      });

      // Also include transactions without outlet_id in a default report
      const transWithoutOutlet = filteredTransactions.filter(
        (t) => !t.outlet_id || !outletMap[t.outlet_id],
      );
      if (transWithoutOutlet.length > 0) {
        outletMap["default"] = {
          id: "default",
          name: "Outlet Utama",
          totalTransaksi: transWithoutOutlet.length,
          totalPendapatan: transWithoutOutlet.reduce(
            (sum, t) => sum + (Number(t.grand_total) || 0),
            0,
          ),
        };
      }

      setOutlets(Object.values(outletMap).filter((o) => o.totalTransaksi > 0));
      setTotalGlobal(total);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  // Fungsi Export PDF
  function handleExportPDF() {
    if (outlets.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    setExporting(true);
    try {
      exportToPDF({
        title: "Laporan Manajemen Toko - Rekapitulasi Per Cabang",
        subtitle: `Total Pendapatan Konsolidasi: ${formatRupiah(totalGlobal)}`,
        filename: `laporan-owner-${new Date().toISOString().split("T")[0]}`,
        columns: [
          { key: "name", label: "Nama Outlet" },
          { key: "totalTransaksi", label: "Total Transaksi" },
          { key: "totalPendapatan", label: "Total Pendapatan" },
        ],
        data: outlets as unknown as Record<string, unknown>[],
        formatters: {
          totalPendapatan: (v: unknown) => formatRupiah(Number(v)),
          totalTransaksi: (v: unknown) => `${v} Order`,
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

  function handlePrintReport() {
    if (!printableReportRef.current) {
      alert("Area laporan tidak ditemukan.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1024,height=768");

    if (!printWindow) {
      alert("Gagal membuka jendela cetak. Pastikan popup tidak diblokir browser.");
      return;
    }

    const subtitle = `Total Pendapatan Konsolidasi: ${formatRupiah(totalGlobal)}`;
    const html = buildOwnerReportPrintHtml({
      title: "Laporan Manajemen Toko - Rekapitulasi Per Cabang",
      subtitle,
      printedAt: formatCurrentReportDate(new Date()),
      contentHtml: printableReportRef.current.innerHTML,
    });

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  const filteredOutlets = outlets.filter((o) =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AnimatedPage className="owner-report-print-page min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="owner-report-print-hide flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 gap-4 animate-scaleIn">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-100 animate-scaleIn" style={{ animationDelay: '100ms' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-800 tracking-tight animate-slideInRight" style={{ animationDelay: '200ms' }}>
              Laporan Toko
            </h1>
            <p className="text-gray-400 text-[11px] font-medium animate-slideInRight" style={{ animationDelay: '300ms' }}>
              Analisis pendapatan seluruh cabang laundry.
            </p>
          </div>
        </div>
        <div className="flex gap-2 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all"
          >
            <Printer size={14} /> Cetak
          </button>
          <ReportExportPdfButton
            onClick={handleExportPDF}
            disabled={loading || exporting || outlets.length === 0}
            exporting={exporting}
          />
        </div>
      </div>

      {/* Main Table */}
      <AnimatedItem
        animation="fadeInUp"
        style={{ animationDelay: '500ms' }}
        className="owner-report-print-region bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="owner-report-print-only hidden px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-black text-gray-800">Laporan Toko</h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Rekapitulasi per cabang laundry
          </p>
        </div>
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Rekapitulasi Per Cabang
            </h3>
            <div className="owner-report-print-hide flex flex-col gap-3 md:items-end">
              <ReportDateFilters
                day={selectedDay}
                month={selectedMonth}
                year={selectedYear}
                yearOptions={yearOptions}
                onDayChange={setSelectedDay}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={12}
                />
                <input
                  type="text"
                  placeholder="Cari Toko..."
                  className="bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-1.5 text-[10px] font-bold outline-none focus:border-blue-500/50 w-48 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div ref={printableReportRef} className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Nama Toko
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">
                    Total Transaksi
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                    Total Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOutlets.length > 0 ? (
                  filteredOutlets.map((report, index) => (
                    <AnimatedItem
                      as="tr"
                      key={report.id}
                      animation="slideInLeft"
                      index={index}
                      staggerDelay={50}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                            {report.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-800">
                            {report.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black">
                          {report.totalTransaksi} Order
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-black text-gray-800">
                          {formatRupiah(report.totalPendapatan)}
                        </span>
                      </td>
                    </AnimatedItem>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-gray-400 italic font-medium"
                    >
                      Belum ada data transaksi
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredOutlets.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                    >
                      Total Pendapatan
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-black text-blue-400">
                      {formatRupiah(totalGlobal)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </AnimatedItem>
    </AnimatedPage>
  );
}
