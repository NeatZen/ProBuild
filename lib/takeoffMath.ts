import { roundMoney } from "./estimateMath";

export type RoundMode = "none" | "whole" | "half";

export function grossSfFromLfHeight(lf: number, heightFt: number): number {
  if (!Number.isFinite(lf) || !Number.isFinite(heightFt)) return 0;
  return Math.max(0, lf * heightFt);
}

export function applyWasteSf(grossSf: number, wastePercent: number): number {
  if (!Number.isFinite(grossSf) || grossSf <= 0) return 0;
  const w = Number.isFinite(wastePercent) ? wastePercent : 0;
  return roundMoney(grossSf * (1 + Math.max(0, w) / 100));
}

export function roundQuantity(q: number, mode: RoundMode): number {
  if (!Number.isFinite(q) || q <= 0) return 0;
  if (mode === "none") return roundMoney(q);
  if (mode === "whole") return Math.ceil(q - 1e-9);
  if (mode === "half") return Math.ceil(q * 2 - 1e-9) / 2;
  return roundMoney(q);
}
