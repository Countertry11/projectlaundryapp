"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type DashboardPanelProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export default function DashboardPanel({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "",
}: DashboardPanelProps) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-xl shadow-blue-100/20 backdrop-blur-xl ${className}`}
    >
      <div className="flex flex-col gap-4 border-b border-gray-100 bg-white/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 shadow-lg shadow-blue-600/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            {description ? (
              <p className="text-xs text-gray-500">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
