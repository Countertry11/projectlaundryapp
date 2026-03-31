import test from "node:test";
import assert from "node:assert/strict";
import {
  isDateOnlyTransactionDueDate,
  normalizeTransactionDueDateValue,
} from "./transactionDueDate.mjs";

test("isDateOnlyTransactionDueDate detects legacy date-only due dates", () => {
  assert.equal(isDateOnlyTransactionDueDate("2026-04-01"), true);
  assert.equal(isDateOnlyTransactionDueDate("2026-04-01T15:30:00"), false);
});

test("normalizeTransactionDueDateValue reuses transaction time for legacy date-only due dates", () => {
  assert.equal(
    normalizeTransactionDueDateValue(
      "2026-04-04",
      "2026-04-01T15:30:45",
    ),
    "2026-04-04T15:30:45",
  );
});

test("normalizeTransactionDueDateValue falls back to midnight when transaction time is unavailable", () => {
  assert.equal(
    normalizeTransactionDueDateValue("2026-04-04", null),
    "2026-04-04T00:00:00",
  );
});

test("normalizeTransactionDueDateValue keeps full due dates unchanged", () => {
  assert.equal(
    normalizeTransactionDueDateValue(
      "2026-04-04T19:15:00",
      "2026-04-01T09:10:00",
    ),
    "2026-04-04T19:15:00",
  );
});
