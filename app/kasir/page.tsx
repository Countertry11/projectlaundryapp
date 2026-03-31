"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Layers,
  Loader2,
  Receipt,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  AnimatedItem,
  AnimatedPage,
  StaggeredList,
} from "@/components/AnimatedPage";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { useAuth } from "@/context/AuthContext";
import { resolveKasirOutletAccess } from "@/lib/kasirOutletAccess.mjs";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils";

interface Transaction {
  id: string;
  invoice_number: string;
  customer: { name: string } | null;
  status: string;
  payment_status: string;
  grand_total: number;
  created_at?: string;
}

interface OutletInfo {
  id: string;
  name: string;
}

type TransactionRow = Omit<Transaction, "customer"> & {
  customer: { name: string } | Array<{ name: string }> | null;
};

const initialStats = {
  totalOrders: 0,
  totalTransactions: 0,
  totalCustomers: 0,
  totalRevenue: 0,
};

export default function KasirDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [outletInfo, setOutletInfo] = useState<OutletInfo | null>(null);
  const [hasAssignedOutlet, setHasAssignedOutlet] = useState(true);
  const [stats, setStats] = useState(initialStats);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("outlet_id")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      const { data: outletRows, error: outletError } = await supabase
        .from("outlets")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (outletError) throw outletError;

      const outletAccess = resolveKasirOutletAccess(
        (outletRows as OutletInfo[]) || [],
        userData?.outlet_id,
      );

      if (!outletAccess.hasAssignedOutlet) {
        setHasAssignedOutlet(false);
        setOutletInfo(null);
        setTransactions([]);
        setStats(initialStats);
        return;
      }

      setHasAssignedOutlet(true);
      setOutletInfo({
        id: outletAccess.outletId,
        name: outletAccess.displayLabel,
      });

      const [recentTransactionsResult, statsResult] = await Promise.all([
        supabase
          .from("transactions")
          .select(
            `
            id,
            invoice_number,
            status,
            payment_status,
            grand_total,
            created_at,
            customer:customers(name)
          `,
          )
          .eq("outlet_id", outletAccess.outletId)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("transactions")
          .select("customer_id, grand_total, payment_status")
          .eq("outlet_id", outletAccess.outletId),
      ]);

      if (recentTransactionsResult.error) throw recentTransactionsResult.error;
      if (statsResult.error) throw statsResult.error;

      const nextStats = (statsResult.data || []).reduce(
        (accumulator, transaction) => {
          accumulator.totalOrders += 1;
          accumulator.totalTransactions += 1;
          if (transaction.customer_id) {
            accumulator.customerIds.add(String(transaction.customer_id));
          }
          if (transaction.payment_status === "paid") {
            accumulator.totalRevenue += Number(transaction.grand_total) || 0;
          }
          return accumulator;
        },
        {
          ...initialStats,
          customerIds: new Set<string>(),
        },
      );

      const formattedTransactions = (
        (recentTransactionsResult.data as TransactionRow[]) || []
      ).map((transaction) => ({
        ...transaction,
        customer: Array.isArray(transaction.customer)
          ? transaction.customer[0] || null
          : transaction.customer,
      }));

      setStats({
        totalOrders: nextStats.totalOrders,
        totalTransactions: nextStats.totalTransactions,
        totalCustomers: nextStats.customerIds.size,
        totalRevenue: nextStats.totalRevenue,
      });
      setTransactions(formattedTransactions as Transaction[]);
    } catch (error) {
      console.error("Error fetching kasir dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredTransactions = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.invoice_number?.toLowerCase().includes(query) ||
      transaction.customer?.name?.toLowerCase().includes(query)
    );
  });

  const statusColors: Record<string, string> = {
    pending:
      "border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700",
    processing:
      "border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100/80 text-orange-700",
    ready:
      "border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700",
    completed:
      "border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700",
  };

  const statusLabels: Record<string, string> = {
    pending: "BARU",
    processing: "PROSES",
    ready: "SIAP",
    completed: "SELESAI",
  };

  function formatDate(dateString?: string) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!loading && !hasAssignedOutlet) {
    return (
      <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="text-amber-600" size={32} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">
              Belum Ada Toko Ditugaskan
            </h2>
            <p className="text-sm text-gray-500">
              Dashboard kasir hanya menampilkan outlet yang ditugaskan ke akun
              ini. Silakan hubungi admin untuk menetapkan toko terlebih dahulu.
            </p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 font-sans md:p-8">
      <div className="space-y-6">
        <StaggeredList
          className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          animation="scaleIn"
        >
          <DashboardStatCard
            title="Total Pesanan"
            value={stats.totalOrders}
            icon={ShoppingBag}
            tone="blue"
            trend="Semua pesanan"
            subtitle="Total seluruh pesanan outlet"
          />
          <DashboardStatCard
            title="Total Transaksi"
            value={stats.totalTransactions}
            icon={TrendingUp}
            tone="indigo"
            trend="Semua transaksi"
            subtitle="Total seluruh transaksi outlet"
          />
          <DashboardStatCard
            title="Total Pelanggan"
            value={stats.totalCustomers}
            icon={Users}
            tone="pink"
            trend="Terdaftar"
            subtitle="Pelanggan yang pernah transaksi di outlet"
          />
          <DashboardStatCard
            title="Total Pendapatan"
            value={stats.totalRevenue}
            icon={Wallet}
            tone="purple"
            trend="Lunas"
            subtitle="Dari transaksi lunas di outlet"
            isCurrency
          />
        </StaggeredList>

        <AnimatedItem index={5} className="mx-auto max-w-6xl">
          <DashboardPanel
            icon={Layers}
            title="Aktivitas Terkini"
            action={
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari invoice atau pelanggan..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-gray-900 placeholder-gray-500 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            }
          >
            {outletInfo ? (
              <div className="border-b border-gray-100 bg-white/40 px-6 py-3 text-xs font-semibold text-gray-500">
                Menampilkan transaksi outlet:{" "}
                <span className="text-emerald-600">{outletInfo.name}</span>
              </div>
            ) : null}

            {loading ? (
              <div className="flex flex-col items-center justify-center bg-white/50 py-20">
                <Loader2 className="mb-3 animate-spin text-blue-600" size={40} />
                <p className="animate-pulse text-sm text-gray-500">
                  Memuat data transaksi...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pelanggan
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pembayaran
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                        Total Bayar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction, index) => (
                        <tr
                          key={transaction.id}
                          className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-blue-600 transition-colors group-hover:text-blue-700">
                                {transaction.invoice_number}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(transaction.created_at)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                                <span className="text-xs font-bold text-blue-600">
                                  {transaction.customer?.name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">
                                {transaction.customer?.name || "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`inline-block rounded-xl px-4 py-1.5 text-[10px] font-black tracking-wider shadow-sm ${
                                statusColors[transaction.status] ||
                                statusColors.pending
                              }`}
                            >
                              {statusLabels[transaction.status] ||
                                transaction.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span
                              className={`inline-block rounded-xl px-4 py-1.5 text-[10px] font-black tracking-wider shadow-sm ${
                                transaction.payment_status === "paid"
                                  ? "border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700"
                                  : "border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100/80 text-rose-700"
                              }`}
                            >
                              {transaction.payment_status === "paid"
                                ? "LUNAS"
                                : "BELUM BAYAR"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-5 text-right">
                            <span className="text-sm font-bold text-gray-800">
                              {formatRupiah(transaction.grand_total)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16">
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
                              <Receipt className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="mb-1 font-medium text-gray-500">
                              {searchQuery
                                ? "Tidak ada hasil ditemukan"
                                : "Belum ada transaksi"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {searchQuery
                                ? "Coba kata kunci lain untuk menemukan transaksi."
                                : "Aktivitas outlet akan muncul di sini setelah transaksi dibuat."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPanel>
        </AnimatedItem>
      </div>
    </AnimatedPage>
  );
}
