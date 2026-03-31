# Admin User Role And Outlet Phone Guard Design

## Summary

Halaman admin `toko` dan `pengguna` perlu dua jenis pengaman tambahan:

1. Nomor telepon outlet tidak boleh sama dengan outlet lain, meskipun format penulisannya berbeda.
2. Role `admin` harus diperlakukan sebagai role tetap:
   - akun admin yang sedang diedit tidak boleh diganti ke role lain,
   - akun non-admin tidak boleh dinaikkan menjadi admin,
   - form tambah pengguna tidak boleh menyediakan opsi membuat admin baru.

## Goals

- Mencegah duplikasi nomor telepon antar outlet aktif.
- Menjaga hanya akun admin yang sudah ada yang bisa tetap ber-role admin.
- Menyamakan guard UI dan guard submit agar perubahan tidak bisa lolos lewat manipulasi input.

## Design

### Outlet phone duplicate guard

- Nomor telepon outlet akan dibandingkan setelah disanitasi menjadi digit saja.
- Validasi dijalankan sebelum `insert` dan `update` pada halaman admin outlet.
- Record yang sedang diedit dikecualikan dari pengecekan agar tidak bentrok dengan dirinya sendiri.
- Error ditampilkan inline pada field telepon, berdampingan dengan error nama outlet yang sudah ada.

### Admin role guard

- Form tambah pengguna hanya menampilkan opsi `kasir` dan `owner`.
- Saat edit akun dengan role `admin`, dropdown role tetap tampil tetapi dikunci pada nilai `admin`.
- Saat edit akun non-admin, opsi `admin` tidak tersedia.
- `handleSave` tetap memvalidasi role final untuk mencegah bypass dari devtools atau request manual.

## Boundaries

- Tidak mengubah skema database.
- Tidak membuat alur baru untuk registrasi admin.
- Tidak mengubah permission role di halaman lain.

## Testing

- Tambah test unit untuk validasi duplikasi telepon outlet.
- Tambah test unit untuk aturan role pengguna admin pada mode tambah dan edit.
- Verifikasi integrasi dengan lint, test suite, dan production build.
