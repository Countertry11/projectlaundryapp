const WIB_TIMEZONE = "Asia/Jakarta";
const WIB_OFFSET_HOURS = 7;
const WIB_NAIVE_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/;

function getWibDayPeriod(hour: number): string {
  if (hour < 5) return "dini hari";
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
}

function getWibDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

function parseDateValue(date: string | Date) {
  if (date instanceof Date) return date;

  const normalizedDate = date.trim().replace(" ", "T");

  if (WIB_NAIVE_DATE_PATTERN.test(normalizedDate)) {
    const [datePart, timePart] = normalizedDate.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second = "0"] = timePart.split(":");

    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        Number(hour) - WIB_OFFSET_HOURS,
        Number(minute),
        Number(second),
      ),
    );
  }

  return new Date(normalizedDate);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "-";

  try {
    const dateObj = parseDateValue(date);

    if (isNaN(dateObj.getTime())) return "-";

    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: WIB_TIMEZONE,
    };

    return dateObj.toLocaleDateString("id-ID", options || defaultOptions);
  } catch {
    return "-";
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";

  try {
    const dateObj = parseDateValue(date);

    if (isNaN(dateObj.getTime())) return "-";

    const parts = new Intl.DateTimeFormat("id-ID", {
      timeZone: WIB_TIMEZONE,
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(dateObj);

    const values = parts.reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});

    const hour = Number(values.hour || "0");
    const dayPeriod = getWibDayPeriod(hour);

    return `${values.day} ${values.month} ${values.year}, ${values.hour}.${values.minute} WIB (${dayPeriod})`;
  } catch {
    return "-";
  }
}

/**
 * Format date short (DD/MM/YYYY)
 */
export function formatDateShort(
  date: string | Date | null | undefined,
): string {
  if (!date) return "-";

  try {
    const dateObj = parseDateValue(date);

    if (isNaN(dateObj.getTime())) return "-";

    return dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: WIB_TIMEZONE,
    });
  } catch {
    return "-";
  }
}

export function toWibDatabaseDateTime(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";

  if (typeof date === "string") {
    const normalizedDate = date.trim().replace(" ", "T");

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedDate)) {
      return `${normalizedDate}:00`;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalizedDate)) {
      return normalizedDate;
    }
  }

  const parsedDate = parseDateValue(date);
  if (isNaN(parsedDate.getTime())) return "";

  const parts = getWibDateParts(parsedDate);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function toWibDateTimeLocalValue(
  date: string | Date | null | undefined,
): string {
  if (!date) return "";

  if (typeof date === "string") {
    const normalizedDate = date.trim().replace(" ", "T");

    if (WIB_NAIVE_DATE_PATTERN.test(normalizedDate)) {
      return normalizedDate.slice(0, 16);
    }
  }

  const parsedDate = parseDateValue(date);
  if (isNaN(parsedDate.getTime())) return "";

  const parts = getWibDateParts(parsedDate);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function addDaysToWibDateTime(
  date: string | Date | null | undefined,
  days: number,
): string {
  if (!date) return "";

  const parsedDate = parseDateValue(date);
  if (isNaN(parsedDate.getTime())) return "";

  return toWibDatabaseDateTime(
    new Date(parsedDate.getTime() + days * 24 * 60 * 60 * 1000),
  );
}

export default formatDate;
