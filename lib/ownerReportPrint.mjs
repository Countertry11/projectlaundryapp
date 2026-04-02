function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildOwnerReportPrintHtml({
  title,
  subtitle,
  printedAt,
  contentHtml,
}) {
  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
        background: #ffffff;
      }
      .report-shell {
        max-width: 960px;
        margin: 0 auto;
      }
      .report-header {
        margin-bottom: 24px;
      }
      .report-title {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }
      .report-subtitle {
        margin: 8px 0 0;
        font-size: 14px;
        color: #4b5563;
      }
      .report-date {
        margin-top: 6px;
        font-size: 12px;
        color: #6b7280;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #e5e7eb;
        padding: 12px 14px;
        text-align: left;
        font-size: 13px;
      }
      th {
        background: #f3f4f6;
        color: #374151;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.08em;
      }
      tfoot td {
        font-weight: 700;
      }
      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="report-shell">
      <div class="report-header">
        <h1 class="report-title">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="report-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        <div class="report-date">Tanggal cetak: ${escapeHtml(printedAt)}</div>
      </div>
      ${contentHtml}
    </div>
    <script>
      window.addEventListener("load", function () {
        setTimeout(function () {
          window.print();
        }, 150);
      });
    </script>
  </body>
</html>`;
}
