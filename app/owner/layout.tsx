"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/navbar";
import { useAuth } from "@/context/AuthContext";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isOwnerReportPage = pathname === "/owner/laporan";

  // Protect route - only owner can access
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "owner")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen bg-slate-50 ${
        isOwnerReportPage ? "owner-report-print-layout" : ""
      }`}
    >
      <div className={isOwnerReportPage ? "owner-report-print-hide" : ""}>
        <Sidebar />
      </div>
      <div
        className={`ml-64 flex-1 flex flex-col ${
          isOwnerReportPage ? "owner-report-print-content" : ""
        }`}
      >
        {/* Navbar */}
        <div className={isOwnerReportPage ? "owner-report-print-hide" : ""}>
          <Navbar />
        </div>
        <main
          className={`p-8 ${
            isOwnerReportPage ? "owner-report-print-main" : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
