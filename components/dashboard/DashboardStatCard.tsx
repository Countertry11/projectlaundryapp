"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/AnimatedPage";
import { getDashboardToneStyles } from "@/lib/dashboardChrome.mjs";
import { formatRupiah } from "@/utils";

type DashboardStatCardProps = {
  title: string;
  value: number | ReactNode;
  icon: LucideIcon;
  tone?: string;
  trend?: string;
  subtitle?: string;
  isCurrency?: boolean;
};

export default function DashboardStatCard({
  title,
  value,
  icon: Icon,
  tone = "blue",
  trend,
  subtitle,
  isCurrency = false,
}: DashboardStatCardProps) {
  const styles = getDashboardToneStyles(tone);

  return (
    <div className="group relative">
      <div
        className={`absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${styles.glowClassName}`}
      />

      <div className="relative flex h-full flex-col rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110 ${styles.iconClassName}`}
          >
            <Icon className="h-6 w-6 animate-pulse-soft text-white" />
          </div>
          {trend ? (
            <span
              className={`rounded-lg border px-2 py-1 text-[10px] font-bold ${styles.badgeClassName}`}
            >
              {trend}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <div
            className={`font-bold leading-tight text-gray-800 ${
              isCurrency ? "text-base xl:text-lg" : "text-xl xl:text-2xl"
            }`}
          >
            {typeof value === "number" ? (
              isCurrency ? (
                <CountUp end={value} formatter={formatRupiah} />
              ) : (
                <CountUp end={value} />
              )
            ) : (
              value
            )}
          </div>
          {subtitle ? (
            <p className="mt-1 text-[10px] text-gray-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
