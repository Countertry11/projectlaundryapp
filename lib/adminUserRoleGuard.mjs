const NON_ADMIN_USER_ROLES = ["kasir", "owner"];

function normalizeRequestedRole(requestedRole) {
  if (requestedRole === "admin" || requestedRole === "owner") {
    return requestedRole;
  }

  return "kasir";
}

export function getAllowedAdminUserRoles({ isEditMode, originalRole } = {}) {
  if (isEditMode && originalRole === "admin") {
    return ["admin"];
  }

  return NON_ADMIN_USER_ROLES;
}

export function isAdminUserRoleLocked({ isEditMode, originalRole } = {}) {
  return Boolean(isEditMode && originalRole === "admin");
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
    if (normalizedRequestedRole === "admin") {
      return {
        isValid: false,
        role: "kasir",
        message: "Role admin tidak bisa diberikan lewat form ini.",
      };
    }

    return {
      isValid: true,
      role: normalizedRequestedRole,
      message: null,
    };
  }

  if (originalRole === "admin") {
    if (normalizedRequestedRole !== "admin") {
      return {
        isValid: false,
        role: "admin",
        message: "Role admin tidak bisa diubah ke role lain.",
      };
    }

    return {
      isValid: true,
      role: "admin",
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
