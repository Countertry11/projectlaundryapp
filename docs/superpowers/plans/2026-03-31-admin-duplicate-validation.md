# Admin Duplicate Validation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mencegah admin menambahkan atau memperbarui toko dan paket cucian dengan nama yang sama setelah dinormalisasi.

**Architecture:** Ekstrak logika normalisasi dan pendeteksian duplikasi ke helper terpisah yang ringan dan mudah diuji, lalu gunakan helper itu dari halaman admin toko dan admin paket sebelum operasi simpan ke Supabase. UI mempertahankan pola modal yang ada, tetapi menambahkan state error per-field agar validasi terasa langsung dan jelas.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Supabase client, Node test runner untuk helper validation.

---

## Chunk 1: Validation Helper and Tests

### Task 1: Tambahkan helper validasi yang bisa diuji

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.js`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.test.mjs`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/package.json`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDuplicateValue,
  hasDuplicateByNormalizedField,
} from "./adminDuplicateValidation.js";

test("normalizeDuplicateValue trims, lowercases, and collapses spaces", () => {
  assert.equal(normalizeDuplicateValue("  Cabang   Utama "), "cabang utama");
});

test("hasDuplicateByNormalizedField detects duplicates ignoring case and spacing", () => {
  const rows = [{ id: "1", name: "Cabang Utama" }];
  assert.equal(hasDuplicateByNormalizedField(rows, "name", " cabang  utama "), true);
});

test("hasDuplicateByNormalizedField ignores the current record on edit", () => {
  const rows = [{ id: "1", name: "Cabang Utama" }];
  assert.equal(
    hasDuplicateByNormalizedField(rows, "name", "Cabang Utama", { excludeId: "1" }),
    false,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminDuplicateValidation.test.mjs`
Expected: FAIL because helper module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function normalizeDuplicateValue(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function hasDuplicateByNormalizedField(rows, field, value, options = {}) {
  const normalizedValue = normalizeDuplicateValue(value);

  return rows.some((row) => {
    const rowId = row?.id != null ? String(row.id) : null;
    if (options.excludeId != null && rowId === String(options.excludeId)) {
      return false;
    }

    return normalizeDuplicateValue(row?.[field]) === normalizedValue;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/adminDuplicateValidation.test.mjs`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add package.json lib/adminDuplicateValidation.js lib/adminDuplicateValidation.test.mjs
git commit -m "test: add duplicate validation helper"
```

## Chunk 2: Admin Outlet Duplicate Validation

### Task 2: Tambahkan validasi duplikat pada halaman admin toko

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/outlet/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.js`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.test.mjs`

- [ ] **Step 1: Write the failing test**

Gunakan test helper yang sudah ada untuk merepresentasikan aturan duplikasi nama toko:

```js
test("hasDuplicateByNormalizedField detects duplicate outlet names", () => {
  const rows = [{ id: "1", name: "Cabang Utama" }];
  assert.equal(hasDuplicateByNormalizedField(rows, "name", "CABANG utama"), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminDuplicateValidation.test.mjs`
Expected: FAIL until the new test is added and helper belum mendukung kasus yang dibutuhkan.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [nameError, setNameError] = useState("");

async function validateOutletName(name: string) {
  const { data, error } = await supabase
    .from("outlets")
    .select("id, name")
    .eq("is_active", true);

  if (error) throw error;

  return hasDuplicateByNormalizedField(data || [], "name", name, {
    excludeId: editingId,
  });
}
```

Lalu panggil validasi itu di `handleSubmit`, tampilkan error di bawah input nama toko, dan hentikan submit bila duplikat.

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/adminDuplicateValidation.test.mjs`
- `npm run lint`

Expected:
- Tests PASS
- Lint PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/outlet/page.tsx lib/adminDuplicateValidation.js lib/adminDuplicateValidation.test.mjs
git commit -m "feat: block duplicate admin outlets"
```

## Chunk 3: Admin Paket Duplicate Validation

### Task 3: Tambahkan validasi duplikat pada halaman admin paket

**Files:**
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/paket/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.js`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/adminDuplicateValidation.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test aturan nama paket:

```js
test("hasDuplicateByNormalizedField detects duplicate package names", () => {
  const rows = [{ id: 2, nama_paket: "Cuci Express" }];
  assert.equal(
    hasDuplicateByNormalizedField(rows, "nama_paket", " cuci   express "),
    true,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/adminDuplicateValidation.test.mjs`
Expected: FAIL until the new test is added and helper belum mendukung data paket secara lengkap.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [packageNameError, setPackageNameError] = useState("");

async function validatePackageName(namaPaket: string) {
  const { data, error } = await supabase
    .from("tb_paket")
    .select("id, nama_paket");

  if (error) throw error;

  return hasDuplicateByNormalizedField(data || [], "nama_paket", namaPaket, {
    excludeId: editingId,
  });
}
```

Lalu hentikan submit saat nama paket duplikat dan tampilkan pesan error di bawah input `Nama Paket`.

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/adminDuplicateValidation.test.mjs`
- `npm run lint`

Expected:
- Tests PASS
- Lint PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/paket/page.tsx lib/adminDuplicateValidation.js lib/adminDuplicateValidation.test.mjs
git commit -m "feat: block duplicate admin packages"
```
