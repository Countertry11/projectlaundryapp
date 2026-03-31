function normalizePrice(value) {
  return Number(value || 0);
}

function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  return quantity > 0 ? quantity : 1;
}

export function addPackageToTransactionItems(items, paket) {
  const paketId = Number(paket?.id || 0);

  if (!paketId) {
    return items;
  }

  const existingItem = items.find((item) => item.paket_id === paketId);

  if (existingItem) {
    return items.map((item) =>
      item.paket_id === paketId
        ? { ...item, quantity: normalizeQuantity(item.quantity) + 1 }
        : item,
    );
  }

  return [
    ...items,
    {
      paket_id: paketId,
      paket_name: paket?.nama_paket || "",
      price: normalizePrice(paket?.harga),
      quantity: 1,
      notes: "",
    },
  ];
}

export function updateTransactionItem(items, paketId, patch) {
  return items.map((item) =>
    item.paket_id === paketId
      ? {
          ...item,
          ...patch,
          quantity: normalizeQuantity(patch.quantity ?? item.quantity),
          price: normalizePrice(patch.price ?? item.price),
        }
      : item,
  );
}

export function removeTransactionItem(items, paketId) {
  return items.filter((item) => item.paket_id !== paketId);
}

export function calculateTransactionSummary(items, additionalCost, taxPercent) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + normalizePrice(item.price) * normalizeQuantity(item.quantity),
    0,
  );
  const taxAmount = Math.round(subtotal * (Number(taxPercent || 0) / 100));
  const grandTotal = subtotal + taxAmount + Number(additionalCost || 0);

  return {
    subtotal,
    taxAmount,
    grandTotal,
  };
}
