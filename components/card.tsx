import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  icon,
  className = "",
  headerAction,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 overflow-hidden ${className}`}
    >
      {(title || icon || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100/50 flex items-center justify-between">
          <div className="flex items-center">
            {icon && (
              <div className="mr-3 p-2 bg-blue-100 rounded-lg text-blue-600">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              )}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

// Stats Card variant
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "orange";
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
}

export function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  change,
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 group relative overflow-hidden">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          {
            className: "text-4xl md:text-8xl",
          }
        )}
      </div>

      {/* Icon Box */}
      <div
        className={`w-10 h-10 md:w-12 md:h-12 ${colorClasses[color]} rounded-lg md:rounded-xl shadow-lg flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {React.cloneElement(
          icon as React.ReactElement<{ className?: string }>,
          {
            className: "text-white text-lg md:text-xl",
          }
        )}
      </div>

      {/* Title */}
      <h3 className="text-gray-500 text-xs md:text-sm font-medium">{title}</h3>

      {/* Value */}
      <p className="text-xl md:text-3xl font-bold text-gray-800 mt-1">
        {value}
      </p>

      {/* Change indicator */}
      {change && (
        <p
          className={`text-xs md:text-sm mt-1 ${
            change.type === "increase" ? "text-green-600" : "text-red-600"
          }`}
        >
          {change.type === "increase" ? "↑" : "↓"} {Math.abs(change.value)}%
        </p>
      )}
    </div>
  );
}