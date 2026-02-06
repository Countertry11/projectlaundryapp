"use client";
import React, { useState } from "react";
import { 
  Plus, Search, Edit, Trash2, Receipt, 
  Calendar, User, Package, CreditCard, 
  Filter, CheckCircle2, Clock, X 
} from "lucide-react";

export default function TransaksiKasir() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Transaksi Berdasarkan Gambar Kerja PDM (tb_transaksi) [cite: 142-152]
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      invoice: "INV-2026001", 
      pelanggan: "Budi Santoso", 
      paket: "Kiloan (5kg)", 
      tgl: "2026-01-31",
      status: "baru", 
      pembayaran: "dibayar", 
      total: 35000 
    },
    { 
      id: 2, 
      invoice: "INV-2026002", 
      pelanggan: "Siti Aminah", 
      paket: "Bed Cover", 
      tgl: "2026-01-31",
      status: "proses", 
      pembayaran: "dibayar", 
      total: 50000 
    },
    { 
      id: 3, 
      invoice: "INV-2026003", 
      pelanggan: "Doni Tata", 
      paket: "Kaos", 
      tgl: "2026-01-30",
      status: "selesai", 
      pembayaran: "belum_dibayar", 
      total: 15000 
    },
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 space-y-6 font-sans text-slate-800">
      
      {/* HEADER SECTION - Identik dengan Screenshot Dashboard */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Receipt size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Entri Transaksi</h1>
            <p className="text-gray-400 text-sm font-medium">Input dan kelola pesanan laundry pelanggan[cite: 117].</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Buat Transaksi Baru
        </button>
      </div>

      {/* FILTER & SEARCH BOX */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari kode invoice atau nama pelanggan..."
            className="w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium shadow-sm"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
          <Filter size={18} />
          Filter Status
        </button>
      </div>

      {/* TRANSACTION TABLE - Mengikuti Screenshot Aktivitas Terkini */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Invoice</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Pelanggan</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Paket</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Pembayaran</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Total Bayar</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6 font-bold text-blue-600 text-sm tracking-tight">
                    {trx.invoice}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-bold text-gray-800 text-sm tracking-tight">
                      {trx.pelanggan}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                    {trx.paket}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        trx.status === 'baru' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        trx.status === 'proses' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {trx.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        trx.pembayaran === 'dibayar' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {trx.pembayaran === 'dibayar' ? 'LUNAS' : 'BELUM BAYAR'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-800 text-sm">
                    Rp {trx.total.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit size={16} />
                      </button>
                      <button className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT TRANSAKSI - Design UI Premium */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-black text-gray-800">Transaksi Baru</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field Pelanggan (id_member) [cite: 144] */}
              <div className="space-y-1.5 col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <User size={12} /> Pilih Member *
                </label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all cursor-pointer">
                  <option>Budi Santoso</option>
                  <option>Siti Aminah</option>
                </select>
              </div>

              {/* Field Paket (id_paket) [cite: 153] */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Package size={12} /> Pilih Paket *
                </label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all cursor-pointer">
                  <option>Kiloan (5kg)</option>
                  <option>Bed Cover</option>
                  <option>Selimut</option>
                </select>
              </div>

              {/* Batas Waktu [cite: 146] */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Clock size={12} /> Batas Waktu *
                </label>
                <input type="date" className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all" />
              </div>

              {/* Status Pembayaran [cite: 158] */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <CreditCard size={12} /> Pembayaran *
                </label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all cursor-pointer">
                  <option value="belum_dibayar">Belum Bayar</option>
                  <option value="dibayar">Dibayar (Lunas)</option>
                </select>
              </div>

              {/* Status Pesanan [cite: 157] */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Status Pesanan *
                </label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none transition-all cursor-pointer">
                  <option value="baru">Baru</option>
                  <option value="proses">Proses</option>
                </select>
              </div>

              <div className="col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">
                  Batalkan
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                  Proses Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}