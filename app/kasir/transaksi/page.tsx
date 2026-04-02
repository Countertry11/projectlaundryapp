"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
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
  Trash2,
  User,
  X,
} from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useAuth } from "@/context/AuthContext";
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
import {
  createInitialKasirTransactionFormData,
  getDefaultKasirDueDateInput,
} from "@/lib/kasirTransactionForm.mjs";
import { resolveKasirOutletAccess } from "@/lib/kasirOutletAccess.mjs";
import {
  DELAY_DISCOUNT_PERCENT,
  getDelayDiscountPercent,
  hasDelayDiscountByDate,
} from "@/lib/transactionDelayDiscount.mjs";
import {
  buildTransactionFinancialSummary,
  getTransactionDelayDiscountUpdate,
} from "@/lib/transactionFinancialSummary.mjs";
import { normalizeTransactionDueDateValue } from "@/lib/transactionDueDate.mjs";
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
  formatDateTime,
  formatRupiah,
  toWibDatabaseDateTime,
  toWibDateTimeLocalValue,
} from "@/utils";

type TransactionDetailWithPaket = TransactionDetail & {
  paket_id?: number | null;
  paket?: Paket | null;
};

type TransactionPackageItem = {
  paket_id: number;
  paket_name: string;
  price: number;
  quantity: number;
  notes: string;
};

