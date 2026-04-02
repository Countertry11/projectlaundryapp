import test from "node:test";
import assert from "node:assert/strict";
import {
  getDelayDiscountPercent,
  hasDelayDiscountByDate,
} from "./transactionDelayDiscount.mjs";

test("hasDelayDiscountByDate stays true even before the previous due timestamp", () => {
  assert.equal(
    hasDelayDiscountByDate("2026-04-02T11:00:00", "2026-04-02T12:00:00"),
    true,
  );
});

test("getDelayDiscountPercent returns 5 at the exact due minute", () => {
  assert.equal(
    getDelayDiscountPercent("2026-04-02T12:00:00", "2026-04-02T12:00:00"),
    5,
  );
});

test("getDelayDiscountPercent returns 5 after the due time", () => {
  assert.equal(
    getDelayDiscountPercent("2026-04-02T12:01:00", "2026-04-02T12:00:00"),
    5,
  );
});

test("getDelayDiscountPercent returns 5 before the due time", () => {
  assert.equal(
    getDelayDiscountPercent("2026-04-02T11:59:00", "2026-04-02T12:00:00"),
    5,
  );
});
