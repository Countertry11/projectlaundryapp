"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Calendar,
  X,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Store,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Notification,
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
} from "@/services/notificationService";
import { AnimatedItem } from "@/components/AnimatedPage";

// Mapping nama halaman untuk breadcrumb
const PAGE_LABELS: Record<string, string> = {
  admin: "Admin",
  kasir: "Kasir",
  owner: "Owner",
  dashboard: "Dashboard",
  pelanggan: "Pelanggan",
  outlet: "Outlet",
  paket: "Paket Cucian",
  pengguna: "Pengguna",
  transaksi: "Transaksi",
  laporan: "Laporan",
};

// Warna avatar per role
const ROLE_COLORS: Record<string, string> = {
  admin: "from-blue-600 to-blue-700",
  kasir: "from-emerald-500 to-emerald-600",
  owner: "from-purple-500 to-purple-600",
};

const ROLE_SHADOW: Record<string, string> = {
  admin: "shadow-blue-200/50",
  kasir: "shadow-emerald-200/50",
  owner: "shadow-purple-200/50",
};

// Ikon dan warna untuk tipe notifikasi
const NOTIFICATION_STYLES: Record<string, { icon: React.ElementType; bg: string; text: string; iconColor: string }> = {
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-700", iconColor: "text-blue-500" },
  success: { icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700", iconColor: "text-emerald-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-700", iconColor: "text-amber-500" },
  error: { icon: AlertCircle, bg: "bg-red-50", text: "text-red-700", iconColor: "text-red-500" },
};

// Format waktu relatif
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentUserId = user?.id || "";

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Update waktu setiap menit
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifikasi saat pertama kali
  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      setLoadingNotif(true);
      const [notifs, count] = await Promise.all([
        fetchNotifications(user.id),
        fetchUnreadCount(user.id),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
      setLoadingNotif(false);
    };

    loadNotifications();
  }, [user?.id]);

  // Subscribe ke Realtime
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotifications(
      user.id,
      // On INSERT
      (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
      },
      // On UPDATE
      (updatedNotif) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
        );
        // Recalculate unread
        setNotifications((prev) => {
          const count = prev.filter((n) => !n.is_read).length;
          setUnreadCount(count);
          return prev;
        });
      },
      // On DELETE
      (oldNotif) => {
        setNotifications((prev) => {
          const filtered = prev.filter((n) => n.id !== oldNotif.id);
          setUnreadCount(filtered.filter((n) => !n.is_read).length);
          return filtered;
        });
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Tutup panel saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifPanelRef.current &&
        !notifPanelRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler: tandai satu sebagai dibaca
  const handleMarkAsRead = useCallback(async (notifId: string) => {
    await markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Handler: tandai semua dibaca
  const handleMarkAllAsRead = useCallback(async () => {
    if (!currentUserId) return;
    await markAllAsRead(currentUserId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [currentUserId]);

  // Handler: hapus notifikasi
  const handleDelete = useCallback(async (notifId: string, isRead: boolean) => {
    await deleteNotification(notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    if (!isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Generate breadcrumbs dari URL
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const isDashboard = segment.toLowerCase() === 'admin' || segment.toLowerCase() === 'kasir' || segment.toLowerCase() === 'owner';
    const href = isDashboard ? `/${segment}` : `/${segments.slice(0, index + 1).join("/")}`;
    return {
      href,
      label: PAGE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      isLast: index === segments.length - 1,
    }
  });

  const pageTitle =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : "Dashboard";

  const userRole = user?.role || "admin";
  const avatarColor = ROLE_COLORS[userRole] || ROLE_COLORS.admin;
  const avatarShadow = ROLE_SHADOW[userRole] || ROLE_SHADOW.admin;

  const userInitials = user?.full_name
    ? user.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";

  return (
    <header className="bg-white/80 backdrop-blur-xl h-16 shadow-sm shadow-gray-100/50 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 border-b border-gray-100/80">
      {/* Left Side - Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <AnimatedItem index={0} animation="slideInLeft" className="flex items-center gap-1.5">
            <Store size={14} className="text-gray-400" />
          </AnimatedItem>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              )}
              <span
                className={`truncate ${crumb.isLast
                  ? "font-semibold text-gray-800"
                  : "text-gray-400 hover:text-gray-600 transition-colors"
                  }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
        <h2 className="sm:hidden text-base font-bold text-gray-800 truncate animate-fadeIn">
          {pageTitle}
        </h2>
      </div>

      {/* Right Side - Actions & User Info */}
      <div className="flex items-center justify-end gap-2 md:gap-4 flex-1">

        {/* Search Global (Optional/Placeholder) */}
        <div className="hidden lg:flex relative group animate-slideInRight" style={{ animationDelay: '150ms' }}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={16} />
          </div>
        </div>

        {/* Date & Time */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 bg-gray-50/80 px-3 py-2 rounded-xl border border-gray-100 animate-scaleIn" style={{ animationDelay: '200ms' }}>
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">
            {currentTime.toLocaleDateString("id-ID", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          <span className="w-px h-3 bg-gray-300" />
          <span className="font-semibold text-blue-600">
            {currentTime.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>

        {/* Notification Bell */}
        <div className="relative hidden animate-scaleIn" style={{ animationDelay: '300ms' }}>
          <button
            ref={bellButtonRef}
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className={`relative p-2.5 rounded-xl transition-all group border ${showNotifPanel
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "border-transparent hover:bg-gray-50 hover:border-gray-100"
              }`}
            aria-label="Notifikasi"
          >
            <Bell
              className={`w-5 h-5 transition-transform duration-300 ${showNotifPanel
                ? "rotate-12 scale-110 text-blue-600"
                : "text-gray-500 group-hover:text-gray-700 group-hover:rotate-12"
                }`}
            />
            {/* Badge overlay on top of bell with pulse animation */}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-red-500/20 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {showNotifPanel && (
            <div
              ref={notifPanelRef}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform origin-top-right transition-all animate-fadeIn z-50"
            >
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-white">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Notifikasi</h3>
                  {unreadCount > 0 ? (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {unreadCount} belum dibaca
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Semua sudah dibaca
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1"
                      title="Tandai semua dibaca"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Baca semua</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifPanel(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {loadingNotif ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 mt-3 animate-pulse">Memuat notifikasi...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                      <Bell className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Belum ada notifikasi</p>
                    <p className="text-[10px] text-gray-400 mt-1">Notifikasi akan muncul di sini</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const style = NOTIFICATION_STYLES[notif.type] || NOTIFICATION_STYLES.info;
                    const IconComponent = style.icon;

                    return (
                      <div
                        key={notif.id}
                        className={`px-5 py-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-all group cursor-pointer ${!notif.is_read ? "bg-blue-50/30" : ""
                          }`}
                        onClick={() => {
                          if (!notif.is_read) handleMarkAsRead(notif.id);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`p-2 rounded-xl ${style.bg} flex-shrink-0 mt-0.5`}
                          >
                            <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm font-semibold leading-tight ${!notif.is_read ? "text-gray-800" : "text-gray-600"
                                  }`}
                              >
                                {notif.title}
                              </p>
                              {/* Unread dot */}
                              {!notif.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                {timeAgo(notif.created_at)}
                              </span>
                              {/* Action buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.is_read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(notif.id);
                                    }}
                                    className="p-1.5 bg-white text-blue-600 hover:text-white hover:bg-blue-600 rounded-md shadow-sm border border-gray-100 transition-colors"
                                    title="Tandai dibaca"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(notif.id, notif.is_read);
                                  }}
                                  className="p-1.5 bg-white text-rose-500 hover:text-white hover:bg-rose-500 rounded-md shadow-sm border border-gray-100 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200 hidden md:block" />

        {/* User Profile */}
        <div className="flex items-center gap-3 relative animate-scaleIn" style={{ animationDelay: '400ms' }}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {user?.full_name || "User"}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
              {userRole}
            </p>
          </div>

          {/* Avatar */}
          <div
            className={`h-10 w-10 bg-gradient-to-br ${avatarColor} rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg ${avatarShadow} ring-2 ring-white transition-transform hover:scale-105 cursor-pointer`}
          >
            {userInitials}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
