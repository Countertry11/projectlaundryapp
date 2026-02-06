"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Protect route - only admin can access
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-700 leading-none mb-1">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {user.role}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-100 ring-2 ring-white">
                {user.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
