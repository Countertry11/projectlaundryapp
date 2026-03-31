import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllowedAdminUserRoles,
  resolveAdminUserSubmitRole,
} from "./adminUserRoleGuard.mjs";

test("getAllowedAdminUserRoles removes admin option when adding a user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: false, originalRole: null }),
    ["kasir", "owner"],
  );
});

test("getAllowedAdminUserRoles locks admin role while editing an admin user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: true, originalRole: "admin" }),
    ["admin"],
  );
});

test("resolveAdminUserSubmitRole blocks promoting non-admin users to admin", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: true,
      originalRole: "kasir",
      requestedRole: "admin",
    }),
    {
      isValid: false,
      role: "kasir",
      message: "Role admin tidak bisa diberikan lewat form ini.",
    },
  );
});

test("resolveAdminUserSubmitRole keeps admin role fixed during edit", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: true,
      originalRole: "admin",
      requestedRole: "owner",
    }),
    {
      isValid: false,
      role: "admin",
      message: "Role admin tidak bisa diubah ke role lain.",
    },
  );
});
