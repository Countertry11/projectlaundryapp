# Admin Duplicate Validation Design

**Date:** 2026-03-31

**Goal:** Mencegah admin menyimpan data toko dan paket cucian yang duplikat pada fitur tambah dan edit.

## Ringkasan

Halaman admin `toko` dan `paket cucian` saat ini langsung melakukan `insert` atau `update` ke Supabase tanpa validasi duplikasi. Perubahan ini menambahkan validasi berbasis nama yang dinormalisasi sebelum data disimpan.

## Ruang Lingkup

- Validasi duplikasi untuk `outlets.name` pada halaman admin toko.
- Validasi duplikasi untuk `tb_paket.nama_paket` pada halaman admin paket.
- Validasi berlaku saat tambah dan edit.
- Perbandingan mengabaikan huruf besar/kecil serta spasi berlebih di awal, akhir, dan antar kata.

## Aturan Validasi

### Toko

- `name` dianggap duplikat jika setelah dinormalisasi nilainya sama dengan toko lain yang aktif.
- Record yang sedang diedit tidak dianggap duplikat terhadap dirinya sendiri.

### Paket Cucian

- `nama_paket` dianggap duplikat jika setelah dinormalisasi nilainya sama dengan paket lain.
- Record yang sedang diedit tidak dianggap duplikat terhadap dirinya sendiri.

## Perilaku UI

- Jika ditemukan duplikat, proses simpan dibatalkan.
- Field terkait menampilkan pesan error yang jelas.
- Pesan error dibersihkan saat modal ditutup, form di-reset, atau nilai input diubah.
- Alert tetap dipakai untuk error tak terduga dari Supabase.

## Pendekatan Teknis

- Ekstrak helper normalisasi dan pengecekan duplikasi agar logika bisa diuji.
- Lakukan query ringan ke Supabase untuk mengambil kandidat pembanding sebelum `insert` atau `update`.
- Filter self-match pada mode edit dilakukan di sisi aplikasi.
- Tidak ada perubahan skema database pada tahap ini.

## Pengujian

- Tambahkan test untuk helper normalisasi.
- Tambahkan test untuk pendeteksian duplikasi yang mengabaikan kapitalisasi dan spasi.
- Tambahkan test yang memastikan record yang sedang diedit tidak dianggap duplikat terhadap dirinya sendiri.

## Risiko dan Batasan

- Tanpa unique constraint di database, race condition antar dua submit yang benar-benar bersamaan masih mungkin terjadi.
- Validasi ini fokus pada role admin dan halaman yang diminta, belum mengubah halaman lain.
