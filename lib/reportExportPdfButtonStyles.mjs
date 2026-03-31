export function getReportExportPdfButtonLabel(exporting) {
  return exporting ? "Mengekspor..." : "Export PDF";
}

export function getReportExportPdfButtonClassName() {
  return [
    "group inline-flex items-center justify-center gap-3",
    "rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-orange-500",
    "px-5 py-3 text-sm font-black text-white",
    "shadow-lg shadow-rose-200/80 transition-all duration-200",
    "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-200",
    "focus:outline-none focus:ring-4 focus:ring-rose-500/15",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg",
  ].join(" ");
}

export function getReportExportPdfIconWrapperClassName() {
  return [
    "flex h-9 w-9 items-center justify-center rounded-xl",
    "bg-white/20 text-white ring-1 ring-white/25",
    "backdrop-blur-sm",
  ].join(" ");
}
