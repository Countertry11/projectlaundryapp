# Admin Transaction Multi Package Design

**Date:** 2026-03-31

**Goal:** Mengubah form tambah transaksi admin agar bisa memilih lebih dari satu paket dan memberi keterangan per paket.

## Ringkasan

Halaman admin transaksi saat ini hanya mendukung satu paket melalui dropdown. Perubahan ini mengganti pemilihan paket menjadi katalog kartu yang bisa ditambahkan ke daftar item transaksi, sehingga satu transaksi dapat berisi banyak paket dengan quantity dan keterangan masing-masing.

## Ruang Lingkup

- Berlaku pada form tambah transaksi di halaman admin transaksi.
- Paket tidak lagi dipilih dari dropdown tunggal.
- Satu transaksi dapat memiliki banyak item paket.
- Setiap item paket memiliki quantity dan keterangan sendiri.
- Total transaksi, pajak, dan grand total dihitung dari seluruh item.

## Aturan Interaksi

- Paket dipilih dari daftar kartu paket yang dapat diklik.
- Jika paket yang sama dipilih lagi, item yang sudah ada dinaikkan quantity-nya agar daftar tetap ringkas.
- Admin dapat mengubah quantity per item.
- Admin dapat mengisi keterangan per item.
- Admin dapat menghapus item dari daftar sebelum transaksi disimpan.
- Minimal satu item paket wajib dipilih sebelum submit.

## Perilaku Penyimpanan

- Header transaksi tetap disimpan ke tabel `transactions`.
- Detail transaksi disimpan sebagai banyak baris di `transaction_details`, satu baris per item paket yang dipilih.
- Setiap detail menyimpan quantity, price, dan notes item tersebut.
- Dengan kondisi kode saat ini, identitas paket pada detail masih mengandalkan harga saat dibaca ulang di fitur lain. Ini adalah keterbatasan yang sudah ada sebelum perubahan ini.

## Pendekatan Teknis

- Ekstrak helper untuk mengelola daftar item paket dan menghitung ringkasan transaksi.
- Form state admin transaksi diubah dari single package menjadi array `items`.
- UI paket memakai kartu pilihan dan panel rincian item yang dapat diedit inline.
- Preview total memakai akumulasi seluruh item transaksi.

## Pengujian

- Tambahkan test helper untuk menambahkan item paket.
- Tambahkan test helper untuk menaikkan quantity jika paket yang sama dipilih ulang.
- Tambahkan test helper untuk menghitung subtotal, pajak, dan grand total dari banyak item.
