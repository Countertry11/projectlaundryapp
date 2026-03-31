import test from "node:test";
import assert from "node:assert/strict";
import { resolveAdminUserDeleteGuard } from "./adminUserDeleteGuard.mjs";

test("blocks deleting another admin account", () => {
  assert.deepEqual(
    resolveAdminUserDeleteGuard({
      currentUser: { id: "1", role: "admin" },
      targetUser: { id: "2", role: "admin" },
    }),
    {
      canDelete: false,
      message: "Akun dengan role admin tidak bisa dihapus.",
    },
  );
});

test("blocks deleting the current admin account", () => {
  assert.deepEqual(
    resolveAdminUserDeleteGuard({
      currentUser: { id: "1", role: "admin" },
      targetUser: { id: "1", role: "admin" },
    }),
    {
      canDelete: false,
      message: "Akun admin yang sedang digunakan tidak bisa dihapus.",
    },
  );
});

test("allows deleting non-admin users", () => {
  assert.deepEqual(
    resolveAdminUserDeleteGuard({
      currentUser: { id: "1", role: "admin" },
      targetUser: { id: "3", role: "kasir" },
    }),
    {
      canDelete: true,
      message: "",
    },
  );
});
