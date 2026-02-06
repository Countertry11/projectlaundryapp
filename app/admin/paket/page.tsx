"use client";
import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  Save,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Paket } from "@/types";
import { formatRupiah } from "@/utils";

export default function PaketPage() {
  const [pakets, setPakets] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nama_paket: "",
    harga: "",
    jenis: "kiloan",
    id_outlet: "1",
  });

  useEffect(() => {
    fetchPakets();
  }, []);

  async function fetchPakets() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tb_paket")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setPakets(data || []);
    } catch (error: any) {
      console.error("Gagal ambil data:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({ nama_paket: "", harga: "", jenis: "kiloan", id_outlet: "1" });
    setIsEditMode(false);
    setEditingId(null);
  }

  function openAddModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(paket: Paket) {
    setFormData({
      nama_paket: paket.nama_paket || "",
      harga: paket.harga?.toString() || "",
      jenis: paket.jenis || "kiloan",
      id_outlet: paket.id_outlet?.toString() || "1",
    });
    setEditingId(paket.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const paketData = {
        nama_paket: formData.nama_paket,
        harga: parseInt(formData.harga),
        jenis: formData.jenis,
        id_outlet: parseInt(formData.id_outlet),
      };

      if (isEditMode && editingId) {
        const { error } = await supabase
          .from("tb_paket")
          .update(paketData)
          .eq("id", editingId);

        if (error) throw error;
        alert("Paket berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("tb_paket").insert([paketData]);
        if (error) throw error;
        alert("Paket berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchPakets();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const { error } = await supabase.from("tb_paket").delete().eq("id", id);

      if (error) throw error;

      alert("Paket berhasil dihapus!");
      setDeleteConfirm(null);
      fetchPakets();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  const filteredPakets = pakets.filter(
    (p) =>
      p.nama_paket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.jenis?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const jenisLabels: Record<string, string> = {
    kiloan: "Kiloan",
    selimut: "Selimut",
    bed_cover: "Bed Cover",
    kaos: "Kaos",
    lain: "Lainnya",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 self-start">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Katalog Paket</h1>
            <p className="text-slate-500 text-sm">
              Kelola harga layanan laundry
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
              placeholder="Cari paket..."
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

      {/* Grid Kartu Paket */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPakets.length > 0 ? (
            filteredPakets.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Package size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                  {jenisLabels[item.jenis || ""] || item.jenis}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 capitalize">
                  {item.nama_paket}
                </h3>
                <p className="text-3xl font-black text-blue-600 mt-4">
                  {formatRupiah(item.harga)}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                {searchTerm
                  ? "Tidak ada paket yang cocok dengan pencarian."
                  : "Belum ada data paket."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center p-8 border-b border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isEditMode ? "Edit Paket" : "Tambah Paket"}
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
                  Nama Paket *
                </label>
                <input
                  required
                  placeholder="Contoh: Cuci Kiloan Express"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-medium"
                  value={formData.nama_paket}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_paket: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Jenis *
                  </label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium"
                    value={formData.jenis}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis: e.target.value })
                    }
                  >
                    <option value="kiloan">Kiloan</option>
                    <option value="selimut">Selimut</option>
                    <option value="bed_cover">Bed Cover</option>
                    <option value="kaos">Kaos</option>
                    <option value="lain">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Harga (Rp) *
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm transition-all font-bold"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                  />
                </div>
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
              Hapus Paket?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Data paket akan dihapus secara permanen.
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
