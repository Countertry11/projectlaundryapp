import test from "node:test";
import assert from "node:assert/strict";
import { getAdminUserDuplicateMessage } from "./adminUserDuplicateValidation.mjs";

test("getAdminUserDuplicateMessage blocks duplicate full name", () => {
  const message = getAdminUserDuplicateMessage(
    [{ id: "1", full_name: "Budi Santoso", phone: "08123" }],
    { full_name: "  budi   santoso ", phone: "08999" },
  );

  assert.equal(message, "Nama pengguna sudah terdaftar.");
});

test("getAdminUserDuplicateMessage blocks duplicate phone number", () => {
  const message = getAdminUserDuplicateMessage(
    [{ id: "1", full_name: "Budi Santoso", phone: "0812-345" }],
    { full_name: "Rina", phone: "0812345" },
  );

  assert.equal(message, "Nomor telepon pengguna sudah terdaftar.");
});

test("getAdminUserDuplicateMessage ignores the current record on edit", () => {
  const message = getAdminUserDuplicateMessage(
    [{ id: "1", full_name: "Budi Santoso", phone: "0812345" }],
    { full_name: "Budi Santoso", phone: "0812345" },
    { excludeId: "1" },
  );

  assert.equal(message, null);
});

test("getAdminUserDuplicateMessage returns null when user is unique", () => {
  const message = getAdminUserDuplicateMessage(
    [{ id: "1", full_name: "Budi Santoso", phone: "0812345" }],
    { full_name: "Rina", phone: "0899999" },
  );

  assert.equal(message, null);
});
