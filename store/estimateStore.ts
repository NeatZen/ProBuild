import { create } from "zustand";

import type { Estimate, LineItem } from "@/lib/estimateTypes";
import {
  createDefaultEstimate,
  createEmptyLineItem,
} from "@/lib/estimateTypes";

function newId(): string {
  return crypto.randomUUID();
}

type EstimateStore = {
  estimate: Estimate;
  setProjectName: (value: string) => void;
  setClientNotes: (value: string) => void;
  setMarkupPercent: (value: number) => void;
  setTaxPercent: (value: number) => void;
  setLine: (lineId: string, patch: Partial<LineItem>) => void;
  addLine: () => void;
  removeLine: (lineId: string) => void;
  moveLine: (lineId: string, direction: "up" | "down") => void;
  replaceEstimate: (estimate: Estimate) => void;
  resetEstimate: () => void;
};

export const useEstimateStore = create<EstimateStore>((set) => ({
  estimate: createDefaultEstimate(),

  setProjectName: (projectName) =>
    set((s) => ({ estimate: { ...s.estimate, projectName } })),

  setClientNotes: (clientNotes) =>
    set((s) => ({ estimate: { ...s.estimate, clientNotes } })),

  setMarkupPercent: (markupPercent) =>
    set((s) => ({ estimate: { ...s.estimate, markupPercent } })),

  setTaxPercent: (taxPercent) =>
    set((s) => ({ estimate: { ...s.estimate, taxPercent } })),

  setLine: (lineId, patch) =>
    set((s) => ({
      estimate: {
        ...s.estimate,
        lines: s.estimate.lines.map((row) =>
          row.id === lineId ? { ...row, ...patch } : row,
        ),
      },
    })),

  addLine: () =>
    set((s) => ({
      estimate: {
        ...s.estimate,
        lines: [...s.estimate.lines, createEmptyLineItem(newId())],
      },
    })),

  removeLine: (lineId) =>
    set((s) => {
      const lines = s.estimate.lines.filter((row) => row.id !== lineId);
      if (lines.length === 0) {
        return {
          estimate: {
            ...s.estimate,
            lines: [createEmptyLineItem(newId())],
          },
        };
      }
      return { estimate: { ...s.estimate, lines } };
    }),

  moveLine: (lineId, direction) =>
    set((s) => {
      const idx = s.estimate.lines.findIndex((row) => row.id === lineId);
      if (idx < 0) return s;
      const swap = direction === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= s.estimate.lines.length) return s;
      const lines = [...s.estimate.lines];
      [lines[idx], lines[swap]] = [lines[swap], lines[idx]];
      return { estimate: { ...s.estimate, lines } };
    }),

  replaceEstimate: (estimate) => set({ estimate }),

  resetEstimate: () => set({ estimate: createDefaultEstimate() }),
}));
