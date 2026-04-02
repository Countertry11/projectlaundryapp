import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTransactionFinancialSummary,
  getTransactionDelayDiscountUpdate,
} from "./transactionFinancialSummary.mjs";

test("buildTransactionFinancialSummary returns subtotal, discount, tax, additional cost, and grand total", () => {
  const summary = buildTransactionFinancialSummary({
    total_amount: 100000,
    discount: 5,
    tax: 10000,
    grand_total: 108000,
  });

  assert.deepEqual(summary, {
    subtotal: 100000,
    discountPercent: 5,
    discountAmount: 5000,
    subtotalAfterDiscount: 95000,
    taxAmount: 10000,
    additionalCost: 3000,
    grandTotal: 108000,
  });
});

test("getTransactionDelayDiscountUpdate recalculates grand total while preserving inferred additional cost", () => {
  const update = getTransactionDelayDiscountUpdate(
    {
      total_amount: 100000,
      discount: 0,
      tax: 10000,
      grand_total: 113000,
    },
    5,
  );

  assert.deepEqual(update, {
    discount: 5,
    grand_total: 108000,
  });
});

test("getTransactionDelayDiscountUpdate returns null when discount already matches", () => {
  const update = getTransactionDelayDiscountUpdate(
    {
      total_amount: 100000,
      discount: 5,
      tax: 10000,
      grand_total: 108000,
    },
    5,
  );

  assert.equal(update, null);
});
