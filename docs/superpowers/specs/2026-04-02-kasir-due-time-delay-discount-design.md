# Kasir Due Time Delay Discount Design

**Goal:** Mengubah diskon keterlambatan transaksi kasir agar mengikuti `due_date` sampai level tanggal dan jam, lalu aktif otomatis 5% begitu melewati batas waktu tersebut.

## Ringkasan

Aturan final diskon keterlambatan harus mengacu pada `batas waktu cuci`. Jika `due_date` diisi `2026-04-02 12:00`, maka diskon belum aktif pada `12:00` tepat, tetapi aktif mulai `12:01` dan seterusnya. Aturan ini berlaku untuk preview transaksi baru, daftar transaksi, detail transaksi, dan sinkronisasi transaksi yang sudah tersimpan.

## Aturan

- Diskon keterlambatan tetap flat `5%`.
- Acuan diskon adalah `due_date`, bukan `transaction_date`.
- Diskon aktif hanya jika waktu referensi sudah **melewati** `due_date`.
- Contoh:
  - `due_date = 2026-04-02 12:00`
  - `2026-04-02 12:00` => belum diskon
  - `2026-04-02 12:01` => diskon aktif `5%`
- `due_date` tetap harus lolos validasi minimal waktu sekarang saat transaksi dibuat atau saat estimasi diubah.

## Implementasi

- Pertahankan helper diskon telat sebagai pusat aturan, tetapi ubah perbandingannya menjadi timestamp WIB, bukan selisih hari kalender.
- Pastikan helper memperlakukan nilai yang sama (`reference == due_date`) sebagai belum telat.
- Halaman kasir tetap memakai helper yang sama saat:
  - preview transaksi baru
  - insert transaksi baru
  - sinkronisasi daftar transaksi
  - detail transaksi saat `due_date` diubah
- Perbarui teks UI agar menjelaskan aturan “melewati batas waktu”, bukan “tanggal masuk” atau “hari ketiga”.

## Risiko

- Input `datetime-local` dan data database sama-sama disimpan sebagai waktu WIB naive (`YYYY-MM-DDTHH:mm[:ss]`), jadi helper harus memakai parser WIB yang sama agar perbandingan menit akurat.
