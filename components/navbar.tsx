"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers,
  Calendar,
  RefreshCw,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  Users,
  FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/transaksi", label: "Transaksi", icon: ShoppingBag },
    { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
    { href: "/admin/laporan", label: "Laporan", icon: FileText },
  ];

  return (
    <>
      {/* Fixed Navbar - Putih seperti aslinya */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        {/* Header with Glassmorphism - Putih */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-blue-100/20 border border-white/20">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Top Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Left side - Logo and Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/20">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Dashboard Admin
                    </h1>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {currentTime.toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="text-blue-600 font-medium">
                        {currentTime.toLocaleTimeString('id-ID')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right side - Welcome Card and Refresh (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-0.5 rounded-2xl shadow-lg shadow-blue-600/20">
                  <div className="bg-white/90 backdrop-blur rounded-2xl px-5 py-3">
                    <p className="text-xs text-gray-500">Selamat datang,</p>
                    <p className="font-bold text-gray-800 capitalize flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      {user?.full_name}
                    </p>
                  </div>
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 disabled:opacity-50 group"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 group-hover:rotate-180 transition-all duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 hover:border-red-200 group"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive(link.href)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                        : 'text-gray-600 hover:bg-white/50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Welcome Card */}
            <div className="md:hidden mt-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-0.5 rounded-2xl shadow-lg shadow-blue-600/20">
                <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Selamat datang,</p>
                      <p className="font-bold text-gray-800 text-sm capitalize">
                        {user?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="p-2 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-red-200"
                    >
                      <LogOut className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-40 md:h-48" />

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn">
          <div className="absolute top-32 left-4 right-4 bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user?.full_name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                      isActive(link.href)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}