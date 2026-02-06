"use client";
import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Mars,
  Venus,
  X,
  Users,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: string;
  name: string;
  address: string;
  gender: string;
  phone: string;
}

export default function PelangganPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gender: "L",
    phone: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Nama dan nomor telepon wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("customers")
          .update({
            name: formData.name,
            address: formData.address,
            gender: formData.gender,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Pelanggan berhasil diperbarui!");
      } else {
        // Create new
        const { error } = await supabase.from("customers").insert([
          {
            name: formData.name,
            address: formData.address,
            gender: formData.gender,
            phone: formData.phone,
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
      fetchCustomers();
    } catch (error: any) {
      alert("Error: " + error.message);
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
      fetchCustomers();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  function openEditModal(customer: Customer) {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      address: customer.address || "",
      gender: customer.gender || "L",
      phone: customer.phone || "",
    });
    setIsModalOpen(true);
  }

  function resetForm() {
    setFormData({ name: "", address: "", gender: "L", phone: "" });
    setEditingId(null);
  }

  const filteredCustomers = customers.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 space-y-6 font-sans text-slate-800">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">
              Data Pelanggan
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              Manajemen registrasi member laundry
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <UserPlus size={18} />
          Tambah Pelanggan
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search
            className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
        </div>
        <input
          type="text"
          placeholder="Cari nama atau nomor telepon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Pelanggan
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">
                  Gender
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Kontak
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-500"
                      size={40}
                    />
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm tracking-tight">
                          {customer.name}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {customer.address || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            customer.gender === "L"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-pink-50 text-pink-600 border border-pink-100"
                          }`}
                        >
                          {customer.gender === "L" ? (
                            <Mars size={12} />
                          ) : (
                            <Venus size={12} />
                          )}
                          {customer.gender === "L" ? "Pria" : "Wanita"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <Phone size={14} className="text-gray-300" />
                        {customer.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(customer.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-20 text-center text-gray-400 italic"
                  >
                    {searchTerm
                      ? "Tidak ada pelanggan yang cocok"
                      : "Belum ada data pelanggan"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-800">
                {editingId ? "Edit Pelanggan" : "Tambah Pelanggan"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Alamat
                </label>
                <input
                  type="text"
                  placeholder="Masukkan alamat"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Jenis Kelamin *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  No. Telepon *
                </label>
                <input
                  type="text"
                  placeholder="08..."
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  {editingId ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Hapus Pelanggan?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Data pelanggan akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
