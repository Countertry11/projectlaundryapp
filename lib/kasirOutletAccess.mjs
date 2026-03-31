export function resolveKasirOutletAccess(outlets, outletId) {
  const normalizedOutletId = String(outletId ?? "").trim();

  if (!normalizedOutletId) {
    return {
      hasAssignedOutlet: false,
      outletId: "",
      outletName: "",
      displayLabel: "Belum ditugaskan",
    };
  }

  const assignedOutlet =
    outlets.find((outlet) => String(outlet?.id ?? "") === normalizedOutletId) ||
    null;

  if (!assignedOutlet) {
    return {
      hasAssignedOutlet: true,
      outletId: normalizedOutletId,
      outletName: "",
      displayLabel: "Outlet tidak ditemukan",
    };
  }

  return {
    hasAssignedOutlet: true,
    outletId: normalizedOutletId,
    outletName: assignedOutlet.name || "",
    displayLabel: assignedOutlet.name || "Outlet tidak ditemukan",
  };
}
