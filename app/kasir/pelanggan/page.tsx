"use client";
import React, { useState } from "react";
import { UserPlus, Search, Edit2, Trash2, Phone, MapPin, Mars, Venus, X, Users } from "lucide-react";

export default function PelangganPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data Member berdasarkan Gambar Kerja tb_member
  const [members, setMembers] = useState([
    { id: 1, nama: "Budi Santoso", alamat: "Jl. Mawar No. 12, Malang", jenis_kelamin: "L", tlp: "081234567890" },
    { id: 2, nama: "Siti Aminah", alamat: "Perum Permata A5, Malang", jenis_kelamin: "P", tlp: "085678901234" },
    { id: 3, nama: "Doni Tata", alamat: "Kavling Hijau B3, Malang", jenis_kelamin: "L", tlp: "087712345678" },
  ]);

  const filteredMembers = members.filter(m => 
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || m.tlp.includes(searchTerm)
  );

  return (
    // Background utama disesuaikan dengan area konten dashboard Anda
    <div className="min-h-screen bg-[#f3f4f6] p-6 space-y-6 font-sans text-slate-800">
      
      {/* HEADER - Putih dengan Shadow Lembut */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Data Pelanggan</h1>
            <p className="text-gray-400 text-sm font-medium">Manajemen registrasi member laundry</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          <UserPlus size={18} />
          Tambah Pelanggan
        </button>
      </div>

      {/* SEARCH INPUT - Minimalis sesuai Tema Dashboard */}
      <div className="relative max-w-md group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
        </div>
        <input
          type="text"
          placeholder="Cari nama atau nomor telepon member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 text-gray-700 pl-11 pr-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
        />
      </div>

      {/* TABEL DATA - Card Putih Bersih */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Member</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Gender</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Kontak</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm tracking-tight">{member.nama}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {member.alamat}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        member.jenis_kelamin === 'L' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-pink-50 text-pink-600 border border-pink-100'
                      }`}>
                        {member.jenis_kelamin === 'L' ? <Mars size={12} /> : <Venus size={12} />}
                        {member.jenis_kelamin === 'L' ? 'Pria' : 'Wanita'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                      <Phone size={14} className="text-gray-300" />
                      {member.tlp}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
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

      {/* MODAL TAMBAH - Tema Terang Bersih */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-800">Tambah Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                <input type="text" placeholder="Masukkan nama" className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kelamin *</label>
                <select className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">No. Telepon *</label>
                <input type="text" placeholder="08..." className="w-full bg-gray-50 border border-transparent focus:border-blue-600/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}