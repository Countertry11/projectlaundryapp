# Admin Transaction Date Guard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membatasi tanggal dan jam `Batas Waktu Cuci` pada tambah transaksi admin agar tidak bisa sebelum waktu sekarang.

**Architecture:** Buat helper kecil yang menghitung waktu minimum WIB saat ini untuk kebutuhan input transaksi admin, lalu gunakan helper itu pada form `datetime-local` dan di `handleSubmit` sebagai validasi kedua di level klien. Nilai minimum disinkronkan berkala saat modal terbuka agar jam yang baru lewat ikut terkunci tanpa merombak file transaksi yang besar.

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

test("getMinimumAdminTransactionDateInput returns current WIB minute", () => {
  const result = getMinimumAdminTransactionDateInput(
    new Date("2026-03-31T17:45:00.000Z"),
  );

  assert.equal(result, "2026-04-01T00:45");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminTransactionDateGuard.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function getMinimumAdminTransactionDateInput(now = new Date()) {
  // returns current WIB time in YYYY-MM-DDTHH:mm
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

Tambahkan test yang memastikan waktu yang sama atau setelah minimum tetap valid:

```js
test("isAdminTransactionDateBeforeMinimum allows values at or after minimum", () => {
  assert.equal(
    isAdminTransactionDateBeforeMinimum("2026-04-01T00:45", "2026-04-01T00:45"),
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
- sinkronkan `minimumDueDateInput` berkala saat modal terbuka
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
