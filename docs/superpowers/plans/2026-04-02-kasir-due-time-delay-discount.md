# Kasir Due Time Delay Discount Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah diskon keterlambatan transaksi kasir agar aktif 5% saat waktu sekarang melewati `due_date`.

**Architecture:** Helper diskon telat tetap menjadi satu sumber aturan, tetapi logikanya diubah menjadi perbandingan timestamp WIB antara waktu referensi dan `due_date`. Halaman kasir akan tetap memakai helper tersebut untuk preview, penyimpanan transaksi, sinkronisasi daftar, dan update detail agar semua perhitungan diskon konsisten.

**Tech Stack:** Next.js, React, Node test runner, JavaScript helper modules

---

## Chunk 1: Helper Timestamp Rule

### Task 1: Ubah test helper ke aturan melewati due date

**Files:**
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.test.mjs`
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
test("getDelayDiscountPercent stays 0 at the exact due minute", () => {
  assert.equal(
    getDelayDiscountPercent("2026-04-02T12:00:00", "2026-04-02T12:00:00"),
    0,
  );
});

test("getDelayDiscountPercent becomes 5 right after the due minute", () => {
  assert.equal(
    getDelayDiscountPercent("2026-04-02T12:01:00", "2026-04-02T12:00:00"),
    5,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/transactionDelayDiscount.test.mjs`
Expected: FAIL because helper still uses transaction-date day difference.

- [ ] **Step 3: Write minimal implementation**

Ubah helper agar:
- mem-parse `referenceDateValue` dan `dueDateValue` sebagai waktu WIB
- mengembalikan `true` hanya jika `referenceDate > dueDate`
- mengembalikan `false` jika sama atau sebelum batas waktu

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/transactionDelayDiscount.test.mjs`
Expected: PASS

## Chunk 2: Kasir Page Wiring

### Task 2: Sambungkan helper kembali ke due date

**Files:**
- Modify: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/app/kasir/transaksi/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/agil/projectlaundryapp/lib/transactionDelayDiscount.mjs`

- [ ] **Step 1: Gunakan `trx.due_date` sebagai acuan transaksi existing**

- [ ] **Step 2: Gunakan `dueDate` draft sebagai acuan preview dan insert transaksi baru**

- [ ] **Step 3: Perbarui copy UI**

Ubah penjelasan menjadi:
- diskon keterlambatan mengikuti batas waktu
- contoh due date tanggal 2 jam 12.00, diskon aktif setelah 12.01

- [ ] **Step 4: Run focused verification**

Run: `node --test lib/transactionDelayDiscount.test.mjs`
Expected: PASS

- [ ] **Step 5: Run broader verification**

Run: `npm run lint -- app/kasir/transaksi/page.tsx lib/transactionDelayDiscount.mjs`
Expected: exit code 0
