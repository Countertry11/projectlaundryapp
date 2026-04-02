import test from "node:test";
import assert from "node:assert/strict";
import {
  filterRowsByReportDate,
  getReportDateFilterYearOptions,
  getReportDateParts,
} from "./reportDateFilters.mjs";

test("getReportDateParts extracts day month and year from transaction date", () => {
  assert.deepEqual(getReportDateParts("2026-04-02T10:15:00"), {
    day: "2",
    month: "4",
    year: "2026",
    isoDate: "2026-04-02",
  });
});

test("filterRowsByReportDate returns all rows when filters are all", () => {
  const rows = [
    { id: "1", transaction_date: "2026-04-02T10:15:00" },
    { id: "2", transaction_date: "2025-05-03T08:00:00" },
  ];

  const filtered = filterRowsByReportDate(rows, {
    day: "all",
    month: "all",
    year: "all",
  });

  assert.equal(filtered.length, 2);
});

test("filterRowsByReportDate filters by month and year", () => {
  const rows = [
    { id: "1", transaction_date: "2026-04-02T10:15:00" },
    { id: "2", transaction_date: "2026-04-03T08:00:00" },
    { id: "3", transaction_date: "2026-05-03T08:00:00" },
  ];

  const filtered = filterRowsByReportDate(rows, {
    day: "all",
    month: "4",
    year: "2026",
  });

  assert.deepEqual(
    filtered.map((row) => row.id),
    ["1", "2"],
  );
});

test("filterRowsByReportDate filters by full day month year combination", () => {
  const rows = [
    { id: "1", transaction_date: "2026-04-02T10:15:00" },
    { id: "2", transaction_date: "2026-04-03T08:00:00" },
    { id: "3", transaction_date: "2025-04-02T08:00:00" },
  ];

  const filtered = filterRowsByReportDate(rows, {
    day: "2",
    month: "4",
    year: "2026",
  });

  assert.deepEqual(
    filtered.map((row) => row.id),
    ["1"],
  );
});

test("getReportDateFilterYearOptions returns sorted unique years", () => {
  const rows = [
    { transaction_date: "2026-04-02T10:15:00" },
    { transaction_date: "2025-04-03T08:00:00" },
    { transaction_date: "2026-05-03T08:00:00" },
  ];

  assert.deepEqual(getReportDateFilterYearOptions(rows), ["2026", "2025"]);
});
