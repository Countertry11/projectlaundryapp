"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Store, Package, FileText, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Menu items with role-based access
const getMenus = (role: string) => {
  const baseUrl = `/${role}`;
  return [
    { name: "Dashboard", href: baseUrl, icon: LayoutDashboard, roles: ["admin", "kasir", "owner"] },
    { name: "Pelanggan", href: `${baseUrl}/pelanggan`, icon: Users, roles: ["admin", "kasir"] },
    { name: "Outlet", href: `${baseUrl}/outlet`, icon: Store, roles: ["admin"] },
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
    <div className="h-screen w-64 bg-blue-600 text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-blue-500">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="w-8 h-8" />
          Laundry UKK
        </h1>
        <p className="text-xs text-blue-200 mt-1">Aplikasi Pengelolaan Laundry</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menus.map((menu) => {
          if (!menu.roles.includes(userRole)) return null;
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? "bg-white text-blue-700 shadow-lg font-semibold"
                : "hover:bg-blue-500 text-blue-100"
                }`}
            >
              <menu.icon size={20} />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-500">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500 transition-colors text-blue-100 hover:text-white">
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </div>
  );
}
