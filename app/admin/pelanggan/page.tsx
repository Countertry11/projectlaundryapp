"use client";
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  Search,
  Loader2,
  Users,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { AnimatedPage, AnimatedItem } from "@/components/AnimatedPage";
import { sanitizePhoneNumber } from "@/utils";
import { normalizeDisplayValue } from "@/lib/adminDuplicateValidation.mjs";
import { getCustomerDuplicateMessage } from "@/lib/customerDuplicateValidation.mjs";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}

export default function PelangganPage() {
  const [pelanggan, setPelanggan] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchPelanggan();
  }, []);

  async function fetchPelanggan() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPelanggan(data || []);
    } catch (error: unknown) {
      console.error("Gagal mengambil data:", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ name: "", phone: "", address: "" });
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setFormError("");
    setFormData({
      name: customer.name || "",
      phone: sanitizePhoneNumber(customer.phone),
      address: customer.address || "",
    });
    setEditingId(customer.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const normalizedName = normalizeDisplayValue(formData.name);
    const sanitizedPhone = sanitizePhoneNumber(formData.phone);

    try {
      const { data: existingCustomers, error: customerQueryError } = await supabase
        .from("customers")
        .select("id, name, phone");

      if (customerQueryError) throw customerQueryError;

      const duplicateMessage = getCustomerDuplicateMessage(
        existingCustomers || [],
        {
          name: normalizedName,
          phone: sanitizedPhone,
        },
        {
          excludeId: editingId,
        },
      );

      if (duplicateMessage) {
        setFormError(duplicateMessage);
        alert(duplicateMessage);
        return;
      }

      if (isEditMode && editingId) {
        const { error } = await supabase
          .from("customers")
          .update({
            ...formData,
            name: normalizedName,
            phone: sanitizedPhone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Pelanggan berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("customers").insert([
          {
            ...formData,
            name: normalizedName,
            phone: sanitizedPhone,
            is_member: true,
            total_transactions: 0,
            total_spent: 0,
          },
        ]);

        if (error) throw error;
        alert("Pelanggan berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchPelanggan();
    } catch (error: unknown) {
      alert("Gagal menyimpan: " + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;

      alert("Pelanggan berhasil dihapus!");
      setDeleteConfirm(null);
      fetchPelanggan();
    } catch (error: unknown) {
      alert("Gagal menghapus: " + getErrorMessage(error));
    }
  }

  const filteredPelanggan = pelanggan.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header Card */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 self-start">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center animate-scaleIn">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 animate-slideInRight" style={{ animationDelay: '100ms' }}>
              Data Pelanggan
            </h1>
            <p className="text-slate-500 text-sm animate-slideInRight" style={{ animationDelay: '200ms' }}>Manajemen pelanggan laundry</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-100 w-full md:w-auto justify-center animate-scaleIn" style={{ animationDelay: '300ms' }}
        >
          <UserPlus size={20} /> Tambah Pelanggan
        </button>
      </div>

      {/* Table */}
      <AnimatedItem animation="fadeInUp" style={{ animationDelay: '400ms' }} className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header with Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <h3 className="font-bold text-slate-800 text-lg self-start">
            Daftar Pelanggan
          </h3>

          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama atau telepon..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Nama</th>
                <th className="px-8 py-5">Telepon</th>
                <th className="px-8 py-5">Alamat</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={40}
                    />
                  </td>
                </tr>
              ) : filteredPelanggan.length > 0 ? (
                filteredPelanggan.map((item, index) => (
                  <AnimatedItem
                    as="tr"
                    key={item.id}
                    animation="slideInLeft"
                    index={index}
                    staggerDelay={50}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-8 py-5 font-bold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                      {item.phone}
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                      {item.address || "-"}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </AnimatedItem>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-slate-400 text-sm font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                       <Search className="w-10 h-10 text-slate-300 mb-2" />
                       Data tidak ditemukan.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AnimatedItem>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isEditMode ? "Edit Pelanggan" : "Pendaftaran Pelanggan"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {formError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                  {formError}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Nama Lengkap *
                </label>
                <input
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.name}
                  onChange={(e) =>
                    {
                      setFormError("");
                      setFormData({ ...formData, name: e.target.value });
                    }
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  No. Telepon *
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.phone}
                  onChange={(e) =>
                    {
                      setFormError("");
                      setFormData({
                        ...formData,
                        phone: sanitizePhoneNumber(e.target.value),
                      });
                    }
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Alamat
                </label>
                <textarea
                  placeholder="Alamat lengkap"
                  rows={3}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium resize-none"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isEditMode ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 scale-100 animate-pulse">
              <Trash2 className="text-rose-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Hapus Pelanggan?
            </h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">
              Data pelanggan akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
