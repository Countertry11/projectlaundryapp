import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDuplicateValue,
  normalizeDisplayValue,
  hasDuplicateByNormalizedField,
  hasDuplicateBySanitizedPhoneField,
} from "./adminDuplicateValidation.mjs";

test("normalizeDuplicateValue trims, lowercases, and collapses spaces", () => {
  assert.equal(normalizeDuplicateValue("  Cabang   Utama "), "cabang utama");
});

test("normalizeDisplayValue trims and collapses spaces without changing casing", () => {
  assert.equal(normalizeDisplayValue("  Cabang   Utama "), "Cabang Utama");
});

test("hasDuplicateByNormalizedField detects duplicates ignoring case and spacing", () => {
  const rows = [{ id: "1", name: "Cabang Utama" }];

  assert.equal(
    hasDuplicateByNormalizedField(rows, "name", " cabang  utama "),
    true,
  );
});

test("hasDuplicateByNormalizedField ignores the current record on edit", () => {
  const rows = [{ id: "1", name: "Cabang Utama" }];

  assert.equal(
    hasDuplicateByNormalizedField(rows, "name", "Cabang Utama", {
      excludeId: "1",
    }),
    false,
  );
});

test("hasDuplicateByNormalizedField detects duplicate package names", () => {
  const rows = [{ id: 2, nama_paket: "Cuci Express" }];

  assert.equal(
    hasDuplicateByNormalizedField(rows, "nama_paket", " cuci   express "),
    true,
  );
});

test("hasDuplicateBySanitizedPhoneField detects duplicate outlet phone numbers", () => {
  const rows = [{ id: "1", phone: "0812-345-678" }];

  assert.equal(
    hasDuplicateBySanitizedPhoneField(rows, "phone", "0812345678"),
    true,
  );
});

test("hasDuplicateBySanitizedPhoneField ignores the current outlet on edit", () => {
  const rows = [{ id: "1", phone: "0812-345-678" }];

  assert.equal(
    hasDuplicateBySanitizedPhoneField(rows, "phone", "0812345678", {
      excludeId: "1",
    }),
    false,
  );
});
