"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Layers,
  Loader2,
  TrendingUp,
  Users,
  ShoppingBag,
  Calendar,
  ArrowRight,
  RefreshCw,
  Search,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils";
import Link from "next/link";
import { AnimatedPage, AnimatedItem, StaggeredList, CountUp } from "@/components/AnimatedPage";

interface Transaction {
  id: string;
  invoice_number: string;
  customer: { name: string } | null;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at?: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,        // Total semua pesanan/transaksi
    totalTransactions: 0,   // Total transaksi (sama dengan totalOrders)
    totalCustomers: 0,      // Total pelanggan
    totalRevenue: 0,        // Total pendapatan
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch recent transactions
      const { data: transDataRaw } = await supabase
        .from("transactions")
        .select(
          `
          id, invoice_number, status, payment_status, grand_total, created_at,
          customer:customers(name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(8);

      const transData = transDataRaw?.map((item: any) => ({
        ...item,
        customer: Array.isArray(item.customer) ? item.customer[0] || null : item.customer,
      }));

      // Calculate stats
      const { data: allTrans } = await supabase
        .from("transactions")
        .select("grand_total, payment_status");

      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      let revenue = 0;

      (allTrans || []).forEach((t) => {
        // Hitung pendapatan dari yang sudah dibayar
        if (t.payment_status === "paid") {
          revenue += Number(t.grand_total) || 0;
        }
      });

      setStats({
        totalOrders: allTrans?.length || 0,
        totalTransactions: allTrans?.length || 0,
        totalCustomers: customerCount || 0,
        totalRevenue: revenue,
      });
      setTransactions((transData as Transaction[]) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Filter transactions berdasarkan search query
  const filteredTransactions = transactions.filter(trx =>
    trx.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trx.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    pending: "bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 border border-blue-200",
    processing: "bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-700 border border-orange-200",
    ready: "bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border border-purple-200",
    completed: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200",
    cancelled: "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200",
  };

  const statusLabels: Record<string, string> = {
    pending: "BARU",
    processing: "PROSES",
    ready: "SIAP",
    completed: "SELESAI",
    cancelled: "BATAL",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8 space-y-6 font-sans">

      {/* 4 StatCards Utama: Pesanan, Total Transaksi, Pelanggan, Total Pendapatan */}
      <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" animation="scaleIn">
        <StatCard
          title="Total Pesanan"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="bg-gradient-to-br from-blue-600 to-blue-700"
          trend="Semua pesanan"
          subtitle="Total seluruh pesanan"
        />
        <StatCard
          title="Total Transaksi"
          value={stats.totalTransactions}
          icon={TrendingUp}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          trend="Semua transaksi"
          subtitle="Total seluruh transaksi"
        />
        <StatCard
          title="Total Pelanggan"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          trend="Terdaftar"
          subtitle="Jumlah pelanggan"
        />
        <StatCard
          title="Total Pendapatan"
          value={stats.totalRevenue}
          icon={Wallet}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          isCurrency={true}
          trend="Pendapatan"
          subtitle="Dari transaksi lunas"
        />
      </StaggeredList>

      {/* Transactions Table */}
      <AnimatedItem index={5} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-100/20 border border-white/50 overflow-hidden max-w-6xl mx-auto">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Aktivitas Terkini</h2>
              <p className="text-xs text-gray-500"></p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Cari invoice atau pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all w-full sm:w-72 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white/50">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
            <p className="text-sm text-gray-500 animate-pulse">Memuat data transaksi...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pembayaran</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx, index) => (
                    <tr
                      key={trx.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group table-row-animated"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                            {trx.invoice_number}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(trx.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {trx.customer?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {trx.customer?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider shadow-sm ${statusColors[trx.status] || statusColors.pending}`}
                        >
                          {statusLabels[trx.status] || trx.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-wider shadow-sm ${trx.payment_status === "paid"
                            ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200"
                            : "bg-gradient-to-r from-rose-50 to-rose-100/80 text-rose-700 border border-rose-200"
                            }`}
                        >
                          {trx.payment_status === "paid" ? "✓ LUNAS" : "⏱ BELUM BAYAR"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-800">
                          {formatRupiah(trx.grand_total)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">
                          {searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada transaksi'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {searchQuery ? 'Coba kata kunci lain' : 'Transaksi akan muncul di sini'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedItem>
    </AnimatedPage>
  );
}

// StatCard Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  isCurrency,
  trend,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  isCurrency?: boolean;
  trend?: string;
  subtitle?: string;
}) {
  return (
    <div className="group relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6 text-white animate-pulse-soft" />
          </div>
          {trend && (
            <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              {trend}
            </span>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <h3
            className={`font-bold text-gray-800 leading-tight ${isCurrency ? "text-base xl:text-lg" : "text-xl xl:text-2xl"
              }`}
          >
            {isCurrency ? (
              <CountUp end={value} formatter={(v) => formatRupiah(v)} />
            ) : (
              <CountUp end={value} />
            )}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}