type TransactionFormData = {
  outlet_id: string;
  customer_id: string;
  items: TransactionPackageItem[];
  due_date: string;
  additional_cost: number;
  notes: string;
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

function createInitialFormData(
  outletId = "",
  referenceDate: Date = new Date(),
): TransactionFormData {
  return createInitialKasirTransactionFormData(
    outletId,
    referenceDate,
  ) as TransactionFormData;
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
  const [minimumDueDateInput, setMinimumDueDateInput] = useState(() =>
    getMinimumAdminTransactionDateInput(new Date()),
  );
  const [detailReferenceTime, setDetailReferenceTime] = useState(() =>
    Date.now(),
  );
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
  const [userOutletId, setUserOutletId] = useState<string | null>(null);
  const [userOutletResolved, setUserOutletResolved] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState("");
  const kasirOutletAccess = resolveKasirOutletAccess(outlets, userOutletId);
  const hasAssignedOutlet = kasirOutletAccess.hasAssignedOutlet;

  function hasDelayDiscount(
    trx: Transaction & { customer?: Customer | undefined },
    referenceDate: string | Date = new Date(),
  ) {
    return hasDelayDiscountByDate(referenceDate, trx.due_date);
  }

  function getTransactionDiscountPercent(
    trx: Transaction & { customer?: Customer | undefined },
    referenceDate: string | Date = new Date(),
  ) {
    return getDelayDiscountPercent(referenceDate, trx.due_date);
  }

  async function syncDelayDiscounts(
    transactionRows: Array<Transaction & { customer?: Customer | undefined }>,
  ) {
    const normalizedRows = [...transactionRows];
    const referenceDate = new Date();

    for (let index = 0; index < normalizedRows.length; index += 1) {
      const trx = normalizedRows[index];
      const expectedDiscount = getTransactionDiscountPercent(trx, referenceDate);
      const updatePayload = getTransactionDelayDiscountUpdate(
        trx,
        expectedDiscount,
      );

      if (!updatePayload) continue;

      const { error } = await supabase
        .from("transactions")
        .update({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trx.id);

      if (error) {
        console.error("Error syncing delay discount:", error);
        continue;
      }

      normalizedRows[index] = {
        ...trx,
        ...updatePayload,
      };
    }

    return normalizedRows;
  }

  useEffect(() => {
    fetchMasterData();
    fetchUserOutlet();
  }, [user]);

  useEffect(() => {
    if (!userOutletResolved) return;
    fetchTransactions();
  }, [selectedOutletId, userOutletResolved]);

  useEffect(() => {
    if (!userOutletResolved) return;
    setSelectedOutletId(userOutletId || "");
  }, [userOutletId, userOutletResolved]);

  function getPreferredOutletId() {
    return selectedOutletId || userOutletId || "";
  }

  function resetTransactionForm(
    outletId = getPreferredOutletId(),
    referenceDate: Date = new Date(),
  ) {
    setFormData(createInitialFormData(outletId, referenceDate));
  }

  function openTransactionModal() {
    if (!hasAssignedOutlet) {
      alert(
        "Akun kasir ini belum ditugaskan ke toko mana pun. Silakan hubungi admin.",
      );
      return;
    }

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
    setDueDateDraft(toWibDateTimeLocalValue(selectedTransaction?.due_date));
  }, [selectedTransaction]);

  useEffect(() => {
    if (!selectedTransaction) return;
    let cancelled = false;

    const syncDetailTimingAndDiscount = async () => {
      const referenceDate = new Date();
      setMinimumDueDateDraft(toWibDateTimeLocalValue(referenceDate));
      setDetailReferenceTime(referenceDate.getTime());

      const expectedDiscount = getDelayDiscountPercent(
        referenceDate,
        selectedTransaction.due_date,
      );
      const updatePayload = getTransactionDelayDiscountUpdate(
        selectedTransaction,
        expectedDiscount,
      );

      if (!updatePayload) return;

      const { error } = await supabase
        .from("transactions")
        .update({
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTransaction.id);

      if (error) {
        console.error("Error syncing selected transaction delay discount:", error);
        return;
      }

      if (cancelled) return;

      setTransactions((prev) =>
        prev.map((trx) =>
          trx.id === selectedTransaction.id ? { ...trx, ...updatePayload } : trx,
        ),
      );
      setSelectedTransaction((prev) =>
        prev && prev.id === selectedTransaction.id
          ? { ...prev, ...updatePayload }
          : prev,
      );
    };

    void syncDetailTimingAndDiscount();
    const intervalId = window.setInterval(() => {
      void syncDetailTimingAndDiscount();
    }, 30 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedTransaction]);

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
    if (!userOutletResolved) return;

    if (!selectedOutletId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

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
        const normalizedTransactions = (((data as Transaction[]) || []) as Array<
          Transaction & { customer?: Customer | undefined }
        >).map((transaction) => ({
          ...transaction,
          due_date: normalizeTransactionDueDateValue(
            transaction.due_date,
            transaction.transaction_date,
          ),
        }));
        const syncedTransactions = await syncDelayDiscounts(
          normalizedTransactions,
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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function fetchUserOutlet() {
    if (!user?.id) {
      setUserOutletId(null);
      setSelectedOutletId("");
      setUserOutletResolved(true);
      return;
    }

    try {
      const { data } = await supabase
        .from("users")
        .select("outlet_id")
        .eq("id", user.id)
        .single();
      const nextOutletId = data?.outlet_id || null;
      setUserOutletId(nextOutletId);
      setSelectedOutletId(nextOutletId || "");
    } catch (error) {
      console.error("Error fetching user outlet:", error);
      setUserOutletId(null);
      setSelectedOutletId("");
    } finally {
      setUserOutletResolved(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const transactionOutletId = formData.outlet_id || getPreferredOutletId();
    const currentMinimumDueDateInput = getMinimumAdminTransactionDateInput(
      new Date(),
    );
    const transactionItems = formData.items;

    if (!transactionOutletId) {
      alert(
        "Akun kasir ini belum ditugaskan ke toko mana pun. Silakan hubungi admin.",
      );
      return;
    }

    if (!formData.customer_id || transactionItems.length === 0) {
      alert("Mohon pilih pelanggan dan minimal satu paket terlebih dahulu.");
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
      const placedAt = toWibDateTimeLocalValue(new Date());
      const invoiceNumber = `INV-${Date.now()}`;
      const dueDate = formData.due_date
        ? toWibDatabaseDateTime(formData.due_date)
        : toWibDatabaseDateTime(getDefaultKasirDueDateInput(new Date()));
      const discountPercent = getDelayDiscountPercent(placedAt, dueDate);
      const additionalCost = Number(formData.additional_cost || 0);
      const { subtotal, taxAmount, grandTotal: summaryGrandTotal } =
        calculateTransactionSummary(
          transactionItems,
          additionalCost,
          AUTO_TAX_PERCENT,
        );
      const discountAmount = subtotal * (discountPercent / 100);
      const grandTotal = summaryGrandTotal - discountAmount;
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            outlet_id: transactionOutletId,
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
      const { error: detailError } = await supabase
        .from("transaction_details")
        .insert(
          transactionItems.map((item) => ({
            transaction_id: transactionData.id,
            quantity: Number(item.quantity || 1),
            price: Number(item.price || 0),
            notes: item.notes,
          })),
        );
      if (detailError) throw detailError;
      alert(`Transaksi berhasil disimpan.\nNo. Invoice: ${invoiceNumber}`);
      fetchTransactions();
      closeTransactionModal();
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
      const updatePayload =
        getTransactionDelayDiscountUpdate(updatedTransaction, expectedDiscount) || {
          discount: Number(selectedTransaction.discount || 0),
          grand_total: Number(selectedTransaction.grand_total || 0),
        };

      const { error } = await supabase
        .from("transactions")
        .update({
          due_date: nextDueDate,
          ...updatePayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      syncSelectedTransaction({
        id,
        due_date: nextDueDate,
        ...updatePayload,
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

  const dueDatePreview =
    formData.due_date || getDefaultKasirDueDateInput(new Date());
  const draftDiscountPercent = getDelayDiscountPercent(new Date(), dueDatePreview);
  const additionalCostPreview = Number(formData.additional_cost || 0);
  const {
    subtotal: subtotalPreview,
    taxAmount: taxAmountPreview,
    grandTotal: baseGrandTotalPreview,
  } = calculateTransactionSummary(
    formData.items,
    additionalCostPreview,
    AUTO_TAX_PERCENT,
  );
  const discountAmountPreview = subtotalPreview * (draftDiscountPercent / 100);
  const subtotalAfterDiscountPreview = subtotalPreview - discountAmountPreview;
  const grandTotalPreview = baseGrandTotalPreview - discountAmountPreview;
  const currentStatusIndex = selectedTransaction
    ? statusSteps.findIndex((step) => step.value === selectedTransaction.status)
    : -1;
  const nextStatus = selectedTransaction
    ? getNextStatus(selectedTransaction.status)
    : null;
  const detailReferenceDate = new Date(detailReferenceTime);
  const selectedTransactionDiscountPercent = selectedTransaction
    ? getTransactionDiscountPercent(selectedTransaction, detailReferenceDate)
    : 0;
  const selectedTransactionDelayDiscount = selectedTransaction
    ? hasDelayDiscount(selectedTransaction, detailReferenceDate)
    : false;
  const selectedTransactionLiveUpdate = selectedTransaction
    ? getTransactionDelayDiscountUpdate(
        selectedTransaction,
        selectedTransactionDiscountPercent,
      )
    : null;
  const selectedTransactionView = selectedTransaction
    ? {
        ...selectedTransaction,
        ...(selectedTransactionLiveUpdate || {}),
      }
    : null;
  const selectedTransactionFinancialSummary = selectedTransactionView
    ? buildTransactionFinancialSummary(selectedTransactionView)
    : null;
  const pickupBlocked =
    selectedTransaction?.status === "ready" &&
    selectedTransaction.payment_status !== "paid";

  if (!loading && userOutletResolved && !hasAssignedOutlet) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="text-amber-600" size={32} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Belum Ada Toko Ditugaskan
          </h2>
          <p className="text-sm text-gray-500">
            Anda belum ditugaskan ke toko manapun. Silakan hubungi Admin untuk
            mendapatkan penugasan toko.
          </p>
        </div>
      </AnimatedPage>
    );
  }

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
          onClick={openTransactionModal}
          disabled={!userOutletResolved || !hasAssignedOutlet}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-100"
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
          <div
            className={`rounded-2xl border px-4 py-3.5 shadow-sm ${
              hasAssignedOutlet
                ? "border-blue-200 bg-white text-slate-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <p className="text-sm font-semibold">{kasirOutletAccess.displayLabel}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Toko mengikuti penugasan akun kasir.
            </p>
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
            onClick={closeTransactionModal}
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

              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Package size={12} /> Pilihan Paket *
                </label>
                {packages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packages.map((paket) => {
                      const selectedItem = formData.items.find(
                        (item) => item.paket_id === Number(paket.id),
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
                                {paket.jenis
                                  ? jenisLabels[paket.jenis] || paket.jenis
                                  : "Paket"}
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
                <p className="ml-1 text-[11px] text-slate-500">
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
                            title="Hapus paket"
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
                              className="w-full resize-none rounded-2xl border border-transparent bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-600/20"
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
                    Belum ada paket yang dipilih. Klik salah satu kartu paket di
                    atas untuk mulai menambahkan item transaksi.
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 text-orange-500">
                  <Clock size={12} /> Batas Waktu *
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minimumDueDateInput}
                  className="w-full rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3.5 text-sm font-bold text-orange-700 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                />
                <p className="ml-1 text-[11px] text-orange-500">
                  Tanggal dan jam batas waktu tidak bisa sebelum waktu sekarang.
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

              {formData.items.length > 0 && (
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm">
                    <span className="font-semibold text-orange-600">Batas Waktu</span>
                    <span className="font-bold text-orange-700">{formatDateTime(dueDatePreview)}</span>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white/70 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <span className="font-semibold">Paket Dipilih</span>
                      <span className="font-black text-blue-700">
                        {formData.items.length} item
                      </span>
                    </div>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div
                          key={`summary-${item.paket_id}`}
                          className="flex items-center justify-between gap-3 text-sm text-slate-600"
                        >
                          <span className="truncate">
                            {item.paket_name} x{item.quantity}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
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
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Tagihan</div>
                    <div className="text-2xl font-black text-blue-700">
                      {formatRupiah(selectedTransactionFinancialSummary?.grandTotal)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Ringkasan Tagihan
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">
                        {formatRupiah(selectedTransactionFinancialSummary?.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>{`Diskon (${selectedTransactionDiscountPercent}%)`}</span>
                      <span className="font-semibold">
                        - {formatRupiah(selectedTransactionFinancialSummary?.discountAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal Setelah Diskon</span>
                      <span className="font-semibold text-slate-800">
                        {formatRupiah(selectedTransactionFinancialSummary?.subtotalAfterDiscount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-amber-600">
                      <span>Pajak</span>
                      <span className="font-semibold">
                        + {formatRupiah(selectedTransactionFinancialSummary?.taxAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-purple-600">
                      <span>Biaya Tambahan</span>
                      <span className="font-semibold">
                        + {formatRupiah(selectedTransactionFinancialSummary?.additionalCost)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-blue-100 pt-3 text-blue-700">
                      <span className="font-bold">Total Tagihan</span>
                      <span className="text-lg font-black">
                        {formatRupiah(selectedTransactionFinancialSummary?.grandTotal)}
                      </span>
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
                    Diskon otomatis {DELAY_DISCOUNT_PERCENT}% langsung aktif saat transaksi dibuat.
                    Total tagihan akan langsung dihitung dengan potongan diskon tersebut.
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
                      {`Diskon Otomatis ${DELAY_DISCOUNT_PERCENT}%`}
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
