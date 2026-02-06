"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Receipt,
  Filter,
  X,
  Loader2,
  Save,
  ChevronDown,
  User,
  Package,
  Clock,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Customer, Paket, Transaction } from "@/types";
import { formatRupiah, formatDate } from "@/utils";
import { useAuth } from "@/context/AuthContext";

export default function TransaksiKasir() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data from database
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Paket[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: "",
    paket_id: "",
    qty: 1,
    payment_status: "unpaid" as "unpaid" | "paid",
    status: "pending" as "pending" | "processing" | "ready" | "completed",
    notes: "",
  });

  const [selectedPackage, setSelectedPackage] = useState<Paket | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch transactions
      const { data: transData, error: transErr } = await supabase
        .from("transactions")
        .select(
          `
          *,
          customer:customers(id, name, phone)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (transErr) console.error("Error loading transactions:", transErr);
      else setTransactions(transData || []);

      // Fetch customers
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      setCustomers(custData || []);

      // Fetch packages
      const { data: pkgData } = await supabase.from("tb_paket").select("*");
      setPackages(pkgData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.customer_id || !formData.paket_id) {
      alert("Mohon pilih pelanggan dan paket terlebih dahulu!");
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const total = (selectedPackage?.harga || 0) * formData.qty;

      const { data: trans, error: errTrans } = await supabase
        .from("transactions")
        .insert([
          {
            customer_id: formData.customer_id,
            kasir_id: user?.id,
            invoice_number: invoiceNumber,
            transaction_date: new Date().toISOString(),
            due_date: dueDate,
            status: formData.status,
            payment_status: formData.payment_status,
            total_amount: total,
            discount: 0,
            tax: 0,
            grand_total: total,
            notes: formData.notes,
          },
        ])
        .select()
        .single();

      if (errTrans) throw errTrans;

      const { error: errDetail } = await supabase
        .from("transaction_details")
        .insert([
          {
            transaction_id: trans.id,
            quantity: formData.qty,
            price: selectedPackage?.harga || 0,
            notes: formData.notes,
          },
        ]);

      if (errDetail) throw errDetail;

      alert(`Transaksi Berhasil!\nNo. Invoice: ${invoiceNumber}`);
      setIsModalOpen(false);
      setFormData({
        customer_id: "",
        paket_id: "",
        qty: 1,
        payment_status: "unpaid",
        status: "pending",
        notes: "",
      });
      setSelectedPackage(null);
      fetchData();
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  async function updatePaymentStatus(id: string, payment_status: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ payment_status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  const filteredTransactions = transactions.filter(
    (trx) =>
      trx.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trx.customer as any)?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    pending: "bg-blue-50 text-blue-600 border-blue-100",
    processing: "bg-orange-50 text-orange-600 border-orange-100",
    ready: "bg-purple-50 text-purple-600 border-purple-100",
    completed: "bg-green-50 text-green-600 border-green-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  const statusLabels: Record<string, string> = {
    pending: "Baru",
    processing: "Proses",
    ready: "Siap",
    completed: "Selesai",
    cancelled: "Batal",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 space-y-6 font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Entri Transaksi
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Input dan kelola pesanan laundry pelanggan.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Buat Transaksi Baru
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari invoice atau nama pelanggan..."
            className="w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Invoice
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Pelanggan
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Tanggal
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">
                  Status
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">
                  Pembayaran
                </th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={40}
                    />
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-8 py-6 font-bold text-blue-600 text-sm">
                      {trx.invoice_number}
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-800 text-sm">
                      {(trx.customer as any)?.name || "-"}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {formatDate(trx.transaction_date)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <select
                          value={trx.status}
                          onChange={(e) => updateStatus(trx.id, e.target.value)}
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer ${statusColors[trx.status] || statusColors.pending}`}
                        >
                          <option value="pending">Baru</option>
                          <option value="processing">Proses</option>
                          <option value="ready">Siap Ambil</option>
                          <option value="completed">Selesai</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <select
                          value={trx.payment_status}
                          onChange={(e) =>
                            updatePaymentStatus(trx.id, e.target.value)
                          }
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer ${
                            trx.payment_status === "paid"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-red-50 text-red-600 border-red-100"
                          }`}
                        >
                          <option value="unpaid">Belum Bayar</option>
                          <option value="paid">Lunas</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-800 text-sm">
                      {formatRupiah(trx.grand_total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    {searchTerm
                      ? "Tidak ada transaksi yang cocok."
                      : "Belum ada transaksi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-800">
                  Transaksi Baru
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Pelanggan */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <User size={12} /> Pilih Pelanggan *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all appearance-none"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                  >
                    <option value="">Pilih Pelanggan</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.phone}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Paket */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Package size={12} /> Pilih Paket *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all appearance-none"
                    value={formData.paket_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, paket_id: val });
                      setSelectedPackage(
                        packages.find((p) => p.id.toString() === val) || null,
                      );
                    }}
                  >
                    <option value="">Pilih Paket</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_paket} ({formatRupiah(p.harga)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              {/* Qty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Jumlah *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qty: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <CreditCard size={12} /> Pembayaran *
                </label>
                <select
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                  value={formData.payment_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_status: e.target.value as any,
                    })
                  }
                >
                  <option value="unpaid">Belum Bayar</option>
                  <option value="paid">Dibayar (Lunas)</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Status Pesanan *
                </label>
                <select
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="pending">Baru</option>
                  <option value="processing">Proses</option>
                </select>
              </div>

              {/* Total Display */}
              {selectedPackage && (
                <div className="col-span-2 bg-blue-50 p-4 rounded-2xl">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">Total: </span>
                    <span className="font-black text-lg">
                      {formatRupiah(
                        (selectedPackage.harga || 0) * formData.qty,
                      )}
                    </span>
                  </p>
                </div>
              )}

              <div className="col-span-2 flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Proses Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
