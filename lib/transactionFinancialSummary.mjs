function toNumber(value) {
  const parsedValue = Number(value || 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function inferTransactionAdditionalCost(transaction) {
  const totalAmount = toNumber(transaction?.total_amount);
  const currentDiscount = toNumber(transaction?.discount);
  const taxAmount = toNumber(transaction?.tax);
  const grandTotal = toNumber(transaction?.grand_total);
  const discountAmount = totalAmount * (currentDiscount / 100);

  return Math.max(0, grandTotal - (totalAmount - discountAmount + taxAmount));
}

export function buildTransactionFinancialSummary(transaction) {
  const subtotal = toNumber(transaction?.total_amount);
  const discountPercent = toNumber(transaction?.discount);
  const taxAmount = toNumber(transaction?.tax);
  const grandTotal = toNumber(transaction?.grand_total);
  const discountAmount = subtotal * (discountPercent / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const additionalCost = inferTransactionAdditionalCost(transaction);

  return {
    subtotal,
    discountPercent,
    discountAmount,
    subtotalAfterDiscount,
    taxAmount,
    additionalCost,
    grandTotal,
  };
}

export function getTransactionDelayDiscountUpdate(
  transaction,
  expectedDiscountPercent,
) {
  const currentDiscount = toNumber(transaction?.discount);

  if (currentDiscount === expectedDiscountPercent) return null;

  const totalAmount = toNumber(transaction?.total_amount);
  const taxAmount = toNumber(transaction?.tax);
  const additionalCost = inferTransactionAdditionalCost(transaction);
  const nextGrandTotal =
    totalAmount -
    totalAmount * (expectedDiscountPercent / 100) +
    taxAmount +
    additionalCost;

  return {
    discount: expectedDiscountPercent,
    grand_total: nextGrandTotal,
  };
}
