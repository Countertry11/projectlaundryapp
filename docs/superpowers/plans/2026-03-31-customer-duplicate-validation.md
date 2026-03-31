# Customer Duplicate Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mencegah pelanggan ganda di halaman admin dan kasir jika nama atau nomor telepon sama.

**Architecture:** Tambahkan helper validasi pelanggan yang fokus pada normalisasi nama dan nomor telepon, lalu pakai helper itu di dua halaman pelanggan sebelum proses simpan. Halaman admin dan kasir akan melakukan query ringan ke Supabase untuk memeriksa data terbaru, lalu menolak submit jika ada bentrok dengan pelanggan lain.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner.

---

## Chunk 1: Customer Duplicate Validation Helper

### Task 1: Tambahkan helper validasi duplikat pelanggan

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/customerDuplicateValidation.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/customerDuplicateValidation.test.mjs`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { getCustomerDuplicateMessage } from "./customerDuplicateValidation.mjs";

test("getCustomerDuplicateMessage blocks duplicate customer name", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "08123" }],
    { name: " budi  santoso ", phone: "08999" },
  );

  assert.equal(message, "Nama pelanggan sudah terdaftar.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/customerDuplicateValidation.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function getCustomerDuplicateMessage(rows, values, options) {
  // return duplicate message or null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/customerDuplicateValidation.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/customerDuplicateValidation.mjs lib/customerDuplicateValidation.test.mjs
git commit -m "test: add customer duplicate validation helper"
```

## Chunk 2: Admin and Kasir Customer Forms

### Task 2: Terapkan validasi duplikat pelanggan di admin dan kasir

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/pelanggan/page.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/kasir/pelanggan/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/customerDuplicateValidation.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/customerDuplicateValidation.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test tambahan untuk nomor telepon dan pengecualian record saat edit:

```js
test("getCustomerDuplicateMessage blocks duplicate phone number", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "0812-345" }],
    { name: "Rina", phone: "0812345" },
  );

  assert.equal(message, "Nomor telepon pelanggan sudah terdaftar.");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/customerDuplicateValidation.test.mjs`
Expected: FAIL until helper covers phone normalization and edit exclusions.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper di halaman admin dan kasir untuk:

- mengambil `id`, `name`, dan `phone` terbaru dari tabel `customers`
- mengecek bentrok nama atau nomor telepon sebelum `insert` dan `update`
- mengecualikan `editingId` saat mode edit
- menghentikan submit dan menampilkan pesan jika ada bentrok

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/customerDuplicateValidation.test.mjs`
- `npm test`
- `npm run build`

Expected:
- Tests PASS
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/pelanggan/page.tsx app/kasir/pelanggan/page.tsx lib/customerDuplicateValidation.mjs lib/customerDuplicateValidation.test.mjs
git commit -m "feat: block duplicate customers"
```
