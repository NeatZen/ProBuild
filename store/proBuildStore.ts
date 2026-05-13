import { create } from "zustand";

import type { AppPersist, AppSettings, AppUiState, CurrencyCode, SaveStatus } from "@/lib/appTypes";
import { APP_SCHEMA_VERSION, defaultSettings, defaultUiState } from "@/lib/appTypes";
import type { Estimate, LineItem } from "@/lib/estimateTypes";
import {
  createDefaultEstimate,
  createEmptyLineItem,
  resetEstimateInPlace,
} from "@/lib/estimateTypes";
import { LINE_TEMPLATES } from "@/lib/lineTemplates";
import {
  clearAllAppStorage,
  createDefaultAppPersist,
  loadOrCreateAppPersist,
  normalizeAppPersist,
} from "@/lib/persistence";

function newId(): string {
  return crypto.randomUUID();
}

function activeIdOf(s: Pick<ProBuildState, "estimates" | "activeEstimateId">): string {
  if (s.estimates.length === 0) return s.activeEstimateId;
  const exists = s.estimates.some((e) => e.id === s.activeEstimateId);
  return exists ? s.activeEstimateId : s.estimates[0].id;
}

function mapActive(
  estimates: Estimate[],
  activeEstimateId: string,
  fn: (e: Estimate) => Estimate,
): Estimate[] {
  const id = activeIdOf({ estimates, activeEstimateId });
  return estimates.map((e) => (e.id === id ? fn(e) : e));
}

function getActive(estimates: Estimate[], activeEstimateId: string): Estimate {
  const id = activeIdOf({ estimates, activeEstimateId });
  const found = estimates.find((e) => e.id === id);
  if (found) return found;
  return estimates[0];
}

function cloneEstimate(source: Estimate): Estimate {
  return {
    ...source,
    id: newId(),
    lines: source.lines.map((row) => ({
      ...row,
      id: newId(),
    })),
    projectName: source.projectName.trim()
      ? `${source.projectName.trim()} (copy)`
      : "Untitled copy",
  };
}

export type ProBuildState = {
  estimates: Estimate[];
  activeEstimateId: string;
  settings: AppSettings;
  ui: AppUiState;
  saveStatus: SaveStatus;
  saveErrorMessage: string | null;
  hydrated: boolean;

  hydrateFromStorage: () => void;
  setProjectName: (v: string) => void;
  setClientNotes: (v: string) => void;
  setMarkupPercent: (v: number) => void;
  setTaxPercent: (v: number) => void;
  setLine: (lineId: string, patch: Partial<LineItem>) => void;
  addLine: () => void;
  removeLine: (lineId: string) => void;
  moveLine: (lineId: string, direction: "up" | "down") => void;
  duplicateLine: (lineId: string) => void;
  copyLineFromPrevious: (lineId: string) => void;
  createNewEstimate: () => void;
  switchEstimate: (id: string) => void;
  duplicateActiveEstimate: () => void;
  duplicateEstimateById: (id: string) => void;
  archiveEstimate: (id: string) => void;
  resetCurrentEstimateWorkspace: () => void;
  insertTemplate: (templateId: string) => void;
  setLineFilter: (q: string) => void;
  toggleLineCollapsed: (lineId: string) => void;
  setCurrency: (c: CurrencyCode) => void;
  setLocale: (locale: string) => void;
  importPersistJson: (json: string) => { ok: boolean; error?: string };
  exportPersistJson: () => string;
  exportActiveEstimateJson: () => string;
  clearAllData: () => void;
};

export function persistSnapshot(state: ProBuildState): AppPersist {
  return normalizeAppPersist({
    version: APP_SCHEMA_VERSION,
    estimates: state.estimates,
    activeEstimateId: activeIdOf(state),
    settings: state.settings,
    ui: {
      lineFilter: state.ui.lineFilter,
      collapsedLineIds: state.ui.collapsedLineIds,
    },
  });
}

