import test from "node:test";
import assert from "node:assert/strict";
import {
  formatCurrentReportDate,
  formatReportDate,
} from "./reportDateFormat.mjs";

test("formatReportDate formats ISO date to Indonesian day month year", () => {
  assert.equal(formatReportDate("2026-04-02"), "2 April 2026");
});

test("formatReportDate returns fallback for invalid values", () => {
  assert.equal(formatReportDate("bukan-tanggal"), "-");
  assert.equal(formatReportDate(""), "-");
});

test("formatCurrentReportDate formats current date in Indonesian order", () => {
  assert.equal(
    formatCurrentReportDate(new Date("2026-04-02T10:15:00+07:00")),
    "2 April 2026",
  );
});
