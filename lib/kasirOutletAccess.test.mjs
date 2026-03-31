import test from "node:test";
import assert from "node:assert/strict";
import { resolveKasirOutletAccess } from "./kasirOutletAccess.mjs";

test("resolveKasirOutletAccess returns assigned outlet name when outlet exists", () => {
  const result = resolveKasirOutletAccess(
    [{ id: "outlet-2", name: "Laundry 2" }],
    "outlet-2",
  );

  assert.equal(result.hasAssignedOutlet, true);
  assert.equal(result.outletId, "outlet-2");
  assert.equal(result.outletName, "Laundry 2");
  assert.equal(result.displayLabel, "Laundry 2");
});

test("resolveKasirOutletAccess returns unassigned label when outlet is missing", () => {
  const result = resolveKasirOutletAccess([], "");

  assert.equal(result.hasAssignedOutlet, false);
  assert.equal(result.displayLabel, "Belum ditugaskan");
});

test("resolveKasirOutletAccess reports missing outlet when id is unknown", () => {
  const result = resolveKasirOutletAccess(
    [{ id: "outlet-utama", name: "Laundry Utama" }],
    "outlet-2",
  );

  assert.equal(result.hasAssignedOutlet, true);
  assert.equal(result.outletName, "");
  assert.equal(result.displayLabel, "Outlet tidak ditemukan");
});
