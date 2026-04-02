"use client";

const monthOptions = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

type ReportDateFiltersProps = {
  day: string;
  month: string;
  year: string;
  yearOptions: string[];
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  className?: string;
};

export default function ReportDateFilters({
  day,
  month,
  year,
  yearOptions,
  onDayChange,
  onMonthChange,
  onYearChange,
  className = "",
}: ReportDateFiltersProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <select
        value={day}
        onChange={(e) => onDayChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500/50"
      >
        <option value="all">Semua Tanggal</option>
        {Array.from({ length: 31 }, (_, index) => {
          const value = String(index + 1);
          return (
            <option key={value} value={value}>
              Tanggal {value}
            </option>
          );
        })}
      </select>

      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500/50"
      >
        <option value="all">Semua Bulan</option>
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500/50"
      >
        <option value="all">Semua Tahun</option>
        {yearOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
