"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Store, Package, FileText, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Menu items with role-based access
const getMenus = (role: string) => {
  const baseUrl = `/${role}`;
  return [
    { name: "Beranda", href: baseUrl, icon: LayoutDashboard, roles: ["admin", "kasir", "owner"] },
    { name: "Pelanggan", href: `${baseUrl}/pelanggan`, icon: Users, roles: ["admin", "kasir"] },
    { name: "Toko", href: `${baseUrl}/outlet`, icon: Store, roles: ["admin"] },
    { name: "Paket Cucian", href: `${baseUrl}/paket`, icon: Package, roles: ["admin"] },
    { name: "Pengguna", href: `${baseUrl}/pengguna`, icon: Settings, roles: ["admin"] },
    { name: "Transaksi", href: `${baseUrl}/transaksi`, icon: ShoppingCart, roles: ["admin", "kasir"] },
    { name: "Laporan", href: `${baseUrl}/laporan`, icon: FileText, roles: ["admin", "kasir", "owner"] },
  ];
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role || "kasir";
  const menus = getMenus(userRole);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-blue-600 via-blue-650 to-blue-700 text-white flex flex-col fixed left-0 top-0 overflow-y-auto shadow-2xl shadow-blue-900/30">
      {/* Logo Section with entrance animation */}
      <div className="p-6 border-b border-blue-500/50 animate-fadeIn">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm animate-scaleIn">
            <Store className="w-7 h-7" />
          </div>
          <span className="animate-slideInLeft" style={{ animationDelay: '150ms' }}>
            Laundry UKK
          </span>
        </h1>
        <p className="text-xs text-blue-200/70 mt-1 animate-fadeIn" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          Website Pengelolaan Laundry
        </p>
      </div>

      {/* Navigation with staggered entrance */}
      <nav className="flex-1 p-4 space-y-1.5">
        {menus.map((menu, index) => {
          if (!menu.roles.includes(userRole)) return null;
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`sidebar-item flex items-center gap-3 px-4 py-3 rounded-xl animate-fadeInUp ${isActive
                ? "bg-white text-blue-700 shadow-lg shadow-blue-900/20 font-semibold sidebar-item-active"
                : "hover:bg-white/10 text-blue-100 hover:text-white"
                }`}
              style={{ animationDelay: `${(index + 1) * 60}ms`, animationFillMode: 'both' }}
            >
              <menu.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="transition-all duration-200">{menu.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full animate-scaleIn" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout button with animation */}
      <div className="p-4 border-t border-blue-500/50">
        <button
          onClick={handleLogout}
          className="sidebar-item flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/80 transition-all duration-300 text-blue-100 hover:text-white group"
        >
          <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}
