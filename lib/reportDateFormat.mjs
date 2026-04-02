const REPORT_TIMEZONE = "Asia/Jakarta";

export function formatReportDate(value) {
  if (!value) return "-";

  const parsedDate = new Date(String(value).trim());

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: REPORT_TIMEZONE,
  });
}

export function formatCurrentReportDate(date = new Date()) {
  return formatReportDate(date);
}
