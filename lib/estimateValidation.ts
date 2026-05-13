import type { Estimate, LineItem } from "./estimateTypes";

export type EstimateWarning = {
  id: string;
  lineId?: string;
  message: string;
};

function lineWarnings(line: LineItem, index: number): EstimateWarning[] {
  const out: EstimateWarning[] = [];
  const n = index + 1;
  if (!line.description.trim()) {
    out.push({ id: `line-${line.id}-desc`, lineId: line.id, message: `Line ${n}: description is empty.` });
  }
  if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
    out.push({ id: `line-${line.id}-qty`, lineId: line.id, message: `Line ${n}: quantity should be greater than zero.` });
  }
  if (!Number.isFinite(line.unitCost) || line.unitCost < 0) {
    out.push({ id: `line-${line.id}-cost`, lineId: line.id, message: `Line ${n}: unit cost is missing or negative.` });
  }
  if (!line.unit.trim()) {
    out.push({ id: `line-${line.id}-unit`, lineId: line.id, message: `Line ${n}: unit is empty (e.g. ea, SF, LF).` });
  }
  return out;
}

export function validateEstimate(estimate: Estimate): EstimateWarning[] {
  const warnings: EstimateWarning[] = [];
  if (!estimate.projectName.trim()) {
    warnings.push({ id: "project-name", message: "Project name is empty — it appears on exports and print." });
  }
  estimate.lines.forEach((line, i) => {
    warnings.push(...lineWarnings(line, i));
  });
  return warnings;
}
