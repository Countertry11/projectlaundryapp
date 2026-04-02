function parseReportDateValue(value) {
  if (!value) return null;

  const rawValue = String(value).trim();
  const isoDate = rawValue.includes("T") ? rawValue.split("T")[0] : rawValue;
  const parts = isoDate.split("-");

  if (parts.length !== 3) return null;

  const [year, month, day] = parts;

  if (!year || !month || !day) return null;

  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year,
    isoDate,
  };
}

export function getReportDateParts(value) {
  return parseReportDateValue(value);
}

export function filterRowsByReportDate(
  rows,
  filters,
  dateField = "transaction_date",
) {
  return rows.filter((row) => {
    const parts = getReportDateParts(row?.[dateField]);

    if (!parts) return false;

    if (filters?.day && filters.day !== "all" && parts.day !== filters.day) {
      return false;
    }

    if (
      filters?.month &&
      filters.month !== "all" &&
      parts.month !== filters.month
    ) {
      return false;
    }

    if (
      filters?.year &&
      filters.year !== "all" &&
      parts.year !== filters.year
    ) {
      return false;
    }

    return true;
  });
}

export function getReportDateFilterYearOptions(
  rows,
  dateField = "transaction_date",
) {
  const years = new Set();

  rows.forEach((row) => {
    const parts = getReportDateParts(row?.[dateField]);
    if (parts?.year) {
      years.add(parts.year);
    }
  });

  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}
