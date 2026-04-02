# Kasir Always On Discount Design

**Goal:** Membuat diskon transaksi kasir langsung aktif otomatis sebesar 5% sejak transaksi dibuat dan selalu tampil aktif di UI.

## Ringkasan

Kebutuhan terbaru tidak lagi menunggu `due_date` atau keterlambatan waktu. Diskon 5% harus langsung diberlakukan pada transaksi kasir dan langsung terlihat di preview, daftar transaksi, dan detail transaksi.

## Aturan

- Diskon transaksi kasir selalu `5%`.
- Diskon aktif sejak transaksi dibuat.
- Tampilan detail transaksi harus selalu menunjukkan diskon `5%` sudah berlaku.
- `grand_total` harus selalu dihitung dengan potongan diskon `5%`.

## Implementasi

- Ubah helper diskon transaksi agar selalu mengembalikan `5%` dan status aktif.
- Pertahankan jalur sinkronisasi transaksi yang sudah ada agar transaksi lama otomatis ikut tersinkron ke diskon `5%`.
- Perbarui copy UI yang masih menjelaskan aturan berbasis keterlambatan.
