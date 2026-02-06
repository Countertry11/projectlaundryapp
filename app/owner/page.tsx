"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatRupiah } from "@/utils";
import Link from "next/link";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    totalOutlets: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("grand_total, payment_status");

      let revenue = 0;
      (transData || []).forEach((t) => {
        if (t.payment_status === "paid") {
          revenue += Number(t.grand_total) || 0;
        }
      });

      // Fetch customers count
      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Fetch outlets count
      const { count: outletCount } = await supabase
        .from("outlets")
        .select("*", { count: "exact", head: true });

      setStats({
        totalRevenue: revenue,
        totalTransactions: transData?.length || 0,
        totalCustomers: customerCount || 0,
        totalOutlets: outletCount || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-6 text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">
            Dashboard Owner
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            Selamat datang kembali,{" "}
            <span className="text-blue-600 font-bold capitalize">
              {user?.full_name || "Owner"}
            </span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard
              title="Total Pendapatan"
              value={formatRupiah(stats.totalRevenue)}
              icon={DollarSign}
              color="bg-blue-600"
            />
            <StatCard
              title="Total Transaksi"
              value={stats.totalTransactions.toString()}
              icon={ShoppingCart}
              color="bg-indigo-600"
            />
            <StatCard
              title="Total Pelanggan"
              value={stats.totalCustomers.toString()}
              icon={Users}
              color="bg-emerald-600"
            />
            <StatCard
              title="Total Outlet"
              value={stats.totalOutlets.toString()}
              icon={TrendingUp}
              color="bg-orange-600"
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-black text-gray-800 tracking-[0.1em] uppercase mb-6">
              Ringkasan Laporan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Pendapatan
                </p>
                <p className="text-lg font-black text-gray-800">
                  {formatRupiah(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Transaksi
                </p>
                <p className="text-lg font-black text-gray-800">
                  {stats.totalTransactions} Pesanan
                </p>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                  Outlet
                </p>
                <p className="text-lg font-black text-gray-800">
                  {stats.totalOutlets} Lokasi
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/owner/laporan"
                className="text-blue-600 font-bold hover:underline text-sm"
              >
                Lihat Laporan Lengkap →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group overflow-hidden">
      <div
        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col min-w-0">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] mb-0.5 truncate">
          {title}
        </p>
        <h3 className="font-black text-gray-800 leading-tight text-base">
          {value}
        </h3>
      </div>
    </div>
  );
}
