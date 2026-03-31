# Role Dashboard Visual Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyamakan tampilan beranda kasir dan owner ke pola dashboard admin tanpa membawa fitur global admin ke role lain.

**Architecture:** Tambahkan komponen presentasional dashboard yang reusable untuk stat card dan panel shell, lalu terapkan ke beranda kasir dan owner. Beranda kasir juga dipertegas hanya memakai outlet assignment akun kasir agar konsisten secara visual dan perilaku.

**Tech Stack:** Next.js App Router, React client components, Tailwind utility classes, Supabase, Node test runner

---

## Chunk 1: Shared Dashboard UI

### Task 1: Tambahkan komponen stat card dashboard reusable

**Files:**
- Create: `components/dashboard/DashboardStatCard.tsx`
- Optional Test Helper: `lib/dashboardChrome.mjs`
- Optional Test: `lib/dashboardChrome.test.mjs`

- [ ] **Step 1: Tulis helper/style contract kecil bila diperlukan**
- [ ] **Step 2: Jika helper dibuat, tulis test yang gagal lebih dulu**
- [ ] **Step 3: Implement komponen `DashboardStatCard` dengan pola visual admin**
- [ ] **Step 4: Pastikan mendukung angka biasa dan currency**
- [ ] **Step 5: Commit**

### Task 2: Tambahkan wrapper panel dashboard reusable

**Files:**
- Create: `components/dashboard/DashboardPanel.tsx`

- [ ] **Step 1: Implement wrapper panel dengan header icon, title, description, dan action slot**
- [ ] **Step 2: Pastikan shell visual selaras dengan panel admin**
- [ ] **Step 3: Commit**

## Chunk 2: Kasir Dashboard

### Task 3: Rapikan data dan akses dashboard kasir

**Files:**
- Modify: `app/kasir/page.tsx`
- Reuse: `lib/kasirOutletAccess.mjs`

- [ ] **Step 1: Ambil outlet assignment kasir lebih dulu**
- [ ] **Step 2: Blokir dashboard jika kasir belum ditugaskan ke outlet**
- [ ] **Step 3: Filter transaksi dan statistik kasir hanya untuk outlet yang ditugaskan**
- [ ] **Step 4: Commit**

### Task 4: Terapkan shell visual admin ke dashboard kasir

**Files:**
- Modify: `app/kasir/page.tsx`
- Use: `components/dashboard/DashboardStatCard.tsx`
- Use: `components/dashboard/DashboardPanel.tsx`

- [ ] **Step 1: Ganti header kasir ke pola card admin**
- [ ] **Step 2: Ganti stat card ke komponen shared**
- [ ] **Step 3: Rapikan panel aktivitas terkini agar mengikuti pola admin**
- [ ] **Step 4: Tambahkan pencarian ringan jika tetap relevan**
- [ ] **Step 5: Commit**

## Chunk 3: Owner Dashboard

### Task 5: Terapkan shell visual admin ke dashboard owner

**Files:**
- Modify: `app/owner/page.tsx`
- Use: `components/dashboard/DashboardStatCard.tsx`
- Use: `components/dashboard/DashboardPanel.tsx`

- [ ] **Step 1: Ganti header owner ke pola card admin**
- [ ] **Step 2: Ganti stat card ke komponen shared**
- [ ] **Step 3: Bungkus ringkasan owner dengan panel shell yang konsisten**
- [ ] **Step 4: Pastikan CTA laporan tetap owner-specific**
- [ ] **Step 5: Commit**

## Chunk 4: Verification

### Task 6: Verifikasi akhir

**Files:**
- Verify: `app/kasir/page.tsx`
- Verify: `app/owner/page.tsx`
- Verify: `components/dashboard/DashboardStatCard.tsx`
- Verify: `components/dashboard/DashboardPanel.tsx`
- Verify: helper/test files if created

- [ ] **Step 1: Jalankan targeted lint**

Run: `npx eslint app/kasir/page.tsx app/owner/page.tsx components/dashboard/DashboardStatCard.tsx components/dashboard/DashboardPanel.tsx`

- [ ] **Step 2: Jalankan unit test**

Run: `npm test`

- [ ] **Step 3: Jalankan build**

Run: `npm run build`

- [ ] **Step 4: Commit**

Plan complete and saved to `docs/superpowers/plans/2026-03-31-role-dashboard-visual-consistency.md`. Ready to execute?
