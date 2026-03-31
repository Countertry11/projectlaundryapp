import test from "node:test";
import assert from "node:assert/strict";
import { createInitialKasirTransactionFormData } from "./kasirTransactionForm.mjs";

test("createInitialKasirTransactionFormData seeds outlet, due date, and empty items", () => {
  const formData = createInitialKasirTransactionFormData(
    "outlet-1",
    new Date("2026-03-31T01:00:00.000Z"),
  );

  assert.equal(formData.outlet_id, "outlet-1");
  assert.equal(formData.customer_id, "");
  assert.deepEqual(formData.items, []);
  assert.equal(formData.additional_cost, 0);
  assert.equal(formData.notes, "");
});

test("createInitialKasirTransactionFormData defaults due date three days ahead in WIB", () => {
  const formData = createInitialKasirTransactionFormData(
    "",
    new Date("2026-03-31T01:00:00.000Z"),
  );

  assert.equal(formData.due_date, "2026-04-03T08:00");
});
