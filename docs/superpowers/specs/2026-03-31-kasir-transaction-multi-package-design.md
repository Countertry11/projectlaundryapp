# Kasir Transaction Multi Package Design

**Date:** 2026-03-31

**Goal:** Mengubah form tambah transaksi kasir agar bisa memilih lebih dari satu paket dengan keterangan per paket, serta membatasi batas waktu agar tidak bisa sebelum tanggal dan jam sekarang.

## Ringkasan

Halaman kasir transaksi saat ini hanya mendukung satu paket melalui dropdown. Perubahan ini mengganti pemilihan paket menjadi katalog kartu yang bisa ditambahkan ke daftar item transaksi, sehingga satu transaksi dapat berisi banyak paket dengan quantity dan keterangan masing-masing. Field batas waktu juga dibatasi agar tidak menerima tanggal atau jam lampau pada hari yang sama.

## Ruang Lingkup

- Berlaku pada form tambah transaksi di halaman kasir transaksi.
- Paket tidak lagi dipilih dari dropdown tunggal.
- Satu transaksi dapat memiliki banyak item paket.
- Setiap item paket memiliki quantity dan keterangan sendiri.
- Batas waktu tidak boleh sebelum waktu sekarang.
- Total transaksi, pajak, dan grand total dihitung dari seluruh item.

## Aturan Interaksi

- Paket dipilih dari daftar kartu paket yang dapat diklik.
- Jika paket yang sama dipilih lagi, item yang sudah ada dinaikkan quantity-nya agar daftar tetap ringkas.
- Kasir dapat mengubah quantity per item.
- Kasir dapat mengisi keterangan per item.
- Kasir dapat menghapus item dari daftar sebelum transaksi disimpan.
- Minimal satu item paket wajib dipilih sebelum submit.

## Aturan Batas Waktu

- Input `datetime-local` memakai nilai minimum berdasarkan waktu WIB saat modal dibuka.
- Nilai minimum diperbarui berkala saat modal terbuka agar jam yang sudah lewat ikut terkunci.
- Validasi submit tetap memeriksa ulang nilai input agar manipulasi manual tetap tertolak.
- Pesan validasi menjelaskan bahwa batas waktu tidak boleh sebelum waktu sekarang.

## Perilaku Penyimpanan

- Header transaksi tetap disimpan ke tabel `transactions`.
- Detail transaksi disimpan sebagai banyak baris di `transaction_details`, satu baris per item paket yang dipilih.
- Setiap detail menyimpan quantity, price, dan notes item tersebut.
- Dengan kondisi kode saat ini, identitas paket pada detail masih mengandalkan harga saat dibaca ulang di fitur lain. Ini adalah keterbatasan yang sudah ada sebelum perubahan ini.

## Pendekatan Teknis

- Reuse helper item transaksi dan guard tanggal yang sudah dipakai admin agar perilaku kasir konsisten.
- Form state kasir transaksi diubah dari single package menjadi array `items`.
- UI paket memakai kartu pilihan dan panel rincian item yang dapat diedit inline.
- Preview total memakai akumulasi seluruh item transaksi.
- Batas waktu memakai helper minimum waktu sekarang dan validasi submit yang sama dengan admin.

## Pengujian

- Tambahkan test helper untuk default form kasir multi-paket.
- Tambahkan test helper untuk memastikan outlet awal, due date awal, dan daftar item kosong tersusun benar.
- Jalankan test node dan build aplikasi untuk memastikan perubahan kasir tidak merusak alur admin yang sudah memakai helper yang sama.
