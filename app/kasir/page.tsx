"use client";

import React, { useState, useEffect } from "react";
import { Wallet, Layers, Clock, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils";
import Link from "next/link";

interface Transaction {
  id: string;
  invoice_number: string;
  customer: { name: string } | null;
  status: string;
  payment_status: string;
  grand_total: number;
}

export default function KasirDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    ready: 0,
    processing: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data: transData } = await supabase
        .from("transactions")
        .select(
          `
          id, invoice_number, status, payment_status, grand_total,
          customer:customers(name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: allTrans } = await supabase
        .from("transactions")
        .select("status, grand_total, payment_status");

      let pending = 0,
        ready = 0,
        processing = 0,
        revenue = 0;
      (allTrans || []).forEach((t) => {
        if (t.status === "pending") pending++;
        else if (t.status === "ready") ready++;
        else if (t.status === "processing") processing++;

        if (t.payment_status === "paid") {
          revenue += Number(t.grand_total) || 0;
        }
      });

      setStats({ pending, ready, processing, totalRevenue: revenue });
      setTransactions(transData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-blue-100 text-blue-600",
    processing: "bg-orange-100 text-orange-600",
    ready: "bg-purple-100 text-purple-600",
    completed: "bg-emerald-100 text-emerald-600",
  };

  const statusLabels: Record<string, string> = {
    pending: "BARU",
    processing: "PROSES",
    ready: "SIAP",
    completed: "SELESAI",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dashboard Kasir
          </h1>
          <p className="text-gray-500 text-sm">
            Selamat datang,{" "}
            <span className="capitalize font-semibold text-emerald-600">
              {user?.full_name}
            </span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Pesanan Baru"
          value={stats.pending.toString()}
          icon={Layers}
          color="bg-blue-600"
        />
        <StatCard
          title="Siap Ambil"
          value={stats.ready.toString()}
          icon={Check}
          color="bg-emerald-500"
        />
        <StatCard
          title="Proses Cuci"
          value={stats.processing.toString()}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Pendapatan"
          value={formatRupiah(stats.totalRevenue)}
          icon={Wallet}
          color="bg-purple-500"
          isCurrency={true}
        />
      </div>

      {/* Tabel Aktivitas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-800">Aktivitas Terkini</h2>
          <Link
            href="/kasir/transaksi"
            className="text-blue-600 text-sm font-bold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-widest border-b border-gray-50">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Pembayaran</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.length > 0 ? (
                  transactions.map((trx) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-6 py-5 font-bold text-blue-600">
                        {trx.invoice_number}
                      </td>
                      <td className="px-6 py-5 font-bold text-gray-900">
                        {trx.customer?.name || "-"}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-wider ${statusColors[trx.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {statusLabels[trx.status] ||
                            trx.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-wider border ${
                            trx.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                              : "bg-rose-50 text-rose-500 border-rose-100"
                          }`}
                        >
                          {trx.payment_status === "paid"
                            ? "LUNAS"
                            : "BELUM BAYAR"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-gray-900 text-right whitespace-nowrap">
                        {formatRupiah(trx.grand_total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400 italic"
                    >
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isCurrency,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  isCurrency?: boolean;
}) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group min-w-0">
      <div
        className={`w-14 h-14 md:w-16 md:h-16 rounded-[18px] ${color} flex items-center justify-center shrink-0 shadow-lg shadow-blue-100/50 group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
          {title}
        </p>
        <h3
          className={`font-black text-gray-800 leading-tight ${isCurrency ? "text-lg xl:text-xl" : "text-2xl"}`}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}
