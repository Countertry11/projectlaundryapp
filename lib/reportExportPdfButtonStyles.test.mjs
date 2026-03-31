import test from "node:test";
import assert from "node:assert/strict";
import {
  getReportExportPdfButtonLabel,
  getReportExportPdfButtonClassName,
  getReportExportPdfIconWrapperClassName,
} from "./reportExportPdfButtonStyles.mjs";

test("getReportExportPdfButtonLabel returns export label by default", () => {
  assert.equal(getReportExportPdfButtonLabel(false), "Export PDF");
});

test("getReportExportPdfButtonLabel returns loading label while exporting", () => {
  assert.equal(getReportExportPdfButtonLabel(true), "Mengekspor...");
});

test("getReportExportPdfButtonClassName includes consistent primary button states", () => {
  const className = getReportExportPdfButtonClassName();

  assert.match(className, /from-rose-600/);
  assert.match(className, /hover:-translate-y-0\.5/);
  assert.match(className, /disabled:opacity-60/);
});

test("getReportExportPdfIconWrapperClassName keeps icon badge styling consistent", () => {
  const className = getReportExportPdfIconWrapperClassName();

  assert.match(className, /bg-white\/20/);
  assert.match(className, /ring-1/);
});
