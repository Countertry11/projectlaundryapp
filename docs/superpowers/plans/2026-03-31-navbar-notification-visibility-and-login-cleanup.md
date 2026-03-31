# Navbar Notification Visibility And Login Cleanup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyembunyikan ikon notifikasi di navbar, menghapus link daftar kasir di halaman login, dan meredam error fetch notifikasi yang tidak informatif.

**Architecture:** Patch UI dilakukan langsung pada komponen navbar dan halaman login, lalu service notifikasi diberi helper kecil berbasis aturan agar fallback tetap aman tanpa mengeluarkan `console.error` untuk kasus recoverable.

**Tech Stack:** Next.js App Router, React client components, Supabase client service, Node test runner.

---

## Chunk 1: Notification error handling

### Task 1: Add failing tests for notification error silencing

**Files:**
- Create: `lib/notificationServiceError.mjs`
- Create: `lib/notificationServiceError.test.mjs`

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Run the tests to confirm failure**
- [ ] **Step 3: Implement the minimal helper**
- [ ] **Step 4: Re-run the tests to confirm success**

### Task 2: Integrate helper into notification service

**Files:**
- Modify: `services/notificationService.ts`
- Reference: `lib/notificationServiceError.mjs`

- [ ] **Step 1: Replace noisy console error handling with guarded fallback logic**
- [ ] **Step 2: Keep return types unchanged for all public functions**

## Chunk 2: UI cleanup

### Task 3: Hide notification icon in navbar

**Files:**
- Modify: `components/navbar.tsx`

- [ ] **Step 1: Hide notification trigger from view without deleting feature logic**
- [ ] **Step 2: Keep layout stable after hiding the block**

### Task 4: Remove kasir registration prompt from login

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove the register prompt block**
- [ ] **Step 2: Clean up any now-unused imports**

## Chunk 3: Verification

### Task 5: Verify the updated experience

**Files:**
- Verify: `components/navbar.tsx`
- Verify: `app/page.tsx`
- Verify: `services/notificationService.ts`
- Verify: `lib/notificationServiceError.mjs`
- Verify: `lib/notificationServiceError.test.mjs`

- [ ] **Step 1: Run targeted tests**
- [ ] **Step 2: Run targeted eslint**
- [ ] **Step 3: Run production build**
