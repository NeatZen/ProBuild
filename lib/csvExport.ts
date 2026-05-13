import type { Estimate } from "./estimateTypes";
import { lineExtended } from "./estimateMath";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function estimateToCsv(estimate: Estimate): string {
  const sectionLabel = (id: string) =>
    estimate.sections.find((s) => s.id === id)?.label ?? "";

  const header = [
    "Description",
    "Category",
    "Line type",
    "Section",
    "Quantity",
    "Unit",
    "Unit cost",
    "Line total",
  ];
  const rows: string[][] = [header];

  for (const line of estimate.lines) {
    rows.push([
      line.description,
      line.category,
      line.lineType,
      sectionLabel(line.sectionId),
      String(line.quantity),
      line.unit,
      String(line.unitCost),
      String(lineExtended(line)),
    ]);
  }

  return rows.map((r) => r.map(escapeCsvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function defaultCsvFilename(estimate: Estimate): string {
  const base = estimate.projectName.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  const slug = base || "estimate";
  return `${slug}.csv`;
}
