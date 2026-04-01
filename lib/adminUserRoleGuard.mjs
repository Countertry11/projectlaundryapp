const ADD_USER_ROLES = ["kasir"];
const EDITABLE_NON_ADMIN_USER_ROLES = ["kasir", "owner"];
const LOCKED_EDIT_USER_ROLES = ["admin", "owner", "kasir"];

function normalizeRequestedRole(requestedRole) {
  if (requestedRole === "admin" || requestedRole === "owner") {
    return requestedRole;
  }

  return "kasir";
}

export function getAllowedAdminUserRoles({ isEditMode, originalRole } = {}) {
  if (isEditMode && LOCKED_EDIT_USER_ROLES.includes(originalRole)) {
    return [originalRole];
  }

  if (!isEditMode) {
    return ADD_USER_ROLES;
  }

  return EDITABLE_NON_ADMIN_USER_ROLES;
}

export function isAdminUserRoleLocked({ isEditMode, originalRole } = {}) {
  return Boolean(isEditMode && LOCKED_EDIT_USER_ROLES.includes(originalRole));
}

export function resolveAdminUserSubmitRole({
  isEditMode,
  originalRole,
  requestedRole,
} = {}) {
  const normalizedRequestedRole = normalizeRequestedRole(requestedRole);
  const fallbackRole =
    originalRole === "owner" || originalRole === "admin" ? originalRole : "kasir";

  if (!isEditMode) {
    if (normalizedRequestedRole !== "kasir") {
      return {
        isValid: false,
        role: "kasir",
        message: "Pengguna baru dari form ini hanya bisa berperan sebagai kasir.",
      };
    }

    return {
      isValid: true,
      role: normalizedRequestedRole,
      message: null,
    };
  }

  if (LOCKED_EDIT_USER_ROLES.includes(originalRole)) {
    if (normalizedRequestedRole !== originalRole) {
      return {
        isValid: false,
        role: originalRole,
        message: `Role ${originalRole} tidak bisa diubah ke role lain.`,
      };
    }

    return {
      isValid: true,
      role: originalRole,
      message: null,
    };
  }

  if (normalizedRequestedRole === "admin") {
    return {
      isValid: false,
      role: fallbackRole,
      message: "Role admin tidak bisa diberikan lewat form ini.",
    };
  }

  return {
    isValid: true,
    role: normalizedRequestedRole,
    message: null,
  };
}
