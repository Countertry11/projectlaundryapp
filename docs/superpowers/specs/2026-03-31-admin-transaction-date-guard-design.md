# Admin Transaction Date Guard Design

**Date:** 2026-03-31

**Goal:** Mencegah admin memilih tanggal dan jam batas waktu transaksi sebelum waktu saat ini pada form tambah transaksi.

## Ringkasan

Halaman admin transaksi menggunakan input `datetime-local` untuk field `due_date` atau "Batas Waktu Cuci". Saat ini field tersebut masih bisa mengizinkan waktu yang sudah lewat pada hari yang sama. Perubahan ini membatasi pilihan tanggal dan jam agar tidak bisa sebelum waktu sekarang menurut WIB.

## Ruang Lingkup

- Berlaku pada form tambah transaksi di halaman admin transaksi.
- Membatasi field `Batas Waktu Cuci`.
- Menambahkan validasi pada UI dan saat submit.
- Tidak mengubah field `transaction_date`, karena field itu sudah diisi otomatis saat submit.

## Aturan Validasi

- Nilai `due_date` tidak boleh lebih kecil dari waktu sekarang.
- Tanggal hari ini tetap diperbolehkan selama jam dan menitnya belum lewat dari waktu saat ini.
- Validasi mengikuti zona waktu WIB agar konsisten dengan utilitas tanggal proyek.

## Perilaku UI

- Input `datetime-local` diberi atribut `min` agar browser mencegah pemilihan tanggal dan jam sebelum waktu sekarang.
- Saat modal transaksi terbuka, nilai minimum diperbarui berkala agar jam yang baru lewat ikut terkunci.
- Jika nilai input tetap dimanipulasi secara manual ke waktu lampau, submit diblokir dengan pesan yang jelas.

## Pendekatan Teknis

- Ekstrak helper kecil untuk menghitung batas minimum waktu input transaksi admin dalam format `YYYY-MM-DDTHH:mm`.
- Helper kedua memeriksa apakah nilai `due_date` berada sebelum batas minimum tersebut.
- Gunakan helper yang sama pada atribut `min` dan pada `handleSubmit`.

## Pengujian

- Tambahkan test untuk helper batas minimum waktu WIB.
- Tambahkan test untuk validasi waktu lampau.
- Tambahkan test untuk memastikan waktu yang sama atau sesudah batas minimum tetap dianggap valid.
