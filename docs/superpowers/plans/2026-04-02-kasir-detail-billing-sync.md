# Kasir Detail Billing Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan ringkasan tagihan lengkap pada detail transaksi kasir dan menyinkronkan diskon keterlambatan secara otomatis saat detail terbuka.

**Architecture:** Ekstrak perhitungan finansial transaksi ke helper kecil yang teruji, lalu gunakan helper itu untuk mengurangi duplikasi kalkulasi `grand_total` dan membangun breakdown tagihan di modal detail. Modal detail juga akan memiliki timer sinkronisasi ringan agar status diskon dan total tagihan ikut berubah saat `due_date` terlewati.

**Tech Stack:** Next.js, React, Node test runner, JavaScript helper modules

---

## Chunk 1: Transaction Financial Helper

### Task 1: Tambahkan helper breakdown dan sync payload

**Files:**
- Create: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionFinancialSummary.mjs`
- Create: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionFinancialSummary.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
test("buildTransactionFinancialSummary returns subtotal, discount, tax, additional cost, and grand total", () => {
  const summary = buildTransactionFinancialSummary({
    total_amount: 100000,
    discount: 5,
    tax: 10000,
    grand_total: 108000,
  });

  assert.deepEqual(summary, {
    subtotal: 100000,
    discountPercent: 5,
    discountAmount: 5000,
    subtotalAfterDiscount: 95000,
    taxAmount: 10000,
    additionalCost: 3000,
    grandTotal: 108000,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/transactionFinancialSummary.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Tambahkan helper untuk:
- inferensi biaya tambahan
- breakdown finansial transaksi
- payload update saat diskon berubah

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/transactionFinancialSummary.test.mjs`
Expected: PASS

## Chunk 2: Detail Modal Wiring

### Task 2: Sinkronkan modal detail dan tampilkan breakdown tagihan

**Files:**
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/app/kasir/transaksi/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionFinancialSummary.mjs`
- Reuse: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.mjs`

- [ ] **Step 1: Ganti kalkulasi `grand_total` duplikat ke helper finansial**

- [ ] **Step 2: Tambahkan sinkronisasi detail berkala saat modal terbuka**

- [ ] **Step 3: Tampilkan ringkasan tagihan lengkap di modal detail**

- [ ] **Step 4: Run focused verification**

Run: `node --test lib/transactionFinancialSummary.test.mjs`
Expected: PASS

- [ ] **Step 5: Run broader verification**

Run: `npm run lint -- app/kasir/transaksi/page.tsx lib/transactionFinancialSummary.mjs`
Expected: exit code 0
