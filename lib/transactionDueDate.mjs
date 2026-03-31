const WIB_TIMEZONE = "Asia/Jakarta";
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PREFIX_PATTERN =
  /^\d{4}-\d{2}-\d{2}[T ](\d{2}:\d{2})(:\d{2})?/;

function getWibTimeParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return parts.reduce((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }

    return accumulator;
  }, {});
}

function getTimePartFromSource(value) {
  if (!value) {
    return "00:00:00";
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().replace(" ", "T");
    const match = normalizedValue.match(DATE_TIME_PREFIX_PATTERN);

    if (match) {
      return `${match[1]}${match[2] || ":00"}`;
    }
  }

  const parsedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "00:00:00";
  }

  const parts = getWibTimeParts(parsedDate);
  return `${parts.hour || "00"}:${parts.minute || "00"}:${parts.second || "00"}`;
}

export function isDateOnlyTransactionDueDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  return DATE_ONLY_PATTERN.test(value.trim());
}

export function normalizeTransactionDueDateValue(dueDate, transactionDate) {
  if (!dueDate) {
    return "";
  }

  if (dueDate instanceof Date) {
    return dueDate.toISOString();
  }

  const normalizedDueDate = dueDate.trim().replace(" ", "T");

  if (!isDateOnlyTransactionDueDate(normalizedDueDate)) {
    return normalizedDueDate;
  }

  return `${normalizedDueDate}T${getTimePartFromSource(transactionDate)}`;
}