const seed = createDefaultAppPersist();

export const useProBuildStore = create<ProBuildState>((set, get) => ({
  estimates: seed.estimates,
  activeEstimateId: seed.activeEstimateId,
  settings: { ...defaultSettings, ...seed.settings },
  ui: { ...defaultUiState, ...seed.ui },
  saveStatus: "idle",
  saveErrorMessage: null,
  hydrated: false,

  hydrateFromStorage: () => {
    if (get().hydrated) return;
    const p = loadOrCreateAppPersist();
    const n = normalizeAppPersist(p);
    set({
      estimates: n.estimates,
      activeEstimateId: n.activeEstimateId,
      settings: { ...defaultSettings, ...n.settings },
      ui: {
        lineFilter: n.ui?.lineFilter ?? "",
        collapsedLineIds: n.ui?.collapsedLineIds ?? [],
      },
      hydrated: true,
    });
  },

  setProjectName: (projectName) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, projectName })),
    })),

  setClientNotes: (clientNotes) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, clientNotes })),
    })),

  setMarkupPercent: (markupPercent) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, markupPercent })),
    })),

  setTaxPercent: (taxPercent) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, taxPercent })),
    })),

  setLine: (lineId, patch) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        lines: e.lines.map((row) => (row.id === lineId ? { ...row, ...patch } : row)),
      })),
    })),

  addLine: () =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        lines: [...e.lines, createEmptyLineItem(newId())],
      })),
    })),

  removeLine: (lineId) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const lines = e.lines.filter((row) => row.id !== lineId);
        if (lines.length === 0) {
          return { ...e, lines: [createEmptyLineItem(newId())] };
        }
        return { ...e, lines };
      }),
    })),

  moveLine: (lineId, direction) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const idx = e.lines.findIndex((row) => row.id === lineId);
        if (idx < 0) return e;
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= e.lines.length) return e;
        const lines = [...e.lines];
        [lines[idx], lines[swap]] = [lines[swap], lines[idx]];
        return { ...e, lines };
      }),
    })),

  duplicateLine: (lineId) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const idx = e.lines.findIndex((l) => l.id === lineId);
        if (idx < 0) return e;
        const row = e.lines[idx];
        const copy: LineItem = { ...row, id: newId() };
        const lines = [...e.lines.slice(0, idx + 1), copy, ...e.lines.slice(idx + 1)];
        return { ...e, lines };
      }),
    })),

  copyLineFromPrevious: (lineId) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const idx = e.lines.findIndex((l) => l.id === lineId);
        if (idx <= 0) return e;
        const prev = e.lines[idx - 1];
        const cur = e.lines[idx];
        const next: LineItem = {
          ...cur,
          category: prev.category,
          quantity: prev.quantity,
          unit: prev.unit,
          unitCost: prev.unitCost,
        };
        const lines = e.lines.map((l) => (l.id === lineId ? next : l));
        return { ...e, lines };
      }),
    })),

  createNewEstimate: () =>
    set((s) => {
      const fresh = createDefaultEstimate();
      return {
        estimates: [...s.estimates, fresh],
        activeEstimateId: fresh.id,
        ui: { ...s.ui, collapsedLineIds: [] },
      };
    }),

  switchEstimate: (id) =>
    set((s) => {
      if (!s.estimates.some((e) => e.id === id)) return s;
      return { activeEstimateId: id, ui: { ...s.ui, collapsedLineIds: [] } };
    }),

  duplicateActiveEstimate: () =>
    set((s) => {
      const cur = getActive(s.estimates, s.activeEstimateId);
      const copy = cloneEstimate(cur);
      return {
        estimates: [...s.estimates, copy],
        activeEstimateId: copy.id,
        ui: { ...s.ui, collapsedLineIds: [] },
      };
    }),

  duplicateEstimateById: (id) =>
    set((s) => {
      const src = s.estimates.find((e) => e.id === id);
      if (!src) return s;
      const copy = cloneEstimate(src);
      return {
        estimates: [...s.estimates, copy],
        activeEstimateId: copy.id,
        ui: { ...s.ui, collapsedLineIds: [] },
      };
    }),

  archiveEstimate: (id) =>
    set((s) => {
      if (!s.estimates.some((e) => e.id === id)) return s;
      if (s.estimates.length <= 1) {
        return {
          estimates: s.estimates.map((e) => (e.id === id ? resetEstimateInPlace(id) : e)),
          activeEstimateId: id,
          ui: { ...s.ui, collapsedLineIds: [] },
        };
      }
      const next = s.estimates.filter((e) => e.id !== id);
      const nextActive =
        id === s.activeEstimateId ? next[0].id : activeIdOf({ estimates: next, activeEstimateId: s.activeEstimateId });
      return {
        estimates: next,
        activeEstimateId: nextActive,
        ui: { ...s.ui, collapsedLineIds: [] },
      };
    }),

  resetCurrentEstimateWorkspace: () =>
    set((s) => ({
      estimates: s.estimates.map((e) =>
        e.id === s.activeEstimateId ? resetEstimateInPlace(e.id) : e,
      ),
      ui: { ...s.ui, collapsedLineIds: [] },
    })),

  insertTemplate: (templateId) => {
    const t = LINE_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        lines: [...e.lines, ...t.lines.map((row) => ({ ...row, id: newId() }))],
      })),
    }));
  },

  setLineFilter: (lineFilter) => set((s) => ({ ui: { ...s.ui, lineFilter } })),

  toggleLineCollapsed: (lineId) =>
    set((s) => {
      const has = s.ui.collapsedLineIds.includes(lineId);
      const collapsedLineIds = has
        ? s.ui.collapsedLineIds.filter((x) => x !== lineId)
        : [...s.ui.collapsedLineIds, lineId];
      return { ui: { ...s.ui, collapsedLineIds } };
    }),

  setCurrency: (currency) =>
    set((s) => ({
      settings: { ...s.settings, currency },
    })),

  setLocale: (locale) =>
    set((s) => ({
      settings: { ...s.settings, locale: locale.trim() || defaultSettings.locale },
    })),

  importPersistJson: (json) => {
    try {
      const data = JSON.parse(json) as unknown;
      if (!data || typeof data !== "object") return { ok: false, error: "Invalid JSON." };
      const obj = data as AppPersist;
      if (obj.version !== APP_SCHEMA_VERSION || !Array.isArray(obj.estimates)) {
        return { ok: false, error: "Unrecognized backup format (expected app v2)." };
      }
      const normalized = normalizeAppPersist(obj);
      set({
        estimates: normalized.estimates,
        activeEstimateId: normalized.activeEstimateId,
        settings: { ...defaultSettings, ...normalized.settings },
        ui: {
          lineFilter: normalized.ui?.lineFilter ?? "",
          collapsedLineIds: normalized.ui?.collapsedLineIds ?? [],
        },
        hydrated: true,
        saveStatus: "saved",
        saveErrorMessage: null,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not parse JSON." };
    }
  },

  exportPersistJson: () => JSON.stringify(persistSnapshot(get()), null, 2),

  exportActiveEstimateJson: () => {
    const e = getActive(get().estimates, get().activeEstimateId);
    return JSON.stringify(e, null, 2);
  },

  clearAllData: () => {
    clearAllAppStorage();
    const p = createDefaultAppPersist();
    set({
      estimates: p.estimates,
      activeEstimateId: p.activeEstimateId,
      settings: p.settings,
      ui: { ...defaultUiState },
      saveStatus: "idle",
      saveErrorMessage: null,
      hydrated: true,
    });
  },
}));

export function selectActiveEstimate(s: ProBuildState): Estimate {
  if (s.estimates.length === 0) {
    return createDefaultEstimate();
  }
  return getActive(s.estimates, s.activeEstimateId);
}
