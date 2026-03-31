const DEFAULT_ESTIMATION_DAYS = 3;
const WIB_TIMEZONE = "Asia/Jakarta";

function toWibDateTimeLocalValue(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = parts.reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function getDefaultKasirDueDateInput(referenceDate = new Date()) {
  return toWibDateTimeLocalValue(
    new Date(
      referenceDate.getTime() +
        DEFAULT_ESTIMATION_DAYS * 24 * 60 * 60 * 1000,
    ),
  );
}

export function createInitialKasirTransactionFormData(
  outletId = "",
  referenceDate = new Date(),
) {
  return {
    outlet_id: outletId,
    customer_id: "",
    items: [],
    due_date: getDefaultKasirDueDateInput(referenceDate),
    additional_cost: 0,
    notes: "",
  };
}
