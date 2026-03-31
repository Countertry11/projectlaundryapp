# Report Export PDF Button Consistency Design

**Date:** 2026-03-31

**Goal:** Menyamakan dan memperbagus tombol `Export PDF` di halaman laporan admin, kasir, dan owner.

## Ringkasan

Tombol `Export PDF` pada tiga halaman laporan saat ini sudah berfungsi, tetapi tampilannya belum konsisten. Perubahan ini membuat satu komponen tombol export bersama agar visual, state loading, state disabled, dan hierarki interaksinya sama di semua role.

## Ruang Lingkup

- Berlaku pada halaman laporan admin.
- Berlaku pada halaman laporan kasir.
- Berlaku pada halaman laporan owner.
- Tidak mengubah alur export PDF, isi PDF, atau utilitas export.
- Fokus pada visual tombol, interaksi, dan konsistensi implementasi.

## Tujuan Visual

- Tombol terlihat lebih tegas sebagai aksi utama export.
- Identitas PDF tetap jelas dengan aksen merah yang konsisten.
- Ukuran klik lebih nyaman di desktop dan mobile.
- State normal, loading, hover, dan disabled mudah dibedakan.
- Ketiga role memakai gaya tombol yang sama agar terasa satu produk.

## Aturan Interaksi

- Label default tetap `Export PDF`.
- Saat export berjalan, label berubah menjadi `Mengekspor...`.
- Saat loading, spinner menggantikan ikon PDF.
- Tombol disabled saat data belum siap atau proses export sedang berjalan.
- Hover memberi umpan balik elevasi ringan tanpa mengubah layout.

## Pendekatan Teknis

- Buat komponen shared `ReportExportPdfButton`.
- Pindahkan ikon, spinner, label, dan base style ke komponen tersebut.
- Halaman admin, kasir, dan owner hanya mengirim props `onClick`, `disabled`, dan `exporting`.
- Tambahkan helper kecil yang mengatur label dan class state agar bisa diuji tanpa setup test React yang besar.

## Pengujian

- Tambahkan test helper untuk label tombol normal dan loading.
- Tambahkan test helper untuk memastikan class utama memuat state visual penting seperti hover dan disabled.
- Jalankan lint file yang diubah, test node, dan build aplikasi.
