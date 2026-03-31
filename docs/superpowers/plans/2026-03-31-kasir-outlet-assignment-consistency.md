# Kasir Outlet Assignment Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengunci transaksi dan laporan kasir ke outlet assignment yang sebenarnya, serta membuat tampilan admin pengguna menampilkan assignment outlet kasir yang akurat.

**Architecture:** Tambahkan helper kecil untuk meresolusi outlet assignment kasir dari `outlet_id` aktual dan daftar outlet. Helper ini dipakai lintas halaman agar transaksi kasir, laporan kasir, dan label outlet di admin pengguna mengandalkan sumber kebenaran yang sama dan tidak lagi memakai fallback visual yang menyesatkan.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner.

---

## Chunk 1: Kasir Outlet Access Helper

### Task 1: Tambahkan helper resolusi outlet kasir

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirOutletAccess.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirOutletAccess.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { resolveKasirOutletAccess } from "./kasirOutletAccess.mjs";

test("resolveKasirOutletAccess returns assigned outlet name when outlet exists", () => {
  const result = resolveKasirOutletAccess(
    [{ id: "outlet-2", name: "Laundry 2" }],
    "outlet-2",
  );

  assert.equal(result.hasAssignedOutlet, true);
  assert.equal(result.outletName, "Laundry 2");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/kasirOutletAccess.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function resolveKasirOutletAccess(outlets, outletId) {
  return {
    hasAssignedOutlet: false,
    outletId: "",
    outletName: "",
    displayLabel: "Belum ditugaskan",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/kasirOutletAccess.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/kasirOutletAccess.mjs lib/kasirOutletAccess.test.mjs
git commit -m "test: add kasir outlet access helper"
```

## Chunk 2: Kasir Transaction, Kasir Report, and Admin User Label

### Task 2: Terapkan assignment outlet kasir yang konsisten

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/kasir/transaksi/page.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/kasir/laporan/page.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/pengguna/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirOutletAccess.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/kasirOutletAccess.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test untuk outlet yang belum ditugaskan dan outlet yang tidak ditemukan:

```js
test("resolveKasirOutletAccess returns unassigned label when outlet is missing", () => {
  const result = resolveKasirOutletAccess([], "");
  assert.equal(result.displayLabel, "Belum ditugaskan");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/kasirOutletAccess.test.mjs`
Expected: FAIL until helper menangani semua state assignment.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper di tiga halaman untuk:

- mengunci transaksi kasir ke `users.outlet_id`
- menghapus fallback outlet utama pada transaksi kasir
- menampilkan outlet kasir sebagai informasi read-only
- memblokir transaksi kasir jika assignment outlet belum ada
- mempertahankan blokir laporan kasir jika assignment outlet belum ada
- menampilkan label outlet aktual di daftar pengguna admin, termasuk `Belum ditugaskan` jika kosong

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/kasirOutletAccess.test.mjs`
- `npx eslint app/kasir/transaksi/page.tsx app/kasir/laporan/page.tsx app/admin/pengguna/page.tsx lib/kasirOutletAccess.mjs lib/kasirOutletAccess.test.mjs`
- `npm test`
- `npm run build`

Expected:
- Tests PASS
- Lint PASS or only pre-existing warnings
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/kasir/transaksi/page.tsx app/kasir/laporan/page.tsx app/admin/pengguna/page.tsx lib/kasirOutletAccess.mjs lib/kasirOutletAccess.test.mjs
git commit -m "fix: align kasir outlet access with assignment"
```
