"use client";

import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, Save, ArrowRight, User, Package, 
  Hash, Percent, FileText, ChevronDown, Tag, Clock, 
  CheckCircle, CreditCard, Calendar, AlertCircle 
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// --- KONFIGURASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TransaksiPage() {
  const [loading, setLoading] = useState(false);
  
  // State Data Database
  const [members, setMembers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  
  // State Form
  const [formData, setFormData] = useState({
    id_member: "",
    id_paket: "",
    qty: 1,
    biaya_tambahan: 0,
    diskon: 0,
    pajak: 0,
    keterangan: ""
  });

  // State UI & Perhitungan
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [totalBayar, setTotalBayar] = useState(0);
  const [estimationDate, setEstimationDate] = useState("");

  // 1. LOAD DATA DARI SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      const { data: memberData } = await supabase.from('tb_member').select('*');
      if (memberData) setMembers(memberData);

      const { data: packageData } = await supabase.from('tb_paket').select('*');
      if (packageData) setPackages(packageData);
    };
    fetchData();
  }, []);

  // 2. LOGIKA HITUNG TOTAL
  useEffect(() => {
    const harga = Number(selectedPackage?.harga) || 0;
    const qty = Number(formData.qty) || 0;
    const subtotal = harga * qty;
    const diskonAmount = subtotal * (Number(formData.diskon) / 100);
    const total = subtotal - diskonAmount + Number(formData.pajak) + Number(formData.biaya_tambahan);
    
    setTotalBayar(total);
    
    const today = new Date();
    today.setDate(today.getDate() + 3);
    setEstimationDate(today.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }));
  }, [formData, selectedPackage]);

  // 3. FUNGSI SIMPAN TRANSAKSI
  const handleSimpanTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_member || !formData.id_paket) {
      alert("Mohon pilih pelanggan dan paket terlebih dahulu!");
      return;
    }
    
    setLoading(true);
    try {
      const { data: trans, error: errTrans } = await supabase
        .from('tb_transaksi')
        .insert([{ 
          id_member: formData.id_member,
          id_outlet: 1,
          tgl: new Date().toISOString(),
          batas_waktu: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'baru',
          dibayar: 'belum_dibayar',
          pajak: formData.pajak,
          diskon: formData.diskon,
          biaya_tambahan: formData.biaya_tambahan,
          kode_invoice: `INV-${Date.now()}`,
          id_user: 1
        }])
        .select()
        .single();

      if (errTrans) throw errTrans;

      const { error: errDetail } = await supabase
        .from('tb_detail_transaksi')
        .insert([{
          id_transaksi: trans.id,
          id_paket: formData.id_paket,
          qty: formData.qty,
          keterangan: formData.keterangan
        }]);

      if (errDetail) throw errDetail;

      alert("Transaksi Berhasil Disimpan!");
      setFormData({ id_member: "", id_paket: "", qty: 1, biaya_tambahan: 0, diskon: 0, pajak: 0, keterangan: "" });
      setSelectedPackage(null);
      setSelectedMember(null);

    } catch (error: any) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Entri Transaksi</h1>
          <p className="text-slate-500 text-sm font-medium">Lengkapi rincian laundry di bawah ini.</p>
        </div>
        <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
          <ShoppingCart size={24} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: FORM INPUT */}
        <form onSubmit={handleSimpanTransaksi} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pilih Member */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Pelanggan</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 text-slate-900 outline-none appearance-none"
                    value={formData.id_member}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({...formData, id_member: val});
                      setSelectedMember(members.find(m => m.id.toString() === val));
                    }}
                    required
                  >
                    <option value="">Cari Nama Pelanggan</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400" size={20} />
                </div>
              </div>

              {/* Pilih Paket */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider ml-1">Paket Laundry</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 text-slate-900 outline-none appearance-none"
                    value={formData.id_paket}
                    onChange={(e) => {
                      const val = e.target.value;
                      const pkg = packages.find(p => p.id.toString() === val);
                      setFormData({...formData, id_paket: val});
                      setSelectedPackage(pkg);
                    }}
                    required
                  >
                    <option value="">Pilih Jenis Layanan</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.nama_paket} (Rp {p.harga})</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400" size={20} />
                </div>
              </div>
            </div>

            {/* Bagian Detail Biaya yang diperbarui */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Jumlah (Qty) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Jumlah</label>
                <div className="relative">
                  <input 
                    type="number" min="0"
                    className="w-full p-3 pr-12 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    value={formData.qty} 
                    onChange={e => setFormData({...formData, qty: Number(e.target.value)})} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">pcs</span>
                </div>
              </div>

              {/* Diskon */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Diskon</label>
                <div className="relative">
                  <input 
                    type="number" min="0" max="100"
                    className="w-full p-3 pr-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 outline-none" 
                    value={formData.diskon} 
                    onChange={e => setFormData({...formData, diskon: Number(e.target.value)})} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Pajak */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Pajak</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input 
                    type="number"
                    className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 outline-none" 
                    value={formData.pajak} 
                    onChange={e => setFormData({...formData, pajak: Number(e.target.value)})} 
                  />
                </div>
              </div>

              {/* Biaya Tambahan */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Tambahan</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input 
                    type="number"
                    className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 outline-none" 
                    value={formData.biaya_tambahan} 
                    onChange={e => setFormData({...formData, biaya_tambahan: Number(e.target.value)})} 
                  />
                </div>
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Keterangan Tambahan</label>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 text-slate-900 outline-none focus:border-blue-500 resize-none"
                placeholder="Contoh: Baju putih jangan dicampur..."
                value={formData.keterangan}
                onChange={e => setFormData({...formData, keterangan: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save size={20}/> SIMPAN TRANSAKSI BARU <ArrowRight size={20}/></>}
          </button>
        </form>

        {/* KOLOM KANAN: RINGKASAN */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={100} />
            </div>
            <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
              <CreditCard className="text-blue-400" size={20}/> Ringkasan Pembayaran
            </h3>
            <div className="space-y-4 border-b border-slate-700 pb-6 mb-6">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Harga Paket</span>
                <span className="text-white font-bold">Rp {(selectedPackage?.harga || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal ({formData.qty} pcs)</span>
                <span className="text-white font-bold">Rp {((selectedPackage?.harga || 0) * formData.qty).toLocaleString()}</span>
              </div>
              {formData.diskon > 0 && (
                <div className="flex justify-between text-red-400 text-sm">
                  <span>Diskon {formData.diskon}%</span>
                  <span>- Rp {(((selectedPackage?.harga || 0) * formData.qty) * (formData.diskon/100)).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-400 text-sm">
                <span>Pajak & Tambahan</span>
                <span>+ Rp {(formData.pajak + formData.biaya_tambahan).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Total Bayar</span>
              </div>
              <span className="text-3xl font-black text-blue-400">Rp {totalBayar.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-blue-900 font-bold text-xs uppercase tracking-tighter">Estimasi Selesai</p>
              <p className="text-blue-700 font-black text-sm">{estimationDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}