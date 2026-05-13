import { create } from "zustand";

import type {
  AppPersist,
  AppSettings,
  AppUiState,
  CurrencyCode,
  DensityMode,
  EstimateRevision,
  SaveStatus,
} from "@/lib/appTypes";
import { APP_SCHEMA_VERSION, defaultSettings, defaultUiState } from "@/lib/appTypes";
import { ASSEMBLIES } from "@/lib/assemblies";
import { normalizeEstimate } from "@/lib/estimateNormalize";
import type { CategoryMarkup, Estimate, LineItem } from "@/lib/estimateTypes";
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

function remapKitIds(lines: LineItem[]): LineItem[] {
  const kitMap = new Map<string, string>();
  return lines.map((row) => {
    const next: LineItem = { ...row, id: newId() };
    if (row.kitId) {
      if (!kitMap.has(row.kitId)) kitMap.set(row.kitId, newId());
      next.kitId = kitMap.get(row.kitId);
    }
    return next;
  });
}

function cloneEstimate(source: Estimate): Estimate {
  return {
    ...source,
    id: newId(),
    categoryMarkups: source.categoryMarkups.map((r) => ({ ...r })),
    lines: remapKitIds(source.lines),
    projectName: source.projectName.trim()
      ? `${source.projectName.trim()} (copy)`
      : "Untitled copy",
  };
}

export type ProBuildState = {
  estimates: Estimate[];
  activeEstimateId: string;
  revisionsByEstimateId: Record<string, EstimateRevision[]>;
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
  setOverheadPercent: (v: number) => void;
  setBondInsuranceFlat: (v: number) => void;
  setRetentionPercent: (v: number) => void;
  setCategoryMarkups: (rows: CategoryMarkup[]) => void;
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
  insertAssembly: (assemblyId: string) => void;
  saveRevisionSnapshot: (note: string) => void;
  restoreRevisionSnapshot: (revisionId: string) => void;
  removeRevisionSnapshot: (revisionId: string) => void;
  setLineFilter: (q: string) => void;
  toggleLineCollapsed: (lineId: string) => void;
  setCurrency: (c: CurrencyCode) => void;
  setLocale: (locale: string) => void;
  setDensity: (d: DensityMode) => void;
  importPersistJson: (json: string) => { ok: boolean; error?: string };
  exportPersistJson: () => string;
  exportActiveEstimateJson: () => string;
  clearAllData: () => void;
};

export function persistSnapshot(state: ProBuildState): AppPersist {
  return normalizeAppPersist({
    version: APP_SCHEMA_VERSION,
    estimates: state.estimates.map((e) => normalizeEstimate(e)),
    activeEstimateId: activeIdOf(state),
    settings: state.settings,
    ui: {
      lineFilter: state.ui.lineFilter,
      collapsedLineIds: state.ui.collapsedLineIds,
    },
    revisionsByEstimateId: state.revisionsByEstimateId,
  });
}

const seed = createDefaultAppPersist();

export const useProBuildStore = create<ProBuildState>((set, get) => ({
  estimates: seed.estimates,
  activeEstimateId: seed.activeEstimateId,
  revisionsByEstimateId: seed.revisionsByEstimateId ?? {},
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
      revisionsByEstimateId: n.revisionsByEstimateId ?? {},
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

  setOverheadPercent: (overheadPercent) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, overheadPercent })),
    })),

  setBondInsuranceFlat: (bondInsuranceFlat) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, bondInsuranceFlat })),
    })),

  setRetentionPercent: (retentionPercent) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, retentionPercent })),
    })),

  setCategoryMarkups: (categoryMarkups) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        categoryMarkups: categoryMarkups.map((r) => ({
          category: r.category,
          percent: Number.isFinite(Number(r.percent)) ? Number(r.percent) : 0,
        })),
      })),
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
        const copy: LineItem = {
          ...row,
          id: newId(),
          kitId: undefined,
          kitName: undefined,
        };
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
          revisionsByEstimateId: { ...s.revisionsByEstimateId, [id]: [] },
        };
      }
      const next = s.estimates.filter((e) => e.id !== id);
      const nextActive =
        id === s.activeEstimateId ? next[0].id : activeIdOf({ estimates: next, activeEstimateId: s.activeEstimateId });
      const restRevisions = { ...s.revisionsByEstimateId };
      delete restRevisions[id];
      return {
        estimates: next,
        activeEstimateId: nextActive,
        ui: { ...s.ui, collapsedLineIds: [] },
        revisionsByEstimateId: restRevisions,
      };
    }),

  resetCurrentEstimateWorkspace: () =>
    set((s) => {
      const id = s.activeEstimateId;
      return {
        estimates: s.estimates.map((e) => (e.id === id ? resetEstimateInPlace(e.id) : e)),
        ui: { ...s.ui, collapsedLineIds: [] },
        revisionsByEstimateId: { ...s.revisionsByEstimateId, [id]: [] },
      };
    }),

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

  insertAssembly: (assemblyId) => {
    const def = ASSEMBLIES.find((x) => x.id === assemblyId);
    if (!def) return;
    const kitId = newId();
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        lines: [
          ...e.lines,
          ...def.lines.map((row) => ({
            ...row,
            id: newId(),
            kitId,
            kitName: def.name,
          })),
        ],
      })),
    }));
  },

  saveRevisionSnapshot: (note) =>
    set((s) => {
      const id = activeIdOf(s);
      const cur = normalizeEstimate(getActive(s.estimates, id));
      const rev: EstimateRevision = {
        id: newId(),
        createdAt: new Date().toISOString(),
        note: note.trim() || "Snapshot",
        payload: cur,
      };
      const prev = s.revisionsByEstimateId[id] ?? [];
      const nextList = [rev, ...prev].slice(0, 40);
      return {
        revisionsByEstimateId: { ...s.revisionsByEstimateId, [id]: nextList },
      };
    }),

  restoreRevisionSnapshot: (revisionId) =>
    set((s) => {
      const id = activeIdOf(s);
      const list = s.revisionsByEstimateId[id] ?? [];
      const rev = list.find((r) => r.id === revisionId);
      if (!rev) return s;
      const restored = normalizeEstimate(rev.payload);
      const merged: Estimate = { ...restored, id };
      return {
        estimates: s.estimates.map((e) => (e.id === id ? merged : e)),
      };
    }),

  removeRevisionSnapshot: (revisionId) =>
    set((s) => {
      const id = activeIdOf(s);
      const list = s.revisionsByEstimateId[id] ?? [];
      return {
        revisionsByEstimateId: {
          ...s.revisionsByEstimateId,
          [id]: list.filter((r) => r.id !== revisionId),
        },
      };
    }),

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

  setDensity: (density) =>
    set((s) => ({
      settings: { ...s.settings, density },
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
        revisionsByEstimateId: normalized.revisionsByEstimateId ?? {},
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
      revisionsByEstimateId: p.revisionsByEstimateId ?? {},
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
