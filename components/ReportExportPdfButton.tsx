"use client";

import { Loader2 } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import {
  getReportExportPdfButtonClassName,
  getReportExportPdfIconWrapperClassName,
  getReportExportPdfButtonLabel,
} from "@/lib/reportExportPdfButtonStyles.mjs";

type ReportExportPdfButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  exporting?: boolean;
  className?: string;
};

export default function ReportExportPdfButton({
  onClick,
  disabled = false,
  exporting = false,
  className = "",
}: ReportExportPdfButtonProps) {
  const label = getReportExportPdfButtonLabel(exporting);
  const buttonClassName =
    [getReportExportPdfButtonClassName(), className].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={exporting}
      className={buttonClassName}
    >
      <span className={getReportExportPdfIconWrapperClassName()}>
        {exporting ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <FaFilePdf size={16} />
        )}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
