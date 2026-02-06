import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Column {
  key: string;
  label: string;
}

interface ExportPDFOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: Column[];
  data: Record<string, unknown>[];
  formatters?: Record<string, (value: unknown) => string>;
}

/**
 * Export data to PDF with table format
 */
export function exportToPDF(options: ExportPDFOptions): void {
  const { title, subtitle, filename, columns, data, formatters = {} } = options;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 30);
  }

  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Tanggal: ${dateStr}`, 14, subtitle ? 38 : 30);

  // Prepare table data
  const tableColumns = columns.map((col) => col.label);
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key];
      if (formatters[col.key]) {
        return formatters[col.key](value);
      }
      return value?.toString() || "-";
    })
  );

  // Add table
  autoTable(doc, {
    head: [tableColumns],
    body: tableData,
    startY: subtitle ? 45 : 37,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { left: 14, right: 14 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `LaundryPro - Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

interface MultiTableOptions {
  title: string;
  subtitle?: string;
  filename: string;
  tables: {
    title: string;
    columns: Column[];
    data: Record<string, unknown>[];
    formatters?: Record<string, (value: unknown) => string>;
  }[];
}

/**
 * Export multiple tables to PDF
 */
export function exportMultiTableToPDF(options: MultiTableOptions): void {
  const { title, subtitle, filename, tables } = options;

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 30);
  }

  doc.setFontSize(10);
  doc.setTextColor(100);
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Tanggal: ${dateStr}`, 14, subtitle ? 38 : 30);

  let currentY = subtitle ? 48 : 40;

  tables.forEach((table, index) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(table.title, 14, currentY);
    currentY += 5;

    const tableColumns = table.columns.map((col) => col.label);
    const tableData = table.data.map((row) =>
      table.columns.map((col) => {
        const value = row[col.key];
        if (table.formatters && table.formatters[col.key]) {
          return table.formatters[col.key](value);
        }
        return value?.toString() || "-";
      })
    );

    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: currentY,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 15;

    if (
      index < tables.length - 1 &&
      currentY > doc.internal.pageSize.height - 50
    ) {
      doc.addPage();
      currentY = 20;
    }
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `LaundryPro - Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}