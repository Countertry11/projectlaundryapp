# Navbar Notification Visibility And Login Cleanup Design

## Summary

Perubahan ini merapikan dua area antarmuka dan satu masalah error handling:

1. Ikon notifikasi di navbar disembunyikan dari tampilan, tanpa menghapus fitur notifikasinya.
2. Ajakan daftar kasir pada halaman login dihapus.
3. Service notifikasi dibuat lebih aman supaya error kosong seperti `{}` tidak muncul sebagai `console.error` saat fetch gagal.

## Goals

- Membersihkan UI sesuai permintaan tanpa mengubah alur login utama.
- Menjaga fitur notifikasi tetap ada di kode, tetapi tidak terlihat di navbar.
- Menghindari noise di console ketika notifikasi belum siap dipakai, tabel belum tersedia, atau error Supabase tidak informatif.

## Design

### Navbar

- Blok notifikasi tetap dipertahankan secara struktural agar tidak perlu refactor besar.
- Container ikon notifikasi disembunyikan dengan kelas utilitas tampilan, sehingga tidak muncul di UI namun state dan logic lain tidak perlu dibongkar.

### Login page

- Bagian teks dan link `Belum punya akun Kasir? Daftar Sebagai Kasir` dihapus dari halaman login.
- Area form lain dibiarkan tetap sama.

### Notification error handling

- Tambahkan helper kecil untuk menentukan apakah error notifikasi perlu disenyapkan.
- Error tidak lagi dicetak sebagai `console.error` ketika bentuknya kosong atau termasuk kasus notifikasi yang recoverable.
- Service tetap mengembalikan fallback aman:
  - `[]` untuk daftar notifikasi
  - `0` untuk unread count
  - `false` untuk aksi tulis/hapus

## Testing

- Tambah test unit untuk helper error handling notifikasi.
- Verifikasi build dan lint terarah pada file yang disentuh.
