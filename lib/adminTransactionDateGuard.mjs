const WIB_TIMEZONE = "Asia/Jakarta";

function getWibDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return parts.reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

function normalizeDateTimeLocalValue(value) {
  return String(value ?? "")
    .trim()
    .replace(" ", "T")
    .slice(0, 16);
}

export function getMinimumAdminTransactionDateInput(now = new Date()) {
  const parts = getWibDateParts(now);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function isAdminTransactionDateBeforeMinimum(value, minimumValue) {
  const normalizedValue = normalizeDateTimeLocalValue(value);
  const normalizedMinimum = normalizeDateTimeLocalValue(minimumValue);

  if (!normalizedValue || !normalizedMinimum) {
    return false;
  }

  return normalizedValue < normalizedMinimum;
}
