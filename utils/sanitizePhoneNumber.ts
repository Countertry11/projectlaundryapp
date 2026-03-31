export function sanitizePhoneNumber(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}
