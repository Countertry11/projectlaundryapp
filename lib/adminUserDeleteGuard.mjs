export function resolveAdminUserDeleteGuard({ currentUser, targetUser }) {
  if (!targetUser) {
    return {
      canDelete: false,
      message: "Pengguna tidak ditemukan.",
    };
  }

  if (
    targetUser.role === "admin" &&
    currentUser?.role === "admin" &&
    currentUser?.id === targetUser.id
  ) {
    return {
      canDelete: false,
      message: "Akun admin yang sedang digunakan tidak bisa dihapus.",
    };
  }

  if (targetUser.role === "admin") {
    return {
      canDelete: false,
      message: "Akun dengan role admin tidak bisa dihapus.",
    };
  }

  if (targetUser.role === "owner") {
    return {
      canDelete: false,
      message: "Akun dengan role owner tidak bisa dihapus.",
    };
  }

  return {
    canDelete: true,
    message: "",
  };
}
