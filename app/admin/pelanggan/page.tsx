"use client";
import React, { useState, useEffect } from "react";
import { UserPlus, Edit2, Trash2, X, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PelangganPage() {
  const [pelanggan, setPelanggan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State disesuaikan dengan kolom di database Anda: name, phone, email
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    fetchPelanggan();
  }, []);

  async function fetchPelanggan() {
    // Memanggil tabel 'customers' sesuai screenshot Supabase Anda
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data:", error.message);
    } else {
      setPelanggan(data || []);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Input ke tabel 'customers'
      const { error } = await supabase.from("customers").insert([formData]);
      if (error) throw error;
      alert("Pelanggan berhasil ditambahkan!");
      setFormData({ name: "", phone: "", email: "" });
      setIsModalOpen(false);
      fetchPelanggan();
    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Pelanggan</h1>
          <p className="text-gray-500 text-sm">Manajemen member laundry (Tabel Pelanggan).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
        >
          <UserPlus size={18} /> Tambah Pelanggan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Nama</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Telepon</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Email</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pelanggan.length > 0 ? pelanggan.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                <td className="p-4 text-sm text-gray-600">{item.phone}</td>
                <td className="p-4 text-sm text-gray-500">{item.email}</td>
                <td className="p-4 flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 italic">Data tidak ditemukan di tabel "customers".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center text-gray-800">
              <h3 className="font-bold text-xl text-gray-800">Registrasi Member Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Nama Lengkap</label>
                <input
                  type="text" required value={formData.name}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-black"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Nomor Telepon</label>
                <input
                  type="text" required value={formData.phone}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-black"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                <input
                  type="email" required value={formData.email}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-black"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
              >
                {loading ? "Menyimpan..." : "SIMPAN DATA PELANGGAN"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}