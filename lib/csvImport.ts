import type { LineType } from "./estimateTypes";

const LINE_TYPE_ALIASES: Record<string, LineType> = {
  labor: "labor",
  material: "material",
  allowance: "allowance",
  subcontractor: "subcontractor",
  sub: "subcontractor",
  equipment: "equipment",
  eq: "equipment",
  other: "other",
};

export type CsvImportedLineSeed = {
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineType: LineType;
  /** When present, matched to estimate section labels (case-insensitive). */
  sectionLabelHint: string;
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseNumber(raw: string, fallback: number): number {
  const cleaned = raw.replace(/[$,\s]/g, "").trim();
  if (cleaned === "") return fallback;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

export type CsvImportResult = {
  lines: CsvImportedLineSeed[];
  errors: string[];
  headerRow: string[];
};

/** Parse vendor-style CSV / paste into line seeds. Column names are matched flexibly. */
export function parseEstimateCsv(text: string): CsvImportResult {
  const errors: string[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    return { lines: [], errors: ["Paste or upload is empty."], headerRow: [] };
  }

  const rows: string[][] = [];
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        q = !q;
        continue;
      }
      if (!q && c === ",") {
        cells.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    cells.push(cur);
    rows.push(cells.map((c) => c.trim()));
  }

  if (rows.length === 0) {
    return { lines: [], errors: ["No rows found."], headerRow: [] };
  }

  const headerRaw = rows[0];
  const headerNorm = headerRaw.map(normalizeHeader);
  const headerRow = headerRaw.map((h) => h.trim());

  const findIdx = (...names: string[]): number => {
    for (const n of names) {
      const want = normalizeHeader(n);
      const i = headerNorm.indexOf(want);
      if (i >= 0) return i;
    }
    return -1;
  };

  const idxDesc =
    findIdx("description", "item", "name", "scope") >= 0 ? findIdx("description", "item", "name", "scope") : 0;
  const idxCat = findIdx("category", "trade", "class", "type");
  const idxQty = findIdx("quantity", "qty", "qnty", "count");
  const idxUnit = findIdx("unit", "uom");
  const idxCost =
    findIdx("unit cost", "unit price", "cost", "price", "rate", "each") >= 0
      ? findIdx("unit cost", "unit price", "cost", "price", "rate", "each")
      : -1;
  const idxLineType = findIdx("line type", "linetype", "kind", "cost type");
  const idxSection = findIdx("section", "phase", "alternate", "bid section");

  if (idxDesc < 0 || idxDesc >= headerRaw.length) {
    errors.push("Could not find a description column.");
  }

  const lines: CsvImportedLineSeed[] = [];
  const dataRows = rows.slice(1);

  for (const row of dataRows) {
    const desc = (row[idxDesc] ?? "").trim();
    if (!desc) continue;

    const qty = idxQty >= 0 ? parseNumber(row[idxQty] ?? "1", 1) : 1;
    const unitCost = idxCost >= 0 ? parseNumber(row[idxCost] ?? "0", 0) : 0;
    const category = idxCat >= 0 ? (row[idxCat] ?? "").trim() : "";
    const unit = idxUnit >= 0 && (row[idxUnit] ?? "").trim() ? (row[idxUnit] ?? "").trim() : "ea";

    let lineType: LineType = "other";
    if (idxLineType >= 0) {
      const rawLt = (row[idxLineType] ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
      lineType = LINE_TYPE_ALIASES[rawLt] ?? "other";
    }

    const sectionLabelHint = idxSection >= 0 ? (row[idxSection] ?? "").trim() : "";

    lines.push({
      description: desc,
      category,
      quantity: qty,
      unit,
      unitCost,
      lineType,
      sectionLabelHint,
    });
  }

  if (lines.length === 0 && dataRows.length > 0) {
    errors.push("No data rows with descriptions were found.");
  }

  return { lines, errors, headerRow };
}
