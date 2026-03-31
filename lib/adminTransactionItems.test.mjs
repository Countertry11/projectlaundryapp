import test from "node:test";
import assert from "node:assert/strict";
import {
  addPackageToTransactionItems,
  calculateTransactionSummary,
  removeTransactionItem,
  updateTransactionItem,
} from "./adminTransactionItems.mjs";

test("addPackageToTransactionItems creates a new item when package is selected first time", () => {
  const items = addPackageToTransactionItems([], {
    id: 1,
    nama_paket: "Cuci Express",
    harga: 7000,
  });

  assert.equal(items.length, 1);
  assert.equal(items[0].paket_id, 1);
  assert.equal(items[0].paket_name, "Cuci Express");
  assert.equal(items[0].quantity, 1);
  assert.equal(items[0].price, 7000);
  assert.equal(items[0].notes, "");
});

test("addPackageToTransactionItems increments quantity when package is selected again", () => {
  const items = addPackageToTransactionItems(
    [
      {
        paket_id: 1,
        paket_name: "Cuci Express",
        price: 7000,
        quantity: 1,
        notes: "",
      },
    ],
    {
      id: 1,
      nama_paket: "Cuci Express",
      harga: 7000,
    },
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 2);
});

test("calculateTransactionSummary totals multiple items and additional cost", () => {
  const summary = calculateTransactionSummary(
    [
      {
        paket_id: 1,
        paket_name: "Cuci Express",
        price: 7000,
        quantity: 2,
        notes: "",
      },
      {
        paket_id: 2,
        paket_name: "Setrika",
        price: 5000,
        quantity: 1,
        notes: "pisah",
      },
    ],
    3000,
    10,
  );

  assert.deepEqual(summary, {
    subtotal: 19000,
    taxAmount: 1900,
    grandTotal: 23900,
  });
});

test("updateTransactionItem changes quantity and notes for a selected item", () => {
  const items = updateTransactionItem(
    [
      {
        paket_id: 1,
        paket_name: "Cuci Express",
        price: 7000,
        quantity: 1,
        notes: "",
      },
    ],
    1,
    {
      quantity: 3,
      notes: "pisahkan putih",
    },
  );

  assert.equal(items[0].quantity, 3);
  assert.equal(items[0].notes, "pisahkan putih");
});

test("removeTransactionItem removes selected package item", () => {
  const items = removeTransactionItem(
    [
      {
        paket_id: 1,
        paket_name: "Cuci Express",
        price: 7000,
        quantity: 1,
        notes: "",
      },
      {
        paket_id: 2,
        paket_name: "Setrika",
        price: 5000,
        quantity: 1,
        notes: "",
      },
    ],
    1,
  );

  assert.equal(items.length, 1);
  assert.equal(items[0].paket_id, 2);
});
