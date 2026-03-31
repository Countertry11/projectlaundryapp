# Admin Transaction Date Guard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membatasi tanggal `Batas Waktu Cuci` pada tambah transaksi admin agar tidak bisa sebelum hari ini.

**Architecture:** Buat helper kecil yang menghitung awal hari WIB untuk kebutuhan input transaksi admin, lalu gunakan helper itu pada form `datetime-local` dan di `handleSubmit` sebagai validasi server-side-like di level klien. Pendekatan ini menjaga aturan tanggal terpusat dan mudah diuji tanpa merombak file transaksi yang besar.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, utilitas waktu WIB, Node test runner.

---

## Chunk 1: Date Guard Helper and Tests

### Task 1: Tambahkan helper guard tanggal transaksi admin

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  getMinimumAdminTransactionDateInput,
  isAdminTransactionDateBeforeMinimum,
} from "./adminTransactionDateGuard.mjs";

test("getMinimumAdminTransactionDateInput returns start of current WIB day", () => {
  const result = getMinimumAdminTransactionDateInput(
    new Date("2026-03-31T17:45:00.000Z"),
  );

  assert.equal(result, "2026-04-01T00:00");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminTransactionDateGuard.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function getMinimumAdminTransactionDateInput(now = new Date()) {
  // returns WIB start-of-day in YYYY-MM-DDTHH:mm
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/adminTransactionDateGuard.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/adminTransactionDateGuard.mjs lib/adminTransactionDateGuard.test.mjs
git commit -m "test: add admin transaction date guard helper"
```

## Chunk 2: Admin Transaction Form Guard

### Task 2: Terapkan guard pada form tambah transaksi admin

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/transaksi/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test yang memastikan tanggal hari ini tetap valid:

```js
test("isAdminTransactionDateBeforeMinimum allows values on the same day", () => {
  assert.equal(
    isAdminTransactionDateBeforeMinimum("2026-04-01T08:30", "2026-04-01T00:00"),
    false,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminTransactionDateGuard.test.mjs`
Expected: FAIL until helper covers the comparison rule.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper di halaman admin transaksi untuk:

```tsx
const minimumDueDateInput = getMinimumAdminTransactionDateInput(new Date());
```

Lalu:
- tambahkan `min={minimumDueDateInput}` pada input `datetime-local`
- blokir submit jika `formData.due_date` lebih kecil dari `minimumDueDateInput`
- tampilkan pesan alert yang jelas saat validasi gagal

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/adminTransactionDateGuard.test.mjs`
- `npm run build`

Expected:
- Tests PASS
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/transaksi/page.tsx lib/adminTransactionDateGuard.mjs lib/adminTransactionDateGuard.test.mjs
git commit -m "feat: block past admin transaction dates"
```
