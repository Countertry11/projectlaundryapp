# Admin User Delete Guard Design

**Date:** 2026-03-31

**Goal:** Mencegah admin menghapus akun ber-role `admin`, termasuk akun admin yang sedang login, dari menu pengguna.

## Ringkasan

Halaman admin pengguna saat ini selalu menampilkan aksi hapus dan langsung menghapus record dari tabel `users`. Perubahan ini menambahkan guard dua lapis: UI tidak menawarkan hapus untuk akun admin, dan handler hapus tetap menolak target yang tidak boleh dihapus.

## Ruang Lingkup

- Berlaku pada halaman admin pengguna.
- Melarang penghapusan semua user dengan role `admin`.
- Secara eksplisit juga melarang penghapusan akun admin yang sedang login.
- Tidak mengubah alur edit, tambah, atau role lain.

## Aturan Validasi

- Jika target user memiliki role `admin`, aksi hapus diblokir.
- Jika target user adalah user yang sedang login dan rolenya `admin`, aksi hapus diblokir.
- Tombol hapus tidak ditampilkan untuk akun admin agar UX lebih jelas.
- Handler hapus tetap melakukan pengecekan agar tidak hanya bergantung pada UI.

## Perilaku UI

- Untuk baris user ber-role `admin`, hanya tombol edit yang tampil.
- Jika guard di handler tetap terpanggil pada target terlarang, tampilkan alert dengan pesan yang jelas.
- Modal konfirmasi hapus hanya dapat dibuka untuk target yang boleh dihapus.

## Pendekatan Teknis

- Gunakan `useAuth()` untuk mengetahui user yang sedang login.
- Tambahkan helper lokal kecil untuk menentukan apakah user boleh dihapus.
- Gunakan helper yang sama pada render tombol hapus, pembukaan modal konfirmasi, dan `handleDelete`.

## Pengujian

- Tambahkan test ringan untuk helper guard penghapusan.
- Verifikasi helper membatasi admin lain.
- Verifikasi helper membatasi akun admin yang sedang login.
- Verifikasi helper tetap mengizinkan hapus user non-admin.
