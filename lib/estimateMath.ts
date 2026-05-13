import type { Estimate, LineItem } from "./estimateTypes";

/** Two-decimal currency rounding (half away from zero at .005). */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const scaled = value * 100;
  const sign = scaled < 0 ? -1 : 1;
  const rounded = Math.round(Math.abs(scaled));
  return (sign * rounded) / 100;
}

export function lineExtended(line: LineItem): number {
  const raw = Number(line.quantity) * Number(line.unitCost);
  if (!Number.isFinite(raw)) return 0;
  return roundMoney(raw);
}

export function subtotalFromLines(lines: LineItem[]): number {
  let sum = 0;
  for (const line of lines) {
    sum += lineExtended(line);
  }
  return roundMoney(sum);
}

export function categorySubtotals(lines: LineItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    const key = line.category.trim() || "Uncategorized";
    const ext = lineExtended(line);
    map.set(key, roundMoney((map.get(key) ?? 0) + ext));
  }
  return map;
}

export type TotalsBreakdown = {
  subtotal: number;
  markupAmount: number;
  taxableBase: number;
  taxAmount: number;
  grandTotal: number;
  byCategory: { category: string; amount: number }[];
};

export function computeTotals(
  lines: LineItem[],
  markupPercent: number,
  taxPercent: number,
): TotalsBreakdown {
  const subtotal = subtotalFromLines(lines);
  const markup = roundMoney(subtotal * (Number(markupPercent) / 100));
  const taxableBase = roundMoney(subtotal + markup);
  const tax = roundMoney(taxableBase * (Number(taxPercent) / 100));
  const grandTotal = roundMoney(taxableBase + tax);

  const catMap = categorySubtotals(lines);
  const byCategory = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => a.category.localeCompare(b.category));

  return {
    subtotal,
    markupAmount: markup,
    taxableBase,
    taxAmount: tax,
    grandTotal,
    byCategory,
  };
}

export function estimateTotals(estimate: Pick<Estimate, "lines" | "markupPercent" | "taxPercent">) {
  return computeTotals(estimate.lines, estimate.markupPercent, estimate.taxPercent);
}
