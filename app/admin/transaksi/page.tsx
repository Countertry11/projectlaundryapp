"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Receipt,
  X,
  Loader2,
  Save,
  ChevronDown,
  User,
  Package,
  Store,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getMinimumAdminTransactionDateInput,
  isAdminTransactionDateBeforeMinimum,
} from "@/lib/adminTransactionDateGuard.mjs";
import {
  addPackageToTransactionItems,
  calculateTransactionSummary,
  removeTransactionItem,
  updateTransactionItem,
} from "@/lib/adminTransactionItems.mjs";
import { normalizeTransactionDueDateValue } from "@/lib/transactionDueDate.mjs";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Customer, Outlet, Paket, Transaction } from "@/types";
import {
  formatRupiah,
  formatDateTime,
  toWibDatabaseDateTime,
  toWibDateTimeLocalValue,
} from "@/utils";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_ESTIMATION_DAYS = 3;
const AUTO_TAX_PERCENT = 10;

type TransactionPackageItem = {
  paket_id: number;
  paket_name: string;
  price: number;
  quantity: number;
  notes: string;
};

function getDefaultDueDateInput() {
  return toWibDateTimeLocalValue(
    new Date(
      Date.now() + DEFAULT_ESTIMATION_DAYS * 24 * 60 * 60 * 1000,
    ),
  );
}

