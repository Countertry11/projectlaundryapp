# Kasir Always On Discount Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat diskon kasir langsung aktif 5% dan tampil konsisten di seluruh UI.

**Architecture:** Pertahankan helper diskon sebagai sumber aturan tunggal, tetapi ubah perilakunya menjadi selalu aktif. Halaman transaksi kasir tetap memakai helper yang sama untuk preview, sinkronisasi transaksi lama, detail transaksi, dan perhitungan total agar semua titik otomatis konsisten.

**Tech Stack:** Next.js, React, Node test runner, JavaScript helper modules

---

## Chunk 1: Discount Helper

### Task 1: Ubah helper ke diskon selalu aktif

**Files:**
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.test.mjs`
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.mjs`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**

## Chunk 2: Kasir UI

### Task 2: Sesuaikan copy UI dan verifikasi halaman kasir

**Files:**
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/app/kasir/transaksi/page.tsx`

- [ ] **Step 1: Perbarui teks UI agar menjelaskan diskon otomatis 5%**
- [ ] **Step 2: Run focused verification**
- [ ] **Step 3: Run broader verification**
