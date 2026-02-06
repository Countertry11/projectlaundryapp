"use client";
import React, { useState, useEffect } from "react";
import {
  Store,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Phone,
  Building2,
  X,
  Loader2,
  Save,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Outlet } from "@/types";

export default function OutletPage() {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  async function fetchOutlets() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("outlets")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOutlets(data || []);
    } catch (error: any) {
      console.error("Gagal ambil data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ name: "", address: "", phone: "", email: "", manager: "" });
    setIsEditMode(false);
    setEditingId(null);
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(outlet: Outlet) {
    setFormData({
      name: outlet.name || "",
      address: outlet.address || "",
      phone: outlet.phone || "",
      email: outlet.email || "",
      manager: outlet.manager || "",
    });
    setEditingId(outlet.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditMode && editingId) {
        const { error } = await supabase
          .from("outlets")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Outlet berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("outlets").insert([
          {
            ...formData,
            is_active: true,
          },
        ]);

        if (error) throw error;
        alert("Outlet berhasil disimpan!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchOutlets();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from("outlets").delete().eq("id", id);

      if (error) throw error;

      alert("Outlet berhasil dihapus!");
      setDeleteConfirm(null);
      fetchOutlets();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  const filteredOutlets = outlets.filter(
    (o) =>
      o.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header Card */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 self-start">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center">
            <Store className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manajemen Outlet
            </h1>
            <p className="text-slate-500 text-sm">
              Kelola lokasi cabang laundry
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari outlet..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Tambah
          </button>
        </div>
      </div>

      {/* Grid Kartu Outlet */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutlets.length > 0 ? (
            filteredOutlets.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Store size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">
                  {item.name}
                </h3>
                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {item.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} /> {item.phone || "-"}
                  </p>
                  {item.manager && (
                    <p className="flex items-center gap-2 text-blue-600 font-medium">
                      <Building2 size={14} /> Manager: {item.manager}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
              {searchTerm
                ? "Tidak ada outlet yang cocok dengan pencarian."
                : 'Belum ada data outlet. Klik "Tambah Outlet" untuk mengisi.'}
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <Building2 className="text-blue-600" size={24} />
                {isEditMode ? "Edit Outlet" : "Tambah Outlet"}
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Nama Outlet *
                </label>
                <input
                  required
                  placeholder="Contoh: Cabang Utama"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  No. Telepon
                </label>
                <input
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="outlet@laundry.com"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Manager
                </label>
                <input
                  placeholder="Nama manager"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  required
                  placeholder="Alamat lengkap outlet"
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
                  {isEditMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-rose-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Hapus Outlet?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Outlet akan dinonaktifkan dari sistem.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
