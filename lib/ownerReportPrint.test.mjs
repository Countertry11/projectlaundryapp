import test from "node:test";
import assert from "node:assert/strict";
import { buildOwnerReportPrintHtml } from "./ownerReportPrint.mjs";

test("buildOwnerReportPrintHtml includes report title subtitle and content", () => {
  const html = buildOwnerReportPrintHtml({
    title: "Laporan Toko",
    subtitle: "Total Pendapatan: Rp 10.000",
    printedAt: "2 April 2026",
    contentHtml: "<table><tr><td>Outlet Utama</td></tr></table>",
  });

  assert.match(html, /Laporan Toko/);
  assert.match(html, /Total Pendapatan: Rp 10\.000/);
  assert.match(html, /2 April 2026/);
  assert.match(html, /Outlet Utama/);
});

test("buildOwnerReportPrintHtml creates a standalone print document", () => {
  const html = buildOwnerReportPrintHtml({
    title: "Laporan Toko",
    subtitle: "",
    printedAt: "2 April 2026",
    contentHtml: "<div>isi laporan</div>",
  });

  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /window\.print\(\)/);
  assert.match(html, /<body>/);
});
