"use client";
import React, { useState, useEffect } from "react";
import { Store, Plus, Edit3, Trash2, MapPin, Phone, Building2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OutletPage() {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State disesuaikan dengan kolom di Supabase Anda: name, address, phone
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: ""
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  async function fetchOutlets() {
    // Memanggil tabel 'outlets' sesuai screenshot Anda
    const { data, error } = await supabase.from("outlets").select("*");
    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      setOutlets(data || []);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("outlets").insert([formData]);
      if (error) throw error;
      alert("Outlet berhasil disimpan!");
      setFormData({ name: "", address: "", phone: "" });
      setIsModalOpen(false);
      fetchOutlets();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header sesuai UI Dashboard Anda */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Outlet</h1>
          <p className="text-gray-500 text-sm">Kelola lokasi cabang laundry.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
        >
          <Plus size={18} /> Tambah Outlet
        </button>
      </div>

      {/* Grid Kartu Outlet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.length > 0 ? outlets.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store size={24} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 size={16} /></button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            {/* Menggunakan nama kolom: name, address, phone */}
            <h3 className="text-lg font-bold text-gray-800 mb-2">{item.name}</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p className="flex items-center gap-2"><MapPin size={14} /> {item.address}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {item.phone}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            Belum ada data outlet. Klik "Tambah Outlet" untuk mengisi.
          </div>
        )}
      </div>

      {/* Modal - Dipaksa Light Mode agar Teks Hitam Jelas */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center text-gray-800">
              <h3 className="font-bold text-xl flex items-center gap-2"><Building2 size={20} className="text-blue-600" /> Tambah Outlet</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Nama Outlet</label>
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
                <label className="text-xs font-bold text-gray-400 uppercase">Alamat Lengkap</label>
                <textarea
                  required value={formData.address}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-black h-28"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                ></textarea>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
              >
                {loading ? "Menyimpan..." : "SIMPAN DATA OUTLET"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}