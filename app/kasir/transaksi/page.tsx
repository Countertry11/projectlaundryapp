"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  Clock,
  Eye,
  Loader2,
  Package,
  Plus,
  Receipt,
  Save,
  Search,
  Store,
  User,
  X,
} from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Customer,
  Outlet,
  Paket,
  PaymentStatus,
  Transaction,
  TransactionDetail,
  TransactionStatus,
} from "@/types";
import {
  addDaysToWibDateTime,
  formatDateTime,
  formatRupiah,
  toWibDatabaseDateTime,
  toWibDateTimeLocalValue,
} from "@/utils";

type TransactionDetailWithPaket = TransactionDetail & {
  paket_id?: number | null;
  paket?: Paket | null;
};

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

const jenisLabels: Record<string, string> = {
  kiloan: "Kiloan",
  selimut: "Selimut",
  bed_cover: "Bed Cover",
  kaos: "Kaos",
  lain: "Lainnya",
};

const DELAY_DISCOUNT_PERCENT = 5;
const DELAY_DISCOUNT_DAYS = 1;
const AUTO_TAX_PERCENT = 10;

const statusSteps: Array<{
  value: Exclude<TransactionStatus, "cancelled">;
  label: string;
}> = [
  { value: "pending", label: "Baru" },
  { value: "processing", label: "Proses" },
  { value: "ready", label: "Selesai" },
  { value: "completed", label: "Diambil" },
];

function getNextStatus(
  status: TransactionStatus,
): Exclude<TransactionStatus, "cancelled"> | null {
  if (status === "pending") return "processing";
  if (status === "processing") return "ready";
  if (status === "ready") return "completed";
  return null;
}

function getDefaultDueDateValue(referenceDate: Date = new Date()) {
  return toWibDateTimeLocalValue(
    new Date(referenceDate.getTime() + 3 * 24 * 60 * 60 * 1000),
  );
}

function createInitialFormData(referenceDate: Date = new Date()) {
  return {
    customer_id: "",
    paket_id: "",
    qty: 1,
    due_date: getDefaultDueDateValue(referenceDate),
    additional_cost: 0,
    notes: "",
  };
}

function hasDelayDiscountByDate(
  transactionDateValue: string | Date | null | undefined,
  dueDateValue: string | Date | null | undefined,
) {
  if (!transactionDateValue || !dueDateValue) return false;

  const transactionDate = new Date(transactionDateValue);
  const dueDate = new Date(dueDateValue);

  if (
    Number.isNaN(transactionDate.getTime()) ||
    Number.isNaN(dueDate.getTime())
  ) {
    return false;
  }

  const baseDueDate = new Date(
    transactionDate.getTime() + 3 * 24 * 60 * 60 * 1000,
  );

  return (
    dueDate.getTime() - baseDueDate.getTime() >=
    DELAY_DISCOUNT_DAYS * 24 * 60 * 60 * 1000
  );
}

