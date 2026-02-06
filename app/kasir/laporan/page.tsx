"use client";

import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaCalendar,
  FaDownload,
  FaStore,
  FaCalendarAlt,
} from "react-icons/fa";
import { LaporanHarian, LaporanBulanan } from "@/types";
import { laporanService } from "@/services";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatRupiah, formatDate } from "@/utils";
import { exportToPDF } from "@/utils/exportPdf";
import Table from "@/components/Table";
import Card, { StatsCard } from "@/components/Card";
import Button from "@/components/Button";

export default function LaporanKasirPage() {
  const [laporan, setLaporan] = useState<LaporanHarian[]>([]);
  const [laporanBulanan, setLaporanBulanan] = useState<LaporanBulanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalPendapatan, setTotalPendapatan] = useState(0);
  const [totalTransaksi, setTotalTransaksi] = useState(0);
  const [outletName, setOutletName] = useState("");
  const [outletId, setOutletId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadLaporan();
  }, []);

  useEffect(() => {
    if (outletId !== null) {
      loadLaporanBulanan();
    }
  }, [selectedYear, outletId]);

  const loadLaporan = async () => {
    try {
      setLoading(true);

      // Get current user's outlet
      const { dbUser } = await getCurrentUser();
      const userOutletId = dbUser?.id_outlet;
      setOutletId(userOutletId || null);

      // Get outlet name
      if (userOutletId) {
        const { data: outlet } = await supabase
          .from("tb_outlet")
          .select("nama")
          .eq("id", userOutletId)
          .single();
        if (outlet) setOutletName(outlet.nama);
      }

      // Load laporan filtered by outlet
      const data = await laporanService.getHarian(
        userOutletId ? { id_outlet: userOutletId } : undefined
      );
      setLaporan(data);

      const totPendapatan = data.reduce((sum, l) => sum + l.totalPendapatan, 0);
      const totTransaksi = data.reduce((sum, l) => sum + l.totalTransaksi, 0);
      setTotalPendapatan(totPendapatan);
      setTotalTransaksi(totTransaksi);

      // Load laporan bulanan
      if (userOutletId) {
        const bulanan = await laporanService.getBulanan(
          selectedYear,
          userOutletId
        );
        setLaporanBulanan(bulanan);
      }
    } catch (error) {
      console.error("Error loading laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLaporanBulanan = async () => {
    try {
      const bulanan = await laporanService.getBulanan(
        selectedYear,
        outletId || undefined
      );
      setLaporanBulanan(bulanan);
    } catch (error) {
      console.error("Error loading laporan bulanan:", error);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    try {
      exportToPDF({
        title: "Laporan Kasir",
        subtitle: `Total Pendapatan: ${formatRupiah(totalPendapatan)} | Total Transaksi: ${totalTransaksi}`,
        filename: `laporan-kasir-${new Date().toISOString().split("T")[0]}`,
        columns: [
          { key: "tanggal", label: "Tanggal" },
          { key: "totalTransaksi", label: "Transaksi" },
          { key: "totalPendapatan", label: "Pendapatan" },
        ],
        data: laporan as unknown as Record<string, unknown>[],
        formatters: {
          tanggal: (v: unknown) => formatDate(v as string),
          totalPendapatan: (v: unknown) => formatRupiah(v as number),
        },
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      key: "tanggal",
      label: "Tanggal",
      sortable: true,
      render: (value: unknown) => formatDate(value as string),
    },
    { key: "totalTransaksi", label: "Transaksi", sortable: true },
    {
      key: "totalPendapatan",
      label: "Pendapatan",
      sortable: true,
      render: (value: unknown) => formatRupiah(value as number),
    },
  ];

  const columnsBulanan = [
    { key: "bulan", label: "Bulan", sortable: true },
    { key: "totalTransaksi", label: "Total Transaksi", sortable: true },
    {
      key: "totalPendapatan",
      label: "Total Pendapatan",
      sortable: true,
      render: (value: unknown) => formatRupiah(value as number),
    },
    {
      key: "rataRataPerHari",
      label: "Rata-rata/Hari",
      sortable: true,
      render: (value: unknown) => formatRupiah(value as number),
    },
  ];

  // Generate year options (5 years back from current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Kasir</h1>
          <p className="text-gray-600">
            Ringkasan transaksi harian dan bulanan
            {outletName && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <FaStore className="inline mr-1" />
                {outletName}
              </span>
            )}
          </p>
        </div>
        <Button
          icon={<FaDownload />}
          variant="outline"
          onClick={handleExportPDF}
          disabled={loading || exporting}
        >
          {exporting ? "Mengekspor..." : "Ekspor PDF"}
        </Button>
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
        <Table
          data={laporan}
          columns={columns}
          loading={loading}
          emptyMessage="Belum ada data laporan"
        />
      </Card>

      {/* Monthly Report Section */}
      <Card icon={<FaCalendarAlt />} title="Laporan Bulanan" noPadding>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table
          data={laporanBulanan}
          columns={columnsBulanan}
          loading={loading}
          emptyMessage={`Belum ada data laporan untuk tahun ${selectedYear}`}
        />
      </Card>
    </div>
  );
}