# Customer Duplicate Validation Design

**Date:** 2026-03-31

**Goal:** Mencegah input pelanggan ganda di role admin dan kasir jika nama sama atau nomor telepon sama.

## Ringkasan

Form pelanggan pada halaman admin dan kasir saat ini masih bisa menyimpan data ganda. Perubahan ini menambahkan validasi sebelum simpan agar data pelanggan ditolak jika nama sudah dipakai pelanggan lain atau nomor telepon sudah dipakai pelanggan lain, walaupun field lainnya berbeda.

## Ruang Lingkup

- Berlaku pada form tambah dan edit pelanggan di halaman admin.
- Berlaku pada form tambah dan edit pelanggan di halaman kasir.
- Validasi dilakukan sebelum `insert` dan `update`.
- Aturan duplikat memakai nama atau nomor telepon.

## Aturan Validasi

- Pelanggan dianggap duplikat jika `name` sama dengan pelanggan lain.
- Pelanggan dianggap duplikat jika `phone` sama dengan pelanggan lain.
- Jika salah satu aturan bentrok, proses simpan dibatalkan.
- Saat edit, record yang sedang diedit dikecualikan dari pengecekan.
- Nama dibandingkan dengan normalisasi trim, collapse spasi, dan lowercase.
- Nomor telepon dibandingkan setelah hanya menyisakan digit.

## Pendekatan Teknis

- Tambahkan helper khusus validasi pelanggan agar admin dan kasir memakai aturan yang sama.
- Helper mengevaluasi daftar pelanggan yang diambil dari Supabase sebelum simpan.
- Halaman admin dan kasir memanggil query ringan ke tabel `customers` untuk mendapatkan `id`, `name`, dan `phone`.
- Jika helper menemukan bentrok, form menampilkan pesan error yang jelas dan submit dihentikan.

## Perilaku Pengguna

- Nama yang sama dengan penulisan berbeda kapital atau spasi tetap dianggap duplikat.
- Nomor telepon yang sama tetap dianggap duplikat walaupun format input berbeda, misalnya memakai spasi atau tanda hubung.
- Pesan error membedakan bentrok nama dan bentrok nomor telepon agar pengguna tahu apa yang harus diubah.

## Pengujian

- Tambahkan test helper untuk mendeteksi nama pelanggan duplikat.
- Tambahkan test helper untuk mendeteksi nomor telepon duplikat setelah normalisasi.
- Tambahkan test helper untuk memastikan record yang sedang diedit tidak dianggap duplikat dengan dirinya sendiri.
