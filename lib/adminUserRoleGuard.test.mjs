import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllowedAdminUserRoles,
  isAdminUserRoleLocked,
  resolveAdminUserSubmitRole,
} from "./adminUserRoleGuard.mjs";

test("getAllowedAdminUserRoles only allows kasir when adding a user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: false, originalRole: null }),
    ["kasir"],
  );
});

test("getAllowedAdminUserRoles locks admin role while editing an admin user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: true, originalRole: "admin" }),
    ["admin"],
  );
});

test("getAllowedAdminUserRoles locks owner role while editing an owner user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: true, originalRole: "owner" }),
    ["owner"],
  );
});

test("getAllowedAdminUserRoles locks kasir role while editing a kasir user", () => {
  assert.deepEqual(
    getAllowedAdminUserRoles({ isEditMode: true, originalRole: "kasir" }),
    ["kasir"],
  );
});

test("isAdminUserRoleLocked locks the role selector for existing users", () => {
  assert.equal(
    isAdminUserRoleLocked({ isEditMode: true, originalRole: "owner" }),
    true,
  );
  assert.equal(
    isAdminUserRoleLocked({ isEditMode: true, originalRole: "kasir" }),
    true,
  );
});

test("resolveAdminUserSubmitRole keeps kasir role fixed when edit tries another role", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: true,
      originalRole: "kasir",
      requestedRole: "admin",
    }),
    {
      isValid: false,
      role: "kasir",
      message: "Role kasir tidak bisa diubah ke role lain.",
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

test("resolveAdminUserSubmitRole keeps owner role fixed during edit", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: true,
      originalRole: "owner",
      requestedRole: "kasir",
    }),
    {
      isValid: false,
      role: "owner",
      message: "Role owner tidak bisa diubah ke role lain.",
    },
  );
});

test("resolveAdminUserSubmitRole keeps kasir role fixed during edit", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: true,
      originalRole: "kasir",
      requestedRole: "owner",
    }),
    {
      isValid: false,
      role: "kasir",
      message: "Role kasir tidak bisa diubah ke role lain.",
    },
  );
});

test("resolveAdminUserSubmitRole blocks creating owner users from add form", () => {
  assert.deepEqual(
    resolveAdminUserSubmitRole({
      isEditMode: false,
      originalRole: null,
      requestedRole: "owner",
    }),
    {
      isValid: false,
      role: "kasir",
      message: "Pengguna baru dari form ini hanya bisa berperan sebagai kasir.",
    },
  );
});
