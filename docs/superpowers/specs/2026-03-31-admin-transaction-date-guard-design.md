# Admin Transaction Date Guard Design

**Date:** 2026-03-31

**Goal:** Mencegah admin memilih tanggal batas waktu transaksi sebelum hari ini pada form tambah transaksi.

## Ringkasan

Halaman admin transaksi menggunakan input `datetime-local` untuk field `due_date` atau "Batas Waktu Cuci". Saat ini field tersebut belum punya batas minimum, sehingga admin masih bisa memilih tanggal lampau. Perubahan ini membatasi pilihan tanggal agar tidak bisa sebelum tanggal hari ini menurut WIB.

## Ruang Lingkup

- Berlaku pada form tambah transaksi di halaman admin transaksi.
- Membatasi field `Batas Waktu Cuci`.
- Menambahkan validasi pada UI dan saat submit.
- Tidak mengubah field `transaction_date`, karena field itu sudah diisi otomatis saat submit.

## Aturan Validasi

- Nilai `due_date` tidak boleh memiliki tanggal sebelum hari ini.
- Waktu pada hari ini masih diperbolehkan, karena kebutuhan hanya melarang tanggal sebelum hari ini.
- Validasi mengikuti zona waktu WIB agar konsisten dengan utilitas tanggal proyek.

## Perilaku UI

- Input `datetime-local` diberi atribut `min` agar browser mencegah pemilihan tanggal sebelum hari ini.
- Jika nilai input tetap dimanipulasi secara manual ke tanggal lampau, submit diblokir dengan pesan yang jelas.

## Pendekatan Teknis

- Ekstrak helper kecil untuk menghitung batas minimum tanggal input transaksi admin dalam format `YYYY-MM-DDTHH:mm`.
- Helper kedua memeriksa apakah nilai `due_date` berada sebelum batas minimum tersebut.
- Gunakan helper yang sama pada atribut `min` dan pada `handleSubmit`.

## Pengujian

- Tambahkan test untuk helper batas minimum WIB.
- Tambahkan test untuk validasi tanggal lampau.
- Tambahkan test untuk memastikan tanggal pada hari ini tetap dianggap valid.
