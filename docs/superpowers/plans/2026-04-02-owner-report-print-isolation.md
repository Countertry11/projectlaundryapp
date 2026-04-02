# Owner Report Print Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat cetak laporan owner hanya menampilkan data laporan tanpa navbar dan sidebar.

**Architecture:** Tambahkan marker print khusus di halaman laporan owner, lalu gunakan class print di layout owner dan CSS global untuk menyembunyikan shell navigasi saat print aktif. Kontrol aksi di halaman laporan ikut disembunyikan saat print.

**Tech Stack:** Next.js App Router, React client components, global CSS print media.

---

### Task 1: Tandai shell owner untuk print khusus

**Files:**
- Modify: `app/owner/layout.tsx`
- Modify: `app/globals.css`

- [ ] Tambah wrapper sidebar/navbar yang bisa disembunyikan saat halaman mengaktifkan mode print owner
- [ ] Tambah aturan CSS print untuk hanya menyisakan area laporan owner saat cetak

### Task 2: Tandai area laporan owner sebagai printable region

**Files:**
- Modify: `app/owner/laporan/page.tsx`

- [ ] Tambah class/marker untuk area laporan utama
- [ ] Sembunyikan tombol aksi dan kontrol filter saat print

### Task 3: Verifikasi

**Files:**
- Verify only

- [ ] Run lint on affected files
- [ ] Run build
