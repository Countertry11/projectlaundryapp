import test from "node:test";
import assert from "node:assert/strict";
import {
  canAdvanceTransactionStatus,
  getNextTransactionStatus,
  isTransactionPickupBlocked,
} from "./transactionProgress.mjs";

test("getNextTransactionStatus returns the next step in kasir flow", () => {
  assert.equal(getNextTransactionStatus("pending"), "processing");
  assert.equal(getNextTransactionStatus("processing"), "ready");
  assert.equal(getNextTransactionStatus("ready"), "completed");
  assert.equal(getNextTransactionStatus("completed"), null);
  assert.equal(getNextTransactionStatus("cancelled"), null);
});

test("isTransactionPickupBlocked blocks pickup when payment is unpaid", () => {
  assert.equal(
    isTransactionPickupBlocked({
      status: "ready",
      payment_status: "unpaid",
    }),
    true,
  );

  assert.equal(
    isTransactionPickupBlocked({
      status: "ready",
      payment_status: "paid",
    }),
    false,
  );
});

test("canAdvanceTransactionStatus only enables the immediate next step", () => {
  assert.equal(
    canAdvanceTransactionStatus("pending", "processing", "unpaid"),
    true,
  );
  assert.equal(
    canAdvanceTransactionStatus("pending", "ready", "unpaid"),
    false,
  );
});

test("canAdvanceTransactionStatus blocks completed when payment is not paid", () => {
  assert.equal(
    canAdvanceTransactionStatus("ready", "completed", "unpaid"),
    false,
  );
  assert.equal(
    canAdvanceTransactionStatus("ready", "completed", "paid"),
    true,
  );
});
