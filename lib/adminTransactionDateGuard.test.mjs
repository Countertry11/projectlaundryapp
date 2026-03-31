import test from "node:test";
import assert from "node:assert/strict";
import {
  getMinimumAdminTransactionDateInput,
  isAdminTransactionDateBeforeMinimum,
} from "./adminTransactionDateGuard.mjs";

test("getMinimumAdminTransactionDateInput returns current WIB minute", () => {
  const result = getMinimumAdminTransactionDateInput(
    new Date("2026-03-31T17:45:00.000Z"),
  );

  assert.equal(result, "2026-04-01T00:45");
});

test("isAdminTransactionDateBeforeMinimum blocks times before current minimum", () => {
  assert.equal(
    isAdminTransactionDateBeforeMinimum("2026-04-01T00:44", "2026-04-01T00:45"),
    true,
  );
});

test("isAdminTransactionDateBeforeMinimum allows values at or after minimum", () => {
  assert.equal(
    isAdminTransactionDateBeforeMinimum("2026-04-01T00:45", "2026-04-01T00:45"),
    false,
  );
});
