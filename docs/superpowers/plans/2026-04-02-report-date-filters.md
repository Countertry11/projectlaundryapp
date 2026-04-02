# Report Date Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan filter laporan berdasarkan tanggal, bulan, dan tahun di semua role sambil mempertahankan struktur laporan masing-masing role.

**Architecture:** Gunakan helper filter tanggal bersama untuk mengekstrak bagian tanggal dari `transaction_date`, menentukan opsi tahun, dan memfilter transaksi sebelum agregasi laporan. UI filter dibuat reusable agar admin, kasir, dan owner memakai kontrol yang sama.

**Tech Stack:** Next.js App Router, React client components, Supabase client, Node test runner.

---

### Task 1: Bangun helper filter tanggal laporan

**Files:**
- Create: `lib/reportDateFilters.mjs`
- Create: `lib/reportDateFilters.test.mjs`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal implementation**
- [ ] **Step 4: Run test to verify it passes**

### Task 2: Buat komponen filter tanggal laporan bersama

**Files:**
- Create: `components/ReportDateFilters.tsx`

- [ ] **Step 1: Implement reusable UI for tanggal, bulan, tahun**
- [ ] **Step 2: Keep component controlled and role-agnostic**

### Task 3: Integrasikan filter ke laporan admin dan kasir

**Files:**
- Modify: `app/admin/laporan/page.tsx`
- Modify: `app/kasir/laporan/page.tsx`

- [ ] **Step 1: Fetch raw transactions as before**
- [ ] **Step 2: Build available year options from raw transactions**
- [ ] **Step 3: Filter raw transactions by tanggal, bulan, tahun before grouping**
- [ ] **Step 4: Reuse filtered aggregates for table, stats, and PDF export**

### Task 4: Integrasikan filter ke laporan owner

**Files:**
- Modify: `app/owner/laporan/page.tsx`

- [ ] **Step 1: Include `transaction_date` in owner transaction query**
- [ ] **Step 2: Apply the same tanggal, bulan, tahun filter before outlet aggregation**
- [ ] **Step 3: Reuse filtered owner aggregates for table, stats, and PDF export**

### Task 5: Verifikasi perubahan

**Files:**
- Verify only

- [ ] **Step 1: Run targeted tests**
- [ ] **Step 2: Run lint on affected files**
- [ ] **Step 3: Run production build**
