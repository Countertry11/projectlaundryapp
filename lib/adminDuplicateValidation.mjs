export function normalizeDuplicateValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeDisplayValue(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeSanitizedPhoneValue(value) {
  return String(value ?? "").replace(/\D+/g, "");
}

export function hasDuplicateByNormalizedField(
  rows,
  field,
  value,
  options = {},
) {
  const normalizedValue = normalizeDuplicateValue(value);

  if (!normalizedValue) {
    return false;
  }

  return rows.some((row) => {
    const rowId = row?.id != null ? String(row.id) : null;

    if (options.excludeId != null && rowId === String(options.excludeId)) {
      return false;
    }

    return normalizeDuplicateValue(row?.[field]) === normalizedValue;
  });
}

export function hasDuplicateBySanitizedPhoneField(
  rows,
  field,
  value,
  options = {},
) {
  const normalizedValue = normalizeSanitizedPhoneValue(value);

  if (!normalizedValue) {
    return false;
  }

  return rows.some((row) => {
    const rowId = row?.id != null ? String(row.id) : null;

    if (options.excludeId != null && rowId === String(options.excludeId)) {
      return false;
    }

    return normalizeSanitizedPhoneValue(row?.[field]) === normalizedValue;
  });
}
