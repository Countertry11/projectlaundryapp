export const transactionStatusColors = {
  pending: "bg-blue-50 text-blue-600 border-blue-100",
  processing: "bg-orange-50 text-orange-600 border-orange-100",
  ready: "bg-purple-50 text-purple-600 border-purple-100",
  completed: "bg-green-50 text-green-600 border-green-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

export const transactionStatusLabels = {
  pending: "Baru",
  processing: "Proses",
  ready: "Selesai",
  completed: "Diambil",
  cancelled: "Batal",
};

export const transactionStatusSteps = [
  { value: "pending", label: "Baru" },
  { value: "processing", label: "Proses" },
  { value: "ready", label: "Selesai" },
  { value: "completed", label: "Diambil" },
];

export function getNextTransactionStatus(status) {
  if (status === "pending") return "processing";
  if (status === "processing") return "ready";
  if (status === "ready") return "completed";
  return null;
}

export function isTransactionPickupBlocked(transaction) {
  return (
    transaction?.status === "ready" &&
    transaction?.payment_status !== "paid"
  );
}

export function canAdvanceTransactionStatus(
  currentStatus,
  targetStatus,
  paymentStatus,
) {
  const nextStatus = getNextTransactionStatus(currentStatus);

  if (!nextStatus || targetStatus !== nextStatus) {
    return false;
  }

  if (targetStatus === "completed" && paymentStatus !== "paid") {
    return false;
  }

  return true;
}
