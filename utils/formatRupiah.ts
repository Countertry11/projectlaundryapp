/**
 * Format number to Indonesian Rupiah currency
 */
export function formatRupiah(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined) return "Rp 0";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

export default formatRupiah;
