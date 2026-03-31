# Report Export PDF Button Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyamakan tampilan tombol export PDF di halaman laporan admin, kasir, dan owner dengan satu komponen bersama yang lebih rapi dan konsisten.

**Architecture:** Ekstrak state label dan base style tombol ke helper kecil yang bisa diuji, lalu bungkus ke dalam komponen `ReportExportPdfButton` agar tiga halaman laporan tidak menduplikasi tampilan dan perilaku yang sama. Halaman laporan hanya mempertahankan logika export masing-masing, sementara UI tombol dipusatkan.

**Tech Stack:** Next.js App Router, React, TypeScript/TSX, Tailwind CSS, Node test runner.

---

## Chunk 1: Export Button Helper and Tests

### Task 1: Tambahkan helper state tombol export PDF

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/reportExportPdfButtonStyles.mjs`
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/reportExportPdfButtonStyles.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  getReportExportPdfButtonLabel,
  getReportExportPdfButtonClassName,
} from "./reportExportPdfButtonStyles.mjs";

test("getReportExportPdfButtonLabel returns export label by default", () => {
  assert.equal(getReportExportPdfButtonLabel(false), "Export PDF");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/reportExportPdfButtonStyles.test.mjs`
Expected: FAIL because helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function getReportExportPdfButtonLabel(exporting) {
  return exporting ? "Mengekspor..." : "Export PDF";
}

export function getReportExportPdfButtonClassName() {
  return "...";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/reportExportPdfButtonStyles.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/reportExportPdfButtonStyles.mjs lib/reportExportPdfButtonStyles.test.mjs
git commit -m "test: add report export button helper"
```

## Chunk 2: Shared Button Component and Report Pages

### Task 2: Terapkan komponen tombol export PDF bersama di semua role

**Files:**
- Create: `d:/Tugas MPKK/UKK/projectlaundryapp/components/ReportExportPdfButton.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/admin/laporan/page.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/kasir/laporan/page.tsx`
- Modify: `d:/Tugas MPKK/UKK/projectlaundryapp/app/owner/laporan/page.tsx`
- Reuse: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/reportExportPdfButtonStyles.mjs`
- Test: `d:/Tugas MPKK/UKK/projectlaundryapp/lib/reportExportPdfButtonStyles.test.mjs`

- [ ] **Step 1: Write the failing test**

Tambahkan test untuk label loading dan class tombol:

```js
test("getReportExportPdfButtonLabel returns loading label while exporting", () => {
  assert.equal(getReportExportPdfButtonLabel(true), "Mengekspor...");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/reportExportPdfButtonStyles.test.mjs`
Expected: FAIL until helper covers loading label and visual class string.

- [ ] **Step 3: Write minimal implementation**

Gunakan helper dan komponen shared untuk:

- membuat satu tampilan tombol export PDF yang konsisten
- menampilkan ikon PDF saat idle
- menampilkan spinner saat exporting
- mempertahankan state disabled dan label yang sesuai
- mengganti tombol export lama di halaman admin, kasir, dan owner

- [ ] **Step 4: Run verification**

Run:
- `node --test lib/reportExportPdfButtonStyles.test.mjs`
- `npx eslint app/admin/laporan/page.tsx app/kasir/laporan/page.tsx app/owner/laporan/page.tsx components/ReportExportPdfButton.tsx lib/reportExportPdfButtonStyles.mjs lib/reportExportPdfButtonStyles.test.mjs`
- `npm test`
- `npm run build`

Expected:
- Tests PASS
- Lint PASS for touched files
- Build PASS

- [ ] **Step 5: Commit**

```bash
git add app/admin/laporan/page.tsx app/kasir/laporan/page.tsx app/owner/laporan/page.tsx components/ReportExportPdfButton.tsx lib/reportExportPdfButtonStyles.mjs lib/reportExportPdfButtonStyles.test.mjs
git commit -m "feat: unify report export pdf buttons"
```
