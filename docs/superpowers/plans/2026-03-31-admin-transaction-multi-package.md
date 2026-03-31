# Admin Transaction Multi Package Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah form transaksi admin agar bisa memilih banyak paket dengan quantity dan keterangan per item.

**Architecture:** Ekstrak logika item transaksi ke helper kecil yang bisa diuji, lalu gunakan helper itu pada halaman admin transaksi untuk mengganti dropdown paket menjadi katalog kartu dan daftar item editable. Saat submit, transaksi tetap membuat satu header tetapi banyak detail agar perilaku baru cocok dengan struktur data yang sudah ada.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner.

---

## Chunk 1: Transaction Item Helper and Tests

### Task 1: Tambahkan helper item transaksi admin

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionItems.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionItems.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  addPackageToTransactionItems,
  calculateTransactionSummary,
} from "./adminTransactionItems.mjs";

test("addPackageToTransactionItems creates a new item when package is selected first time", () => {
  const items = addPackageToTransactionItems([], {
    id: 1,
    nama_paket: "Cuci Express",
    harga: 7000,
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].paket_id, 1);
  assert.equal(items[0].quantity, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminTransactionItems.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function addPackageToTransactionItems(items, paket) {
  // add or increment item
}

export function calculateTransactionSummary(items, additionalCost, taxPercent) {
  // subtotal + tax + grand total
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/adminTransactionItems.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/adminTransactionItems.mjs lib/adminTransactionItems.test.mjs
git commit -m "test: add admin transaction item helper"
```

## Chunk 2: Admin Transaction Multi Package Form

### Task 2: Terapkan multi paket pada form transaksi admin

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/transaksi/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionItems.mjs`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionItems.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test untuk pemilihan paket berulang dan ringkasan banyak item:

```js
test("addPackageToTransactionItems increments quantity when package is selected again", () => {
  const items = addPackageToTransactionItems(
    [{ paket_id: 1, paket_name: "Cuci Express", price: 7000, quantity: 1, notes: "" }],
    { id: 1, nama_paket: "Cuci Express", harga: 7000 },
  );

  assert.equal(items[0].quantity, 2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminTransactionItems.test.mjs`
Expected: FAIL until helper covers repeated selection and total summary cases.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper di halaman admin transaksi untuk:

- mengganti `paket_id` tunggal menjadi `items`
- merender kartu paket yang bisa diklik
- merender daftar item transaksi dengan `quantity`, `notes`, subtotal, dan tombol hapus
- menghitung subtotal, pajak, dan grand total dari semua item
- menyimpan banyak baris `transaction_details` saat submit

- [ ] **Step 4: Run verification**

Run:
- `npm test`
- `npm run build`

Expected:
- Tests PASS
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/transaksi/page.tsx lib/adminTransactionItems.mjs lib/adminTransactionItems.test.mjs
git commit -m "feat: add multi-package admin transactions"
```