function createInitialFormData(outletId = "") {
  return {
    outlet_id: outletId,
    customer_id: "",
    items: [] as TransactionPackageItem[],
    due_date: getDefaultDueDateInput(),
    additional_cost: 0,
    payment_status: "unpaid" as "unpaid" | "paid",
    status: "pending" as "pending" | "processing" | "ready" | "completed",
    notes: "",
  };
}

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
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  // Form state
  const [formData, setFormData] = useState(createInitialFormData);

  const [userOutletId, setUserOutletId] = useState<string | null>(null);
  const [primaryOutletId, setPrimaryOutletId] = useState("");
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [minimumDueDateInput, setMinimumDueDateInput] = useState(() =>
    getMinimumAdminTransactionDateInput(new Date()),
  );

  useEffect(() => {
    fetchMasterData();
    fetchUserOutlet();
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedOutletId]);

  useEffect(() => {
    if (selectedOutletId) return;
    if (primaryOutletId) {
      setSelectedOutletId(primaryOutletId);
      return;
    }
    if (userOutletId) {
      setSelectedOutletId(userOutletId);
    }
  }, [primaryOutletId, selectedOutletId, userOutletId]);

  function getPreferredOutletId() {
    return selectedOutletId || primaryOutletId || userOutletId || "";
  }

  function resetTransactionForm(outletId = getPreferredOutletId()) {
    setFormData(createInitialFormData(outletId));
  }

  function openTransactionModal() {
    setMinimumDueDateInput(getMinimumAdminTransactionDateInput(new Date()));
    resetTransactionForm();
    setIsModalOpen(true);
  }

  function closeTransactionModal() {
    setIsModalOpen(false);
    resetTransactionForm();
  }

  function handleAddPackage(paket: Paket) {
    setFormData((prev) => ({
      ...prev,
      items: addPackageToTransactionItems(prev.items, paket),
    }));
  }

  function handleUpdatePackageItem(
    paketId: number,
    patch: Partial<TransactionPackageItem>,
  ) {
    setFormData((prev) => ({
      ...prev,
      items: updateTransactionItem(prev.items, paketId, patch),
    }));
  }

  function handleRemovePackageItem(paketId: number) {
    setFormData((prev) => ({
      ...prev,
      items: removeTransactionItem(prev.items, paketId),
    }));
  }

  useEffect(() => {
    if (!isModalOpen) return;

    const syncMinimumDueDate = () => {
      setMinimumDueDateInput(getMinimumAdminTransactionDateInput(new Date()));
    };

    syncMinimumDueDate();
    const intervalId = window.setInterval(syncMinimumDueDate, 30 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isModalOpen]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          customer:customers(id, name, phone)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (selectedOutletId) {
        query = query.eq("outlet_id", selectedOutletId);
      }

      const { data: transData, error: transErr } = await query;

      if (transErr) console.error("Error loading transactions:", transErr);
      else {
        const normalizedTransactions = ((transData as Transaction[]) || []).map(
          (transaction) => ({
            ...transaction,
            due_date: normalizeTransactionDueDateValue(
              transaction.due_date,
              transaction.transaction_date,
            ),
          }),
        );
        setTransactions(normalizedTransactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMasterData() {
    try {
      // Fetch customers
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      setCustomers(custData || []);

      // Fetch packages
      const { data: pkgData } = await supabase.from("tb_paket").select("*");
      setPackages(pkgData || []);

      // Fetch outlets
      const { data: outletData } = await supabase
        .from("outlets")
        .select("id, name, address, phone, email, manager, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      const activeOutlets = outletData || [];
      setOutlets(activeOutlets);
      const mainOutlet =
        activeOutlets.find((outlet) =>
          outlet.name.toLowerCase().includes("utama"),
        ) || activeOutlets[0];
      setPrimaryOutletId(mainOutlet?.id || "");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchUserOutlet() {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from("users")
        .select("outlet_id")
        .eq("id", user.id)
        .single();
      setUserOutletId(data?.outlet_id || null);
    } catch (error) {
      console.error("Error fetching user outlet:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const transactionOutletId = formData.outlet_id || getPreferredOutletId();
    const currentMinimumDueDateInput = getMinimumAdminTransactionDateInput(
      new Date(),
    );
    const transactionItems = formData.items;

    if (
      !transactionOutletId ||
      !formData.customer_id ||
      transactionItems.length === 0
    ) {
      alert("Mohon pilih outlet, pelanggan, dan minimal satu paket terlebih dahulu!");
      return;
    }

    if (
      isAdminTransactionDateBeforeMinimum(
        formData.due_date,
        currentMinimumDueDateInput,
      )
    ) {
      alert("Batas waktu cuci tidak boleh sebelum waktu sekarang.");
      return;
    }

    setSaving(true);
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = formData.due_date
        ? toWibDatabaseDateTime(formData.due_date)
        : toWibDatabaseDateTime(
          new Date(Date.now() + DEFAULT_ESTIMATION_DAYS * 24 * 60 * 60 * 1000),
        );
      const additionalCost = Number(formData.additional_cost || 0);
      const { subtotal, taxAmount, grandTotal } = calculateTransactionSummary(
        transactionItems,
        additionalCost,
        AUTO_TAX_PERCENT,
      );

      const { data: trans, error: errTrans } = await supabase
        .from("transactions")
        .insert([
          {
            outlet_id: transactionOutletId,
            customer_id: formData.customer_id,
            kasir_id: user?.id,
            invoice_number: invoiceNumber,
            transaction_date: toWibDatabaseDateTime(new Date()),
            due_date: dueDate,
            status: formData.status,
            payment_status: formData.payment_status,
            total_amount: subtotal,
            discount: 0,
            tax: taxAmount,
            grand_total: grandTotal,
            notes: formData.notes,
          },
        ])
        .select()
        .single();

      if (errTrans) throw errTrans;

      const { error: errDetail } = await supabase
        .from("transaction_details")
        .insert(
          transactionItems.map((item) => ({
            transaction_id: trans.id,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            notes: item.notes,
          })),
        );

      if (errDetail) throw errDetail;

      alert(`Transaksi Berhasil!\nNo. Invoice: ${invoiceNumber}`);
      if (transactionOutletId && transactionOutletId !== selectedOutletId) {
        setSelectedOutletId(transactionOutletId);
      } else {
        fetchTransactions();
      }
      closeTransactionModal();
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
      fetchTransactions();
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
      fetchTransactions();
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
    ready: "Selesai",
    completed: "Diambil",
    cancelled: "Batal",
  };

  // Status order for sequential flow
  const statusOrder = ["pending", "processing", "ready", "completed"];

  function getAvailableStatuses(currentStatus: string) {
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return statusOrder;
    // Return current status and all statuses after it
    return statusOrder.slice(currentIndex);
  }

  const dueDatePreview = formData.due_date || getDefaultDueDateInput();
  const subtotalPreview = formData.items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const additionalCostPreview = Number(formData.additional_cost || 0);
  const { taxAmount: taxAmountPreview, grandTotal: grandTotalPreview } =
    calculateTransactionSummary(
      formData.items,
      additionalCostPreview,
      AUTO_TAX_PERCENT,
    );

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] p-6 space-y-6 font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeInUp">
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
          onClick={openTransactionModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Buat Transaksi Baru
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_18rem] gap-4 items-end">
        <div className="space-y-2">
          <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Search size={12} /> Cari Transaksi
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari invoice atau nama pelanggan..."
              className="h-14 w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black-600">
            <Store size={12} /> Toko
          </label>
          <div className="relative">
            <select
              className="h-14 w-full appearance-none bg-white border border-blue-200 text-slate-700 px-4 pr-11 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-semibold shadow-sm"
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
            >
              <option value="">Pilih Toko</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>
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
                filteredTransactions.map((trx, index) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-blue-50/30 transition-colors animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6 font-bold text-blue-600 text-sm">
                      {trx.invoice_number}
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-800 text-sm">
                      {(trx.customer as any)?.name || "-"}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      <div>{formatDateTime(trx.transaction_date)}</div>
                      <div className="mt-1 text-xs font-medium text-amber-600">
                        Batas waktu: {formatDateTime(trx.due_date)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block text-center ${statusColors[trx.status] || statusColors.pending}`}
                        >
                          {statusLabels[trx.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block text-center ${trx.payment_status === "paid"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-red-50 text-red-600 border-red-100"
                            }`}
                        >
                          {trx.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                        </span>
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
            onClick={closeTransactionModal}
          ></div>
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-800">
                  Transaksi Baru
                </h2>
              </div>
              <button
                onClick={closeTransactionModal}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1"
            >
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Store size={12} /> Toko *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all appearance-none"
                    value={formData.outlet_id}
                    onChange={(e) =>
                      setFormData({ ...formData, outlet_id: e.target.value })
                    }
                  >
                    <option value="">Pilih Toko</option>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
                <p className="ml-1 text-[11px] font-medium text-slate-500">
                  Toko transaksi dipilih satu per transaksi dan bisa dipindah ke
                  outlet lain dari form ini.
                </p>
              </div>

              {/* Pelanggan */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <User size={12} /> Nama Pelanggan *
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
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Package size={12} /> Pilihan Cuci Paket *
                </label>
                {packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packages.map((paket) => {
                      const selectedItem = formData.items.find(
                        (item) => item.paket_id === paket.id,
                      );

                      return (
                        <button
                          key={paket.id}
                          type="button"
                          onClick={() => handleAddPackage(paket)}
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                            selectedItem
                              ? "border-blue-300 bg-blue-50 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-800">
                                {paket.nama_paket}
                              </p>
                              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                {paket.jenis || "paket"}
                              </p>
                            </div>
                            {selectedItem ? (
                              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                x{selectedItem.quantity}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-4 text-sm font-bold text-blue-700">
                            {formatRupiah(paket.harga)}
                          </p>
                          <p className="mt-2 text-[11px] font-medium text-slate-500">
                            Klik untuk menambahkan paket ke transaksi.
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm font-medium text-slate-400">
                    Belum ada paket tersedia. Tambahkan paket dulu dari menu paket
                    admin.
                  </div>
                )}
                <p className="ml-1 text-[11px] font-medium text-slate-500">
                  Klik kartu paket untuk menambahkan. Jika paket yang sama dipilih
                  lagi, jumlahnya akan bertambah otomatis.
                </p>
              </div>

              <div className="space-y-3 col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Rincian Paket Transaksi
                  </label>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {formData.items.length} item
                  </span>
                </div>
                {formData.items.length > 0 ? (
                  <div className="space-y-3">
                    {formData.items.map((item) => (
                      <div
                        key={item.paket_id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {item.paket_name}
                            </p>
                            <p className="mt-1 text-xs font-medium text-blue-700">
                              {formatRupiah(item.price)} / item
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePackageItem(item.paket_id)}
                            className="rounded-xl bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)_140px] gap-3 items-start">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Jumlah
                            </label>
                            <input
                              type="number"
                              min={1}
                              className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-blue-600/20"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdatePackageItem(item.paket_id, {
                                  quantity: Number(e.target.value || 1),
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Keterangan Paket
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Contoh: pisahkan warna putih, lipat rapi, dll."
                              className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-600/20 resize-none"
                              value={item.notes}
                              onChange={(e) =>
                                handleUpdatePackageItem(item.paket_id, {
                                  notes: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Subtotal
                            </label>
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
                              {formatRupiah(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm font-medium text-slate-400">
                    Belum ada paket yang dipilih. Klik salah satu kartu paket di atas
                    untuk mulai menambahkan item transaksi.
                  </div>
                )}
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Batas Waktu Cuci *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minimumDueDateInput}
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      due_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Pajak Otomatis
                </label>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-3.5">
                  <div className="text-sm font-bold text-amber-700">
                    {formatRupiah(taxAmountPreview)}
                  </div>
                  <p className="mt-1 text-[11px] text-amber-600">
                    Otomatis {AUTO_TAX_PERCENT}% dari harga paket x jumlah.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Biaya Tambahan
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl pl-12 pr-5 py-3.5 text-sm font-semibold outline-none transition-all"
                    placeholder="0"
                    value={
                      formData.additional_cost === 0 ? "" : formData.additional_cost
                    }
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        additional_cost:
                          numericValue === "" ? 0 : Number(numericValue),
                      });
                    }}
                  />
                </div>
              </div>

              {/* Total Display */}
              {formData.items.length > 0 && (
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-600">
                      Batas Waktu
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatDateTime(dueDatePreview)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <span className="font-semibold">Ringkasan Paket</span>
                      <span className="font-black text-blue-700">
                        {formData.items.length} item
                      </span>
                    </div>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div
                          key={item.paket_id}
                          className="flex items-center justify-between gap-3 text-sm text-slate-600"
                        >
                          <span className="truncate">
                            {item.paket_name} x{item.quantity}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal Paket:</span>
                    <span className="font-semibold">{formatRupiah(subtotalPreview)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Pajak ({AUTO_TAX_PERCENT}%):</span>
                    <span className="font-semibold">+ {formatRupiah(taxAmountPreview)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Biaya Tambahan:</span>
                    <span className="font-semibold">
                      + {formatRupiah(additionalCostPreview)}
                    </span>
                  </div>
                  <div className="flex justify-between text-blue-700 pt-2 border-t border-blue-100">
                    <span className="font-bold">Grand Total:</span>
                    <span className="font-black text-lg">
                      {formatRupiah(grandTotalPreview)}
                    </span>
                  </div>
                </div>
              )}

              <div className="col-span-2 flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeTransactionModal}
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
    </AnimatedPage>
  );
}
