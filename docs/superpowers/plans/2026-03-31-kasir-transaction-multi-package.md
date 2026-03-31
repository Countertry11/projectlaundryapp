# Kasir Transaction Multi Package Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah form transaksi kasir agar bisa memilih banyak paket dengan quantity dan keterangan per item, serta membatasi batas waktu ke tanggal dan jam sekarang atau sesudahnya.

**Architecture:** Reuse helper item transaksi dan guard tanggal yang sudah dipakai admin, lalu ekstrak helper kecil untuk state awal form kasir agar perilaku baru bisa diuji lebih mudah. Halaman kasir transaksi akan mengganti dropdown paket menjadi katalog kartu dan daftar item editable, lalu tetap menyimpan satu header transaksi dan banyak detail transaksi.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner.

---

## Chunk 1: Kasir Transaction Form Helper and Tests

### Task 1: Tambahkan helper state awal form transaksi kasir

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirTransactionForm.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirTransactionForm.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createInitialKasirTransactionFormData } from "./kasirTransactionForm.mjs";

test("createInitialKasirTransactionFormData seeds outlet, due date, and empty items", () => {
  const formData = createInitialKasirTransactionFormData("outlet-1", new Date("2026-03-31T01:00:00.000Z"));

  assert.equal(formData.outlet_id, "outlet-1");
  assert.equal(formData.items.length, 0);
  assert.equal(formData.additional_cost, 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/kasirTransactionForm.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function createInitialKasirTransactionFormData(outletId, referenceDate) {
  return {
    outlet_id: outletId,
    customer_id: "",
    items: [],
    due_date: "...",
    additional_cost: 0,
    notes: "",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/kasirTransactionForm.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/kasirTransactionForm.mjs lib/kasirTransactionForm.test.mjs
git commit -m "test: add kasir transaction form helper"
```

## Chunk 2: Kasir Transaction Multi Package Form

### Task 2: Terapkan multi paket dan guard batas waktu pada form transaksi kasir

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/kasir/transaksi/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionItems.mjs`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminTransactionDateGuard.mjs`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirTransactionForm.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirTransactionForm.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test untuk memastikan helper form kasir membuat `due_date` default tiga hari ke depan dan item transaksi dimulai dari array kosong:

```js
test("createInitialKasirTransactionFormData defaults due date three days ahead in WIB", () => {
  const formData = createInitialKasirTransactionFormData("", new Date("2026-03-31T01:00:00.000Z"));

  assert.equal(formData.due_date, "2026-04-03T08:00");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/kasirTransactionForm.test.mjs`
Expected: FAIL until helper produces the exact kasir defaults.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper dan helper shared di halaman kasir transaksi untuk:

- mengganti `paket_id` tunggal menjadi `items`
- merender kartu paket yang bisa diklik
- merender daftar item transaksi dengan `quantity`, `notes`, subtotal, dan tombol hapus
- menghitung subtotal, pajak, dan grand total dari semua item
- menyimpan banyak baris `transaction_details` saat submit
- membatasi input `datetime-local` dengan minimum tanggal dan jam sekarang
- menolak submit jika `due_date` lebih kecil dari minimum

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/kasirTransactionForm.test.mjs`
- `npm test`
- `npm run build`

Expected:
- Tests PASS
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/kasir/transaksi/page.tsx lib/kasirTransactionForm.mjs lib/kasirTransactionForm.test.mjs
git commit -m "feat: add multi-package kasir transactions"
```