export default function TransaksiKasir() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [dueDateDraft, setDueDateDraft] = useState("");
  const [minimumDueDateDraft, setMinimumDueDateDraft] = useState(() =>
    toWibDateTimeLocalValue(new Date()),
  );
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<
    TransactionDetailWithPaket[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Paket[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [formData, setFormData] = useState(createInitialFormData);
  const [selectedPackage, setSelectedPackage] = useState<Paket | null>(null);
  const [userOutletId, setUserOutletId] = useState<string | null>(null);
  const [primaryOutletId, setPrimaryOutletId] = useState("");
  const [selectedOutletId, setSelectedOutletId] = useState("");

  function hasDelayDiscount(trx: Transaction & { customer?: Customer | undefined }) {
    return hasDelayDiscountByDate(trx.transaction_date, trx.due_date);
  }

  function getTransactionDiscountPercent(
    trx: Transaction & { customer?: Customer | undefined },
  ) {
    return hasDelayDiscount(trx) ? DELAY_DISCOUNT_PERCENT : 0;
  }

  async function syncDelayDiscounts(
    transactionRows: Array<Transaction & { customer?: Customer | undefined }>,
  ) {
    const normalizedRows = [...transactionRows];

    for (let index = 0; index < normalizedRows.length; index += 1) {
      const trx = normalizedRows[index];
      const expectedDiscount = getTransactionDiscountPercent(trx);
      const currentDiscount = Number(trx.discount || 0);

      if (currentDiscount === expectedDiscount) continue;

      const taxAmount = Number(trx.tax || 0);
      const totalAmount = Number(trx.total_amount || 0);
      const currentGrandTotal = Number(trx.grand_total || 0);
      const inferredAdditionalCost =
        currentGrandTotal -
        (totalAmount - totalAmount * (currentDiscount / 100) + taxAmount);
      const nextGrandTotal =
        totalAmount -
        totalAmount * (expectedDiscount / 100) +
        taxAmount +
        Math.max(0, inferredAdditionalCost);

      const { error } = await supabase
        .from("transactions")
        .update({
          discount: expectedDiscount,
          grand_total: nextGrandTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trx.id);

      if (error) {
        console.error("Error syncing delay discount:", error);
        continue;
      }

      normalizedRows[index] = {
        ...trx,
        discount: expectedDiscount,
        grand_total: nextGrandTotal,
      };
    }

    return normalizedRows;
  }

  useEffect(() => {
    fetchMasterData();
    fetchUserOutlet();
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedOutletId]);

  useEffect(() => {
    if (selectedOutletId) return;
    if (primaryOutletId) return void setSelectedOutletId(primaryOutletId);
    if (userOutletId) setSelectedOutletId(userOutletId);
  }, [primaryOutletId, selectedOutletId, userOutletId]);

  useEffect(() => {
    setDueDateDraft(toWibDateTimeLocalValue(selectedTransaction?.due_date));
  }, [selectedTransaction]);

  useEffect(() => {
    if (!selectedTransaction) return;

    const syncMinimumDueDate = () => {
      setMinimumDueDateDraft(toWibDateTimeLocalValue(new Date()));
    };

    syncMinimumDueDate();
    const intervalId = window.setInterval(syncMinimumDueDate, 30 * 1000);

    return () => window.clearInterval(intervalId);
  }, [selectedTransaction]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      let query = supabase
        .from("transactions")
        .select("*, customer:customers(id, name, phone)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (selectedOutletId) query = query.eq("outlet_id", selectedOutletId);
      const { data, error } = await query;
      if (error) console.error("Error loading transactions:", error);
      else {
        const syncedTransactions = await syncDelayDiscounts(
          ((data as Transaction[]) || []) as Array<
            Transaction & { customer?: Customer | undefined }
          >,
        );
        setTransactions(syncedTransactions as Transaction[]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMasterData() {
    try {
      const { data: custData } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });
      setCustomers((custData as Customer[]) || []);
      const { data: pkgData } = await supabase.from("tb_paket").select("*");
      setPackages((pkgData as Paket[]) || []);
      const { data: outletData } = await supabase
        .from("outlets")
        .select("id, name, address, phone, email, manager, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      const activeOutlets = (outletData as Outlet[]) || [];
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
    if (
      !selectedOutletId ||
      !formData.customer_id ||
      !formData.paket_id ||
      !selectedPackage
    ) {
      alert("Mohon pilih outlet, pelanggan, dan paket terlebih dahulu.");
      return;
    }
    setSaving(true);
    try {
      const placedAt = toWibDateTimeLocalValue(new Date());
      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = formData.due_date
        ? toWibDatabaseDateTime(formData.due_date)
        : addDaysToWibDateTime(placedAt, 3);
      const discountPercent = hasDelayDiscountByDate(placedAt, dueDate)
        ? DELAY_DISCOUNT_PERCENT
        : 0;
      const subtotal = (selectedPackage?.harga || 0) * Number(formData.qty || 0);
      const discountAmount = subtotal * (discountPercent / 100);
      const subtotalAfterDiscount = subtotal - discountAmount;
      const additionalCost = Number(formData.additional_cost || 0);
      const taxAmount = Math.round(subtotal * (AUTO_TAX_PERCENT / 100));
      const grandTotal = subtotalAfterDiscount + additionalCost + taxAmount;
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            outlet_id: selectedOutletId,
            customer_id: formData.customer_id,
            kasir_id: user?.id,
            invoice_number: invoiceNumber,
            transaction_date: toWibDatabaseDateTime(placedAt),
            due_date: dueDate,
            status: "pending",
            payment_status: "unpaid",
            total_amount: subtotal,
            discount: discountPercent,
            tax: taxAmount,
            grand_total: grandTotal,
            notes: formData.notes,
          },
        ])
        .select()
        .single();
      if (transactionError) throw transactionError;
      const detailPayload = {
        transaction_id: transactionData.id,
        quantity: Number(formData.qty),
        price: selectedPackage.harga || 0,
        notes: formData.notes,
      };
      const { error: detailError } = await supabase
        .from("transaction_details")
        .insert([detailPayload]);
      if (detailError) throw detailError;
      alert(`Transaksi berhasil disimpan.\nNo. Invoice: ${invoiceNumber}`);
      setIsModalOpen(false);
      setFormData(createInitialFormData());
      setSelectedPackage(null);
      fetchTransactions();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      alert(`Gagal menyimpan transaksi: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  function syncSelectedTransaction(update: Partial<Transaction> & { id: string }) {
    setTransactions((prev) =>
      prev.map((trx) => (trx.id === update.id ? { ...trx, ...update } : trx)),
    );
    setSelectedTransaction((prev) =>
      prev && prev.id === update.id ? { ...prev, ...update } : prev,
    );
  }

  async function updatePaymentStatus(
    id: string,
    paymentStatus: Extract<PaymentStatus, "paid" | "unpaid">,
  ) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      syncSelectedTransaction({ id, payment_status: paymentStatus });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      alert(`Gagal memperbarui pembayaran: ${message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function updateStatus(id: string, status: TransactionStatus) {
    if (status === "completed" && selectedTransaction?.payment_status !== "paid") {
      alert("Cucian tidak bisa diambil sebelum pembayaran lunas.");
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      syncSelectedTransaction({ id, status });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
      alert(`Gagal memperbarui status: ${message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function updateDueDate(id: string) {
    if (!selectedTransaction) return;
    if (!dueDateDraft) {
      alert("Tanggal estimasi harus diisi.");
      return;
    }
    if (dueDateDraft < minimumDueDateDraft) {
      alert("Tanggal estimasi tidak boleh kurang dari waktu sekarang.");
      return;
    }

    setActionLoading(true);
    try {
      const nextDueDate = toWibDatabaseDateTime(dueDateDraft);
      const updatedTransaction = {
        ...selectedTransaction,
        due_date: nextDueDate,
      };
      const expectedDiscount = getTransactionDiscountPercent(updatedTransaction);
      const currentDiscount = Number(selectedTransaction.discount || 0);
      const totalAmount = Number(selectedTransaction.total_amount || 0);
      const taxAmount = Number(selectedTransaction.tax || 0);
      const currentGrandTotal = Number(selectedTransaction.grand_total || 0);
      const inferredAdditionalCost =
        currentGrandTotal -
        (totalAmount - totalAmount * (currentDiscount / 100) + taxAmount);
      const nextGrandTotal =
        totalAmount -
        totalAmount * (expectedDiscount / 100) +
        taxAmount +
        Math.max(0, inferredAdditionalCost);

      const { error } = await supabase
        .from("transactions")
        .update({
          due_date: nextDueDate,
          discount: expectedDiscount,
          grand_total: nextGrandTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      syncSelectedTransaction({
        id,
        due_date: nextDueDate,
        discount: expectedDiscount,
        grand_total: nextGrandTotal,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan.";
      alert(`Gagal memperbarui tanggal estimasi: ${message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function openTransactionDetail(trx: Transaction) {
    setSelectedTransaction(trx);
    setSelectedTransactionDetails([]);
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from("transaction_details")
        .select("id, transaction_id, quantity, price, notes, created_at")
        .eq("transaction_id", trx.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const detailRows = (
        (data as Array<{
          id: string;
          transaction_id?: string;
          quantity: number;
          price: number;
          notes?: string | null;
          created_at?: string | null;
        }>) || []
      ).map((detail) => {
        const matchedPaket =
          packages.find((item) => item.harga === detail.price) ||
          null;
        return {
          id: detail.id,
          transaction_id: detail.transaction_id,
          quantity: Number(detail.quantity) || 0,
          price: Number(detail.price) || 0,
          subtotal: (Number(detail.price) || 0) * (Number(detail.quantity) || 0),
          notes: detail.notes || undefined,
          created_at: detail.created_at || undefined,
          paket: matchedPaket,
        } satisfies TransactionDetailWithPaket;
      });
      setSelectedTransactionDetails(detailRows);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setSelectedTransactionDetails([]);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeTransactionDetail() {
    setSelectedTransaction(null);
    setSelectedTransactionDetails([]);
  }

  const filteredTransactions = transactions.filter((trx) => {
    const term = searchTerm.toLowerCase();
    const invoice = trx.invoice_number?.toLowerCase() || "";
    const customerName = trx.customer?.name?.toLowerCase() || "";
    return invoice.includes(term) || customerName.includes(term);
  });

  const dueDatePreview = formData.due_date || getDefaultDueDateValue();
  const draftDiscountPercent = hasDelayDiscountByDate(
    new Date(),
    dueDatePreview,
  )
    ? DELAY_DISCOUNT_PERCENT
    : 0;
  const subtotalPreview = (selectedPackage?.harga || 0) * Number(formData.qty || 0);
  const discountAmountPreview = subtotalPreview * (draftDiscountPercent / 100);
  const subtotalAfterDiscountPreview = subtotalPreview - discountAmountPreview;
  const additionalCostPreview = Number(formData.additional_cost || 0);
  const taxAmountPreview = Math.round(
    subtotalPreview * (AUTO_TAX_PERCENT / 100),
  );
  const grandTotalPreview =
    subtotalAfterDiscountPreview + additionalCostPreview + taxAmountPreview;
  const currentStatusIndex = selectedTransaction
    ? statusSteps.findIndex((step) => step.value === selectedTransaction.status)
    : -1;
  const nextStatus = selectedTransaction
    ? getNextStatus(selectedTransaction.status)
    : null;
  const selectedTransactionDiscountPercent = selectedTransaction
    ? getTransactionDiscountPercent(selectedTransaction)
    : 0;
  const selectedTransactionDelayDiscount = selectedTransaction
    ? hasDelayDiscount(selectedTransaction)
    : false;
  const pickupBlocked =
    selectedTransaction?.status === "ready" &&
    selectedTransaction.payment_status !== "paid";

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] p-6 space-y-6 font-sans text-slate-800">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">
              Transaksi Kasir
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Kelola pesanan pelanggan dan progres pengerjaannya.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const now = new Date();
            setFormData(createInitialFormData(now));
            setSelectedPackage(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md"
        >
          <Plus size={20} />
          Buat Transaksi Baru
        </button>
      </div>

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
            <Store size={12} /> Toko Aktif
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Invoice</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Pelanggan</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Tanggal</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Pembayaran</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Total</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-500" size={40} />
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx, index) => (
                  <tr
                    key={trx.id}
                    className="hover:bg-blue-50/30 transition-colors animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 font-bold text-blue-600">{trx.invoice_number}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{trx.customer?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{formatDateTime(trx.transaction_date)}</div>
                      <div className="mt-1 text-xs font-medium text-amber-600">
                        Batas waktu: {formatDateTime(trx.due_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block text-center whitespace-nowrap ${statusColors[trx.status] || statusColors.pending}`}>
                          {statusLabels[trx.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block text-center whitespace-nowrap ${trx.payment_status === "paid" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                          {trx.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-800">{formatRupiah(trx.grand_total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => openTransactionDetail(trx)}
                          className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white p-2.5 rounded-xl transition-all shadow-sm group"
                          title="Lihat detail transaksi"
                        >
                          <Eye size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 italic">
                    {searchTerm ? "Tidak ada transaksi yang cocok." : "Belum ada transaksi."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-800">Transaksi Baru</h2>
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
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1"
            >
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <User size={12} /> Pilih Pelanggan *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all appearance-none"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  >
                    <option value="">Pilih Pelanggan</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

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
                      const value = e.target.value;
                      setFormData({ ...formData, paket_id: value });
                      setSelectedPackage(
                        packages.find((pkg) => pkg.id.toString() === value) || null,
                      );
                    }}
                  >
                    <option value="">Pilih Paket</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.nama_paket} ({formatRupiah(pkg.harga)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: e.target.value === "" ? 1 : Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 text-orange-500">
                  <Clock size={12} /> Batas Waktu *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3.5 text-sm font-bold text-orange-700 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
                <p className="ml-1 text-[11px] text-orange-500">
                  Jam batas waktu bisa diubah sesuai jadwal cucian.
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status Otomatis
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700">
                    Status: Baru
                  </span>
                  <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                    Pembayaran: Belum Bayar
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Saat transaksi dibuat, sistem otomatis menyimpan status pesanan
                  sebagai baru dan pembayaran sebagai belum bayar.
                </p>
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
                    value={formData.additional_cost === 0 ? "" : formData.additional_cost}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setFormData({
                        ...formData,
                        additional_cost: numericValue === "" ? 0 : Number(numericValue),
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Keterangan
                </label>
                <textarea
                  rows={3}
                  className="w-full resize-none bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-medium outline-none transition-all"
                  placeholder="Catatan tambahan untuk transaksi ini..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {selectedPackage && (
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm">
                    <span className="font-semibold text-orange-600">Batas Waktu</span>
                    <span className="font-bold text-orange-700">{formatDateTime(dueDatePreview)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatRupiah(subtotalPreview)}</span>
                  </div>
                  {draftDiscountPercent > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon ({draftDiscountPercent}%):</span>
                        <span className="font-semibold">- {formatRupiah(discountAmountPreview)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal Setelah Diskon:</span>
                        <span className="font-semibold">{formatRupiah(subtotalAfterDiscountPreview)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Pajak ({AUTO_TAX_PERCENT}%):</span>
                    <span className="font-semibold">+ {formatRupiah(taxAmountPreview)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Biaya Tambahan:</span>
                    <span className="font-semibold">+ {formatRupiah(additionalCostPreview)}</span>
                  </div>
                  <div className="flex justify-between text-blue-700 pt-2 border-t border-blue-100">
                    <span className="font-bold">Grand Total:</span>
                    <span className="font-black text-lg">{formatRupiah(grandTotalPreview)}</span>
                  </div>
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
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Proses Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeTransactionDetail}
          ></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Receipt size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800">Detail Transaksi</h2>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                    {selectedTransaction.invoice_number}
                  </p>
                </div>
              </div>
              <button
                onClick={closeTransactionDetail}
                className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-400 border border-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nama Pelanggan</div>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <User size={16} className="text-blue-500" />
                    {selectedTransaction.customer?.name || "-"}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tanggal</div>
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Clock size={16} className="text-slate-400" />
                    {formatDateTime(selectedTransaction.transaction_date)}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedTransaction.status] || statusColors.pending}`}>
                    {statusLabels[selectedTransaction.status]}
                  </span>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pembayaran</div>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedTransaction.payment_status === "paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                    {selectedTransaction.payment_status === "paid" ? "Dibayar" : "Belum Bayar"}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-black tracking-widest uppercase text-slate-500">Paket Dipilih</h3>
                </div>
                <div className="p-5 space-y-4">
                  {detailLoading ? (
                    <div className="py-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                    </div>
                  ) : selectedTransactionDetails.length > 0 ? (
                    selectedTransactionDetails.map((detail) => (
                      <div key={detail.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-slate-800 font-bold">
                              <Package size={16} className="text-blue-500" />
                              {detail.paket?.nama_paket || `Paket ${formatRupiah(detail.price)}`}
                            </div>
                            <div className="mt-2 text-sm text-slate-500 space-y-1">
                              <div>
                                Jenis:{" "}
                                <span className="font-semibold text-slate-700">
                                  {detail.paket?.jenis ? jenisLabels[detail.paket.jenis] || detail.paket.jenis : "-"}
                                </span>
                              </div>
                              <div>
                                Keterangan:{" "}
                                <span className="font-semibold text-slate-700">
                                  {detail.notes || selectedTransaction.notes || "Tidak ada keterangan"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 md:text-right space-y-1">
                            <div>Qty: <span className="font-bold text-slate-800">{detail.quantity}</span></div>
                            <div>Harga: <span className="font-bold text-slate-800">{formatRupiah(detail.price)}</span></div>
                            <div>Subtotal: <span className="font-black text-blue-700">{formatRupiah(detail.subtotal)}</span></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                      Detail paket belum tersedia untuk transaksi ini.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Batas Waktu</div>
                    <div className="text-sm font-bold text-amber-700">{formatDateTime(selectedTransaction.due_date)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Catatan Transaksi</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedTransaction.notes || "Tidak ada catatan"}
                    </div>
                  </div>
                  <div className="md:text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Biaya</div>
                    <div className="text-2xl font-black text-blue-700">
                      {formatRupiah(selectedTransaction.grand_total)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-black tracking-widest uppercase text-slate-500">
                    Estimasi Pencucian
                  </h3>
                  <p className="text-sm text-slate-500">
                    Ubah tanggal estimasi. Jika diundur minimal 1 hari dari
                    estimasi awal, diskon telat 5% akan berlaku.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tanggal Estimasi
                    </label>
                    <input
                      type="datetime-local"
                      min={minimumDueDateDraft}
                      className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all"
                      value={dueDateDraft}
                      onChange={(e) => setDueDateDraft(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading || !selectedTransaction || !dueDateDraft}
                    onClick={() => updateDueDate(selectedTransaction.id)}
                    className="rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Simpan Estimasi
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Diskon Berlaku
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {selectedTransactionDiscountPercent}%
                    </div>
                  </div>
                  <div
                    className={`rounded-2xl border px-4 py-3 ${
                      selectedTransactionDelayDiscount
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Diskon Telat 5%
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        selectedTransactionDelayDiscount
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {selectedTransactionDelayDiscount
                        ? "Sudah berlaku"
                        : "Belum berlaku"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-100 bg-white p-5 space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-black tracking-widest uppercase text-slate-500">Aksi Progres</h3>
                  <p className="text-sm text-slate-500">
                    Status hanya bisa maju. Cucian tidak bisa diambil sebelum pembayaran lunas.
                  </p>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {statusSteps.map((step, index) => {
                    const isCompletedStep = currentStatusIndex >= index;
                    const isCurrentStep = currentStatusIndex === index;
                    const isNextStep = nextStatus === step.value;
                    const blockedByPayment =
                      step.value === "completed" && selectedTransaction.payment_status !== "paid";
                    return (
                      <button
                        key={step.value}
                        type="button"
                        disabled={!isNextStep || blockedByPayment || actionLoading}
                        onClick={() => updateStatus(selectedTransaction.id, step.value)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${isCurrentStep ? "border-blue-200 bg-blue-50 text-blue-700" : isCompletedStep ? "border-emerald-200 bg-emerald-50 text-emerald-700" : isNextStep && !blockedByPayment ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-slate-200 bg-slate-50 text-slate-400"} disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pembayaran</div>
                    <div className="text-sm font-bold text-slate-800">
                      {selectedTransaction.payment_status === "paid"
                        ? "Pesanan ini sudah dibayar."
                        : "Pesanan ini belum dibayar."}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={selectedTransaction.payment_status === "paid" || actionLoading}
                    onClick={() => updatePaymentStatus(selectedTransaction.id, "paid")}
                    className="rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedTransaction.payment_status === "paid" ? "Sudah Dibayar" : "Tandai Dibayar"}
                  </button>
                </div>

                {pickupBlocked && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    Transaksi belum bisa dipindahkan ke status `Diambil` karena pembayaran belum lunas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
