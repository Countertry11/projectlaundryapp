import { User } from "@/types";

const STORAGE_KEY = "laundry_user";

/**
 * Get current logged-in user from localStorage
 */
export async function getCurrentUser(): Promise<{
  user: User | null;
  dbUser: User | null;
}> {
  if (typeof window === "undefined") {
    return { user: null, dbUser: null };
  }

  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) {
      return { user: null, dbUser: null };
    }

    const user = JSON.parse(storedUser) as User;
    return { user, dbUser: user };
  } catch {
    return { user: null, dbUser: null };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedUser = localStorage.getItem(STORAGE_KEY);
  return !!storedUser;
}

/**
 * Get user role
 */
export function getUserRole(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) return null;

    const user = JSON.parse(storedUser) as User;
    return user.role;
  } catch {
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string | string[]): boolean {
  const userRole = getUserRole();
  if (!userRole) return false;

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
}
