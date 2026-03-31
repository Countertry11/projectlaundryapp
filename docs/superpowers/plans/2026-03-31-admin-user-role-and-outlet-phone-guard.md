# Admin User Role And Outlet Phone Guard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mencegah duplikasi nomor telepon outlet dan mengunci pembuatan/perubahan role admin di halaman pengguna admin.

**Architecture:** Tambahkan helper validasi kecil yang bisa dites untuk aturan duplikasi outlet dan guard role admin, lalu integrasikan ke form submit dan opsi UI pada halaman admin outlet serta admin pengguna. Guard tetap dijalankan dua lapis: pembatasan input di UI dan validasi akhir saat submit.

**Tech Stack:** Next.js App Router, React stateful forms, Supabase client queries, Node test runner.

---

## Chunk 1: Validation helpers

### Task 1: Outlet duplicate phone helper

**Files:**
- Modify: `lib/adminDuplicateValidation.mjs`
- Test: `lib/adminDuplicateValidation.test.mjs`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run the test to verify it fails**
- [ ] **Step 3: Add sanitized phone duplicate helper**
- [ ] **Step 4: Run the test to verify it passes**

### Task 2: Admin user role guard helper

**Files:**
- Create: `lib/adminUserRoleGuard.mjs`
- Create: `lib/adminUserRoleGuard.test.mjs`

- [ ] **Step 1: Write failing tests for add and edit role restrictions**
- [ ] **Step 2: Run the test to verify it fails**
- [ ] **Step 3: Implement minimal role guard helper**
- [ ] **Step 4: Run the test to verify it passes**

## Chunk 2: Admin form integration

### Task 3: Integrate outlet phone validation

**Files:**
- Modify: `app/admin/outlet/page.tsx`
- Reference: `lib/adminDuplicateValidation.mjs`

- [ ] **Step 1: Add outlet phone error state**
- [ ] **Step 2: Query phone values alongside outlet names before save**
- [ ] **Step 3: Block save and show inline error when phone duplicates**
- [ ] **Step 4: Reset error state when modal resets or phone changes**

### Task 4: Integrate admin role guard

**Files:**
- Modify: `app/admin/pengguna/page.tsx`
- Reference: `lib/adminUserRoleGuard.mjs`

- [ ] **Step 1: Track original role while editing**
- [ ] **Step 2: Limit dropdown options for add and edit modes**
- [ ] **Step 3: Lock role select when editing admin**
- [ ] **Step 4: Enforce role restriction inside save handler**

## Chunk 3: Verification

### Task 5: Verify the change set

**Files:**
- Verify: `app/admin/outlet/page.tsx`
- Verify: `app/admin/pengguna/page.tsx`
- Verify: `lib/adminDuplicateValidation.mjs`
- Verify: `lib/adminDuplicateValidation.test.mjs`
- Verify: `lib/adminUserRoleGuard.mjs`
- Verify: `lib/adminUserRoleGuard.test.mjs`

- [ ] **Step 1: Run targeted tests**
- [ ] **Step 2: Run targeted eslint**
- [ ] **Step 3: Run production build**
- [ ] **Step 4: Commit docs and leave code changes ready for review**
