# Role Dashboard Visual Consistency Design

## Summary

Kasir dan owner akan memakai bahasa visual dashboard yang sama dengan admin:
- latar belakang gradient yang sama
- stat card dengan hierarki, glow, dan badge yang serupa
- panel konten utama dengan chrome yang seragam

Perubahan ini hanya menyamakan tampilan dan struktur presentasi. Fitur, cakupan data, dan hak akses tetap mengikuti role masing-masing.

## Goals

- Membuat beranda kasir dan owner terasa satu keluarga dengan dashboard admin.
- Menjaga fitur kasir dan owner tetap role-specific, tanpa membawa kontrol global admin.
- Mengurangi inkonsistensi gaya card, spacing, dan panel dashboard lintas role.

## Non-Goals

- Tidak menambah menu atau aksi admin ke role kasir atau owner.
- Tidak mengubah navigasi global.
- Tidak merombak dashboard admin di luar kebutuhan berbagi pola visual.

## Current Problems

- Dashboard admin memakai stat card dan panel yang jauh lebih polished dibanding kasir dan owner.
- Dashboard kasir masih terlihat seperti varian halaman yang berbeda, bukan bagian dari sistem yang sama.
- Dashboard owner lebih sederhana dan tidak mengikuti struktur visual admin.
- Dashboard kasir juga berisiko terasa "global" karena belum secara eksplisit menegaskan outlet assignment di tampilan beranda.

## Proposed Approach

### 1. Shared dashboard presentation components

Buat komponen presentasional kecil untuk:
- stat card dashboard
- panel/dashboard section wrapper

Komponen ini mengikuti gaya admin saat ini: glassy white surface, rounded corners besar, soft shadow, gradient icon tile, dan struktur judul/subtitle yang seragam.

### 2. Kasir dashboard follows admin shell, but outlet-scoped

Beranda kasir akan memakai:
- header card ala admin
- empat stat card dengan gaya admin
- panel aktivitas terkini yang memakai pola tabel/panel admin

Namun data tetap khusus outlet kasir yang ditugaskan. Jika kasir belum punya outlet, beranda akan menampilkan state blokir yang sama seperti laporan/transaksi.

### 3. Owner dashboard follows admin shell, but keeps owner content

Beranda owner akan memakai:
- header card ala admin
- stat card dengan gaya admin
- panel ringkasan utama yang memakai chrome admin

Kontennya tetap owner-oriented: ringkasan bisnis, angka utama, dan CTA ke laporan. Tidak ada tabel transaksi operasional admin atau kontrol lintas pengguna.

## Data and Access Rules

### Kasir

- Hanya melihat transaksi/statistik outlet yang ditugaskan.
- Tidak ada outlet switcher manual.
- Jika outlet belum ditugaskan, dashboard diblokir dengan pesan yang jelas.

### Owner

- Tetap memakai agregasi global owner.
- Hanya tampilan yang disamakan, bukan scope data admin.

## Files Expected to Change

- `app/kasir/page.tsx`
- `app/owner/page.tsx`
- shared dashboard UI component files under `components/`
- optional small dashboard style/helper files under `lib/`

## Verification

- Targeted lint untuk file dashboard baru/yang berubah
- `npm test`
- `npm run build`

## Risks

- Jika gaya admin di-copy langsung tanpa shared component, konsistensi akan cepat drift lagi.
- Jika dashboard kasir tidak ikut ditegaskan outlet-specific, tampilan bisa tetap terasa seperti dashboard global.

## Recommendation

Gunakan shared presentation components ringan, lalu terapkan pada kasir dan owner. Kasir sekaligus ditegaskan outlet-specific agar selaras dengan perbaikan assignment outlet yang sudah dibuat sebelumnya.
