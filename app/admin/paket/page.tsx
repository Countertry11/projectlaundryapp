"use client";
import React, { useState, useEffect } from "react";
import { 
  Package, Plus, Edit3, Trash2, Layers, Save, X, Printer, DollarSign 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PaketPage() {
  const [pakets, setPakets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sesuaikan state dengan kolom database Anda: nama_paket, harga, jenis
  const [formData, setFormData] = useState({
    nama_paket: "",
    harga: "",
    jenis: "kiloan",
    id_outlet: "1" // Default id_outlet sesuai screenshot Anda
  });

  useEffect(() => {
    fetchPakets();
  }, []);

  async function fetchPakets() {
    // Memanggil tabel tb_paket sesuai screenshot
    const { data, error } = await supabase
      .from("tb_paket") 
      .select("*")
      .order("id", { ascending: false });
    
    if (error) {
      console.error("Gagal ambil data:", error.message);
    } else {
      console.log("Data berhasil ditarik:", data); // Cek di console log browser
      setPakets(data || []);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Input data sesuai struktur kolom di screenshot (nama_paket, harga, jenis)
      const { error } = await supabase.from("tb_paket").insert([
        { 
          nama_paket: formData.nama_paket, 
          harga: parseInt(formData.harga), 
          jenis: formData.jenis,
          id_outlet: parseInt(formData.id_outlet)
        }
      ]);

      if (error) throw error;
      alert("Paket berhasil ditambahkan!");
      setFormData({ ...formData, nama_paket: "", harga: "" });
      setIsModalOpen(false);
      fetchPakets();
    } catch (error: any) {
      alert("Error Simpan: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 text-slate-900 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 italic">KATALOG PAKET</h1>
          <p className="text-slate-500 text-sm">Update harga layanan laundry Anda</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg"
        >
          <Plus size={20} /> TAMBAH PAKET
        </button>
      </div>

      {/* Grid Kartu Paket */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pakets.length > 0 ? pakets.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <Package size={28} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={18} /></button>
                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
            
            <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
              {item.jenis} {/* Nama Kolom Database */}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1 capitalize">{item.nama_paket}</h3> {/* Nama Kolom Database */}
            <p className="text-3xl font-black text-blue-600 mt-4 flex items-baseline gap-1">
              <span className="text-sm font-bold italic">Rp</span>
              {item.harga?.toLocaleString('id-ID')} {/* Nama Kolom Database */}
            </p>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Data Paket tidak ditemukan di tabel "tb_paket"</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">Input Paket Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Paket</label>
                <input 
                  type="text" required placeholder="Contoh: Cuci Kiloan Express"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                  onChange={(e) => setFormData({...formData, nama_paket: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jenis</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 outline-none"
                    onChange={(e) => setFormData({...formData, jenis: e.target.value})}
                  >
                    <option value="kiloan">Kiloan</option>
                    <option value="selimut">Selimut</option>
                    <option value="bed_cover">Bed Cover</option>
                    <option value="kaos">Kaos</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Harga (Rp)</label>
                  <input 
                    type="number" required placeholder="0"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-800 font-bold"
                    onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-blue-200 transition-all active:scale-95 mt-4"
              >
                {loading ? "MENYIMPAN..." : "SIMPAN KE DATABASE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}