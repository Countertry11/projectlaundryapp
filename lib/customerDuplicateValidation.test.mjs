import test from "node:test";
import assert from "node:assert/strict";
import { getCustomerDuplicateMessage } from "./customerDuplicateValidation.mjs";

test("getCustomerDuplicateMessage allows duplicate customer name when phone differs", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "08123" }],
    { name: " budi  santoso ", phone: "08999" },
  );

  assert.equal(message, null);
});

test("getCustomerDuplicateMessage blocks duplicate phone number", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "0812-345" }],
    { name: "Rina", phone: "0812345" },
  );

  assert.equal(message, "Nomor telepon pelanggan sudah terdaftar.");
});

test("getCustomerDuplicateMessage ignores the current record on edit", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "0812345" }],
    { name: "Budi Santoso", phone: "0812345" },
    { excludeId: "1" },
  );

  assert.equal(message, null);
});

test("getCustomerDuplicateMessage returns null when customer is unique", () => {
  const message = getCustomerDuplicateMessage(
    [{ id: "1", name: "Budi Santoso", phone: "0812345" }],
    { name: "Rina", phone: "0899999" },
  );

  assert.equal(message, null);
});
