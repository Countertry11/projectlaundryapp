# Kasir Outlet Assignment Consistency Design

**Date:** 2026-03-31

**Goal:** Menyamakan perilaku outlet kasir agar transaksi, laporan, dan tampilan admin pengguna memakai assignment outlet yang sebenarnya.

## Ringkasan

Saat ini halaman transaksi kasir bisa jatuh ke `Laundry Utama` karena fallback outlet utama terpasang sebelum outlet akun kasir selesai dimuat. Sementara itu, halaman laporan kasir membaca `users.outlet_id` secara langsung dan memblokir akses jika outlet belum ditugaskan. Halaman admin pengguna juga bisa menampilkan label outlet default untuk kasir non-Bardi walaupun assignment aslinya belum ada, sehingga menyesatkan.

Perubahan ini mengunci halaman transaksi kasir ke `outlet_id` akun kasir, mempertahankan blokir laporan jika assignment belum ada, dan memperjelas tampilan admin pengguna agar outlet kasir yang terlihat benar-benar outlet yang tersimpan.

## Ruang Lingkup

- Berlaku pada halaman transaksi kasir.
- Berlaku pada halaman laporan kasir.
- Berlaku pada tampilan daftar pengguna admin untuk role kasir.
- Tidak mengubah struktur database.
- Tidak mengubah aturan default outlet saat membuat user kasir dari admin.

## Aturan Perilaku

- Kasir hanya boleh melihat dan membuat transaksi untuk outlet yang tersimpan di akun `users.outlet_id`.
- Jika kasir belum punya outlet, transaksi dan laporan sama-sama tidak boleh dipakai.
- Halaman transaksi tidak boleh fallback ke outlet utama.
- Kasir tidak boleh mengganti outlet aktif manual dari halaman transaksi.
- Daftar pengguna admin menampilkan outlet assignment aktual.
- Jika kasir belum punya outlet assignment, admin melihat label yang jelas seperti `Belum ditugaskan`.

## Pendekatan Teknis

- Tambahkan helper kecil untuk meresolusi assignment outlet kasir dari `outlet_id` aktual dan daftar outlet yang tersedia.
- Halaman transaksi kasir memakai helper itu untuk:
  - menentukan outlet aktif,
  - menghapus fallback ke outlet utama,
  - menampilkan nama outlet assignment secara read-only,
  - memblokir transaksi jika assignment tidak ada.
- Halaman laporan kasir memakai aturan assignment yang sama untuk state akses.
- Halaman admin pengguna memakai helper yang sama untuk menampilkan label outlet aktual, bukan label default heuristik.

## Pengalaman Pengguna

- Jika kasir memiliki outlet assignment, halaman transaksi menampilkan toko aktif sebagai informasi read-only.
- Jika kasir belum punya assignment, pengguna melihat pesan yang jelas untuk menghubungi admin.
- Admin dapat langsung mengenali akun kasir yang belum ditugaskan dari daftar pengguna tanpa tertipu label default.

## Pengujian

- Tambahkan test helper untuk outlet assignment valid.
- Tambahkan test helper untuk kasus outlet kasir belum ditugaskan.
- Tambahkan test helper untuk kasus `outlet_id` ada tetapi outlet tidak ditemukan di daftar.
- Jalankan lint file yang diubah, test node, dan build aplikasi.
