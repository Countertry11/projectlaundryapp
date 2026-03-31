import { supabase } from "@/lib/supabase";
import {
  getNotificationErrorMessage,
  shouldSilenceNotificationError,
} from "@/lib/notificationServiceError.mjs";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

function handleNotificationError(action: string, error: unknown) {
  if (shouldSilenceNotificationError(error)) {
    return;
  }

  const message = getNotificationErrorMessage(error) || "Terjadi kesalahan notifikasi.";
  console.warn(`Notification service warning (${action}): ${message}`);
}

// Fetch semua notifikasi untuk user tertentu
export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    handleNotificationError("fetchNotifications", error);
    return [];
  }
  return (data as Notification[]) || [];
}

// Hitung jumlah notifikasi belum dibaca
export async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    handleNotificationError("fetchUnreadCount", error);
    return 0;
  }
  return count || 0;
}

// Tandai satu notifikasi sebagai dibaca
export async function markAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    handleNotificationError("markAsRead", error);
    return false;
  }
  return true;
}

// Tandai semua notifikasi user sebagai dibaca
export async function markAllAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    handleNotificationError("markAllAsRead", error);
    return false;
  }
  return true;
}

// Hapus satu notifikasi
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);

  if (error) {
    handleNotificationError("deleteNotification", error);
    return false;
  }
  return true;
}

// Subscribe ke notifikasi real-time
export function subscribeToNotifications(
  userId: string,
  onInsert: (notification: Notification) => void,
  onUpdate?: (notification: Notification) => void,
  onDelete?: (oldNotification: { id: string }) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onInsert(payload.new as Notification);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate?.(payload.new as Notification);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onDelete?.(payload.old as { id: string });
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
