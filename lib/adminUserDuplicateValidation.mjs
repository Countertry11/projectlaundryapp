import {
  hasDuplicateByNormalizedField,
  hasDuplicateBySanitizedPhoneField,
} from "./adminDuplicateValidation.mjs";

export function getAdminUserDuplicateMessage(
  rows,
  values,
  options = {},
) {
  if (
    hasDuplicateByNormalizedField(
      rows,
      "full_name",
      values?.full_name,
      options,
    )
  ) {
    return "Nama pengguna sudah terdaftar.";
  }

  if (
    hasDuplicateBySanitizedPhoneField(rows, "phone", values?.phone, options)
  ) {
    return "Nomor telepon pengguna sudah terdaftar.";
  }

  return null;
}
