export function normalizeCustomerPhoneValue(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function getCustomerDuplicateMessage(
  rows,
  values,
  options = {},
) {
  const normalizedPhone = normalizeCustomerPhoneValue(values?.phone);

  if (!normalizedPhone) {
    return null;
  }

  const hasDuplicatePhone = rows.some((row) => {
    const rowId = row?.id != null ? String(row.id) : null;

    if (options.excludeId != null && rowId === String(options.excludeId)) {
      return false;
    }

    return normalizeCustomerPhoneValue(row?.phone) === normalizedPhone;
  });

  if (hasDuplicatePhone) {
    return "Nomor telepon pelanggan sudah terdaftar.";
  }

  return null;
}
