import { create } from "zustand";

import type {
  AppPersist,
  AppSettings,
  AppUiState,
  CurrencyCode,
  CustomAssemblyDefinition,
  DensityMode,
  EstimateRevision,
  OnboardingChecklistState,
  SavedLineTemplate,
  SaveStatus,
  WorkspaceBranding,
} from "@/lib/appTypes";
import {
  APP_SCHEMA_VERSION,
  defaultBranding,
  defaultOnboardingChecklist,
  defaultSettings,
  defaultUiState,
} from "@/lib/appTypes";
import type { AssemblyDefinition } from "@/lib/assemblies";
import { ASSEMBLIES } from "@/lib/assemblies";
import { parseEstimateCsv } from "@/lib/csvImport";
import { normalizeEstimate } from "@/lib/estimateNormalize";
import type {
  CategoryMarkup,
  Estimate,
  EstimateSection,
  LineItem,
  LineType,
  MarkupMode,
  MarkupTier,
  TaxScope,
} from "@/lib/estimateTypes";
import {
  createDefaultEstimate,
  createEmptyLineItem,
  inferLineTypeFromCategory,
  resetEstimateInPlace,
} from "@/lib/estimateTypes";
import { idbClearApp, idbReadApp } from "@/lib/idbApp";
import { LINE_TEMPLATES } from "@/lib/lineTemplates";
import {
  clearAllAppStorage,
  createDefaultAppPersist,
  loadOrCreateAppPersist,
  normalizeAppPersist,
  parsePersistJsonString,
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

function defaultSectionId(e: Estimate): string {
  return e.sections[0]?.id ?? "";
}

function resolveSectionFromHint(e: Estimate, hint: string): string {
  const t = hint.trim().toLowerCase();
  if (!t) return defaultSectionId(e);
  const hit = e.sections.find((s) => s.label.trim().toLowerCase() === t);
  if (hit) return hit.id;
  const partial = e.sections.find((s) => s.label.trim().toLowerCase().includes(t));
  return partial?.id ?? defaultSectionId(e);
}

function lineFromSeed(
  row: {
    description: string;
    category: string;
    quantity: number;
    unit: string;
    unitCost: number;
    lineType?: LineType;
  },
  sectionId: string,
  kit?: { kitId: string; kitName: string },
): LineItem {
  return {
    id: newId(),
    description: row.description,
    category: row.category,
    quantity: row.quantity,
    unit: row.unit,
    unitCost: row.unitCost,
    lineType: row.lineType ?? inferLineTypeFromCategory(row.category),
    sectionId,
    kitId: kit?.kitId,
    kitName: kit?.kitName,
  };
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

function assemblyCatalog(s: ProBuildState): AssemblyDefinition[] {
  return [...ASSEMBLIES, ...s.customAssemblies];
}

function cloneEstimate(source: Estimate): Estimate {
  const newSections: EstimateSection[] = source.sections.map((s) => ({
    ...s,
    id: newId(),
  }));
  const oldToNew = new Map<string, string>();
  source.sections.forEach((s, i) => {
    oldToNew.set(s.id, newSections[i].id);
  });
  const lines = remapKitIds(source.lines).map((row) => ({
    ...row,
    sectionId: oldToNew.get(row.sectionId) ?? newSections[0].id,
  }));
  return {
    ...source,
    id: newId(),
    version: source.version,
    categoryMarkups: source.categoryMarkups.map((r) => ({ ...r })),
    sections: newSections,
    lines,
    projectName: source.projectName.trim()
      ? `${source.projectName.trim()} (copy)`
      : "Untitled copy",
  };
}

export type UndoEntry = {
  id: string;
  label: string;
  snapshot: string;
};

export type PersistMeta = {
  lastModifiedMs: number;
  persistGeneration: number;
};

export type ProBuildState = {
  estimates: Estimate[];
  activeEstimateId: string;
  revisionsByEstimateId: Record<string, EstimateRevision[]>;
  settings: AppSettings;
  ui: AppUiState;
  branding: WorkspaceBranding;
  savedLineLibrary: SavedLineTemplate[];
  /** User-defined assemblies merged with built-ins. */
  customAssemblies: CustomAssemblyDefinition[];
  persistMeta: PersistMeta;
  /** True when another tab/device likely wrote newer data (localStorage event). */
  storageConflictWarning: boolean;
  undoStack: UndoEntry[];
  saveStatus: SaveStatus;
  saveErrorMessage: string | null;
  hydrated: boolean;

  clearStorageConflictWarning: () => void;
  hydrateFromStorage: () => void;
  setProjectName: (v: string) => void;
  setClientNotes: (v: string) => void;
  setMarkupPercent: (v: number) => void;
  setMarkupMode: (m: MarkupMode) => void;
  setMarkupTiers: (rows: MarkupTier[]) => void;
  setTaxPercent: (v: number) => void;
  setTaxScope: (scope: TaxScope) => void;
  setJurisdictionLabel: (v: string) => void;
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

  setBranding: (patch: Partial<WorkspaceBranding>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setOnboardingChecklist: (patch: Partial<OnboardingChecklistState>) => void;

  upsertCustomAssembly: (def: CustomAssemblyDefinition) => void;
  removeCustomAssembly: (id: string) => void;

  addAlternateSection: () => void;
  setSectionLabel: (sectionId: string, label: string) => void;
  setSectionSchedule: (sectionId: string, startDate: string, endDate: string) => void;
  removeSection: (sectionId: string) => void;

  saveLineToLibrary: (lineId: string, name: string) => void;
  removeSavedLibraryItem: (templateId: string) => void;
  insertSavedLibraryItem: (templateId: string) => void;

  pushActiveUndo: (label: string) => void;
  undoLast: () => void;

  importCsvText: (text: string) => { ok: boolean; error?: string; imported?: number };

  importPersistJson: (
    json: string,
    options?: { force?: boolean },
  ) => { ok: boolean; error?: string; staleBackup?: boolean };
  exportPersistJson: () => string;
  exportActiveEstimateJson: () => string;
  clearAllData: () => void;
};

const MAX_UNDO = 12;

export function persistSnapshot(state: ProBuildState): AppPersist {
  return normalizeAppPersist({
    version: APP_SCHEMA_VERSION,
    estimates: state.estimates.map((e) => normalizeEstimate(e)),
    activeEstimateId: activeIdOf(state),
    settings: state.settings,
    ui: {
      lineFilter: state.ui.lineFilter,
      collapsedLineIds: state.ui.collapsedLineIds,
      onboardingComplete: state.ui.onboardingComplete,
      onboardingChecklist: state.ui.onboardingChecklist,
    },
    revisionsByEstimateId: state.revisionsByEstimateId,
    branding: state.branding,
    savedLineLibrary: state.savedLineLibrary,
    customAssemblies: state.customAssemblies,
    lastModifiedMs: state.persistMeta.lastModifiedMs,
    persistGeneration: state.persistMeta.persistGeneration,
  });
}

function pushUndo(s: ProBuildState, label: string): Pick<ProBuildState, "undoStack"> {
  const cur = normalizeEstimate(getActive(s.estimates, activeIdOf(s)));
  const snapshot = JSON.stringify(cur);
  const entry: UndoEntry = { id: newId(), label, snapshot };
  const undoStack = [entry, ...s.undoStack].slice(0, MAX_UNDO);
  return { undoStack };
}

const seed = createDefaultAppPersist();
const seedMeta: PersistMeta = {
  lastModifiedMs: seed.lastModifiedMs ?? Date.now(),
  persistGeneration: seed.persistGeneration ?? 1,
};

export const useProBuildStore = create<ProBuildState>((set, get) => ({
  estimates: seed.estimates,
  activeEstimateId: seed.activeEstimateId,
  revisionsByEstimateId: seed.revisionsByEstimateId ?? {},
  settings: { ...defaultSettings, ...seed.settings },
  ui: { ...defaultUiState, ...seed.ui },
  branding: { ...defaultBranding, ...seed.branding },
  savedLineLibrary: seed.savedLineLibrary ?? [],
  customAssemblies: seed.customAssemblies ?? [],
  persistMeta: seedMeta,
  storageConflictWarning: false,
  undoStack: [],
  saveStatus: "idle",
  saveErrorMessage: null,
  hydrated: false,

  clearStorageConflictWarning: () => set({ storageConflictWarning: false }),
  hydrateFromStorage: () => {
    if (get().hydrated) return;
    const p = loadOrCreateAppPersist();
    const n = normalizeAppPersist(p);
    const skipTour =
      typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).has("skipTour") ||
        process.env.NEXT_PUBLIC_E2E === "1");
    const checklist = {
      ...defaultOnboardingChecklist,
      ...(n.ui?.onboardingChecklist ?? {}),
    };
    set({
      estimates: n.estimates,
      activeEstimateId: n.activeEstimateId,
      revisionsByEstimateId: n.revisionsByEstimateId ?? {},
      settings: { ...defaultSettings, ...n.settings },
      ui: {
        lineFilter: n.ui?.lineFilter ?? "",
        collapsedLineIds: n.ui?.collapsedLineIds ?? [],
        onboardingComplete: skipTour ? true : Boolean(n.ui?.onboardingComplete),
        onboardingChecklist: checklist,
      },
      branding: { ...defaultBranding, ...n.branding },
      savedLineLibrary: n.savedLineLibrary ?? [],
      customAssemblies: n.customAssemblies ?? [],
      persistMeta: {
        lastModifiedMs: n.lastModifiedMs ?? 0,
        persistGeneration: n.persistGeneration ?? 0,
      },
      hydrated: true,
    });

    if (typeof window !== "undefined") {
      void (async () => {
        try {
          const raw = await idbReadApp();
          if (!raw) return;
          const fromIdb = parsePersistJsonString(raw);
          if (!fromIdb) return;
          const fromLs = normalizeAppPersist(p);
          const lsMs = fromLs.lastModifiedMs ?? 0;
          const idbMs = fromIdb.lastModifiedMs ?? 0;
          const idbNewer =
            idbMs > lsMs ||
            (idbMs === lsMs && (fromIdb.persistGeneration ?? 0) > (fromLs.persistGeneration ?? 0));
          if (!idbNewer) return;
          const m = normalizeAppPersist(fromIdb);
          const cl = {
            ...defaultOnboardingChecklist,
            ...(m.ui?.onboardingChecklist ?? {}),
          };
          if (!get().hydrated) return;
          set({
            estimates: m.estimates,
            activeEstimateId: m.activeEstimateId,
            revisionsByEstimateId: m.revisionsByEstimateId ?? {},
            settings: { ...defaultSettings, ...m.settings },
            ui: {
              lineFilter: m.ui?.lineFilter ?? "",
              collapsedLineIds: m.ui?.collapsedLineIds ?? [],
              onboardingComplete: Boolean(m.ui?.onboardingComplete),
              onboardingChecklist: cl,
            },
            branding: { ...defaultBranding, ...m.branding },
            savedLineLibrary: m.savedLineLibrary ?? [],
            customAssemblies: m.customAssemblies ?? [],
            persistMeta: {
              lastModifiedMs: m.lastModifiedMs ?? 0,
              persistGeneration: m.persistGeneration ?? 0,
            },
          });
        } catch {
          // ignore IndexedDB read errors
        }
      })();
    }
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

  setMarkupMode: (markupMode) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        markupMode,
        markupTiers:
          markupMode === "flat" ? [] : e.markupTiers?.length ? e.markupTiers : [{ upto: null, percent: e.markupPercent }],
      })),
    })),

  setMarkupTiers: (markupTiers) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        markupTiers: markupTiers.map((t) => ({
          upto: t.upto,
          percent: Number.isFinite(Number(t.percent)) ? Number(t.percent) : 0,
        })),
        markupMode: "tiered",
      })),
    })),

  setTaxPercent: (taxPercent) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, taxPercent })),
    })),

  setTaxScope: (taxScope) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, taxScope })),
    })),

  setJurisdictionLabel: (jurisdictionLabel) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({ ...e, jurisdictionLabel })),
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
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const sid = defaultSectionId(e);
        return {
          ...e,
          lines: [...e.lines, createEmptyLineItem(newId(), sid)],
        };
      }),
    })),

  removeLine: (lineId) =>
    set((s) => {
      const u = pushUndo(s, "Removed line");
      return {
        ...s,
        ...u,
        estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
          const lines = e.lines.filter((row) => row.id !== lineId);
          if (lines.length === 0) {
            return {
              ...e,
              lines: [createEmptyLineItem(newId(), defaultSectionId(e))],
            };
          }
          return { ...e, lines };
        }),
      };
    }),

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
          lineType: prev.lineType,
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
      const u = pushUndo(s, "Cleared workspace");
      return {
        ...s,
        ...u,
        estimates: s.estimates.map((e) => (e.id === id ? resetEstimateInPlace(e.id) : e)),
        ui: { ...s.ui, collapsedLineIds: [] },
        revisionsByEstimateId: { ...s.revisionsByEstimateId, [id]: [] },
      };
    }),

  insertTemplate: (templateId) => {
    const t = LINE_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    set((s) => {
      const u = pushUndo(s, `Inserted template · ${t.name}`);
      return {
        ...s,
        ...u,
        estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
          const sid = defaultSectionId(e);
          const added = t.lines.map((row) => lineFromSeed(row, sid));
          return { ...e, lines: [...e.lines, ...added] };
        }),
      };
    });
  },

  insertAssembly: (assemblyId) => {
    const def = assemblyCatalog(get()).find((x) => x.id === assemblyId);
    if (!def) return;
    const kitId = newId();
    set((s) => {
      const u = pushUndo(s, `Inserted assembly · ${def.name}`);
      return {
        ...s,
        ...u,
        estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
          const sid = defaultSectionId(e);
          const added = def.lines.map((row) =>
            lineFromSeed(row, sid, { kitId, kitName: def.name }),
          );
          return { ...e, lines: [...e.lines, ...added] };
        }),
      };
    });
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
      const u = pushUndo(s, "Before restoring snapshot");
      const restored = normalizeEstimate(rev.payload);
      const merged: Estimate = { ...restored, id };
      return {
        ...s,
        ...u,
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

  setBranding: (patch) =>
    set((s) => ({
      branding: { ...s.branding, ...patch },
    })),

  setOnboardingComplete: (complete) =>
    set((s) => ({
      ui: { ...s.ui, onboardingComplete: complete },
    })),

  setOnboardingChecklist: (patch) =>
    set((s) => ({
      ui: {
        ...s.ui,
        onboardingChecklist: {
          ...defaultOnboardingChecklist,
          ...s.ui.onboardingChecklist,
          ...patch,
        },
      },
    })),

  upsertCustomAssembly: (def) =>
    set((s) => {
      const next = s.customAssemblies.filter((x) => x.id !== def.id);
      return {
        customAssemblies: [{ ...def, id: def.id.trim() || newId() }, ...next].slice(0, 200),
      };
    }),

  removeCustomAssembly: (id) =>
    set((s) => ({
      customAssemblies: s.customAssemblies.filter((x) => x.id !== id),
    })),

  addAlternateSection: () =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        const n = e.sections.filter((x) => x.kind === "alternate").length;
        const id = newId();
        const label = `Alternate ${String.fromCharCode(65 + n)}`;
        return { ...e, sections: [...e.sections, { id, label, kind: "alternate" }] };
      }),
    })),

  setSectionLabel: (sectionId, label) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        sections: e.sections.map((sec) => (sec.id === sectionId ? { ...sec, label } : sec)),
      })),
    })),

  setSectionSchedule: (sectionId, startDate, endDate) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => ({
        ...e,
        sections: e.sections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                startDate: startDate.trim() || undefined,
                endDate: endDate.trim() || undefined,
              }
            : sec,
        ),
      })),
    })),

  removeSection: (sectionId) =>
    set((s) => ({
      estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
        if (e.sections.length <= 1) return e;
        const primary = e.sections[0].id;
        if (sectionId === primary) return e;
        if (!e.sections.some((x) => x.id === sectionId)) return e;
        return {
          ...e,
          lines: e.lines.map((l) => (l.sectionId === sectionId ? { ...l, sectionId: primary } : l)),
          sections: e.sections.filter((sec) => sec.id !== sectionId),
        };
      }),
    })),

  saveLineToLibrary: (lineId, name) =>
    set((s) => {
      const e = getActive(s.estimates, s.activeEstimateId);
      const row = e.lines.find((l) => l.id === lineId);
      if (!row) return s;
      const item: SavedLineTemplate = {
        id: newId(),
        name: name.trim() || row.description.trim() || "Saved line",
        description: row.description,
        category: row.category,
        quantity: row.quantity,
        unit: row.unit,
        unitCost: row.unitCost,
        lineType: row.lineType,
      };
      return {
        savedLineLibrary: [item, ...s.savedLineLibrary].slice(0, 800),
      };
    }),

  removeSavedLibraryItem: (templateId) =>
    set((s) => ({
      savedLineLibrary: s.savedLineLibrary.filter((x) => x.id !== templateId),
    })),

  insertSavedLibraryItem: (templateId) => {
    set((s) => {
      const seedRow = s.savedLineLibrary.find((x) => x.id === templateId);
      if (!seedRow) return s;
      const u = pushUndo(s, `From library · ${seedRow.name}`);
      return {
        ...s,
        ...u,
        estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
          const sid = defaultSectionId(e);
          const line = lineFromSeed(
            {
              description: seedRow.description,
              category: seedRow.category,
              quantity: seedRow.quantity,
              unit: seedRow.unit,
              unitCost: seedRow.unitCost,
              lineType: seedRow.lineType,
            },
            sid,
          );
          return { ...e, lines: [...e.lines, line] };
        }),
      };
    });
  },

  pushActiveUndo: (label) => set((s) => ({ ...s, ...pushUndo(s, label) })),

  undoLast: () =>
    set((s) => {
      const entry = s.undoStack[0];
      if (!entry) return s;
      const id = activeIdOf(s);
      let restored: Estimate;
      try {
        restored = normalizeEstimate(JSON.parse(entry.snapshot) as unknown);
      } catch {
        return { ...s, undoStack: s.undoStack.slice(1) };
      }
      const merged: Estimate = { ...restored, id };
      return {
        estimates: s.estimates.map((e) => (e.id === id ? merged : e)),
        undoStack: s.undoStack.slice(1),
      };
    }),

  importCsvText: (text) => {
    const parsed = parseEstimateCsv(text);
    if (parsed.lines.length === 0) {
      return { ok: false, error: parsed.errors[0] ?? "Nothing to import." };
    }
    const imported = parsed.lines.length;
    set((s) => {
      const u = pushUndo(s, "Imported CSV lines");
      return {
        ...s,
        ...u,
        estimates: mapActive(s.estimates, s.activeEstimateId, (e) => {
          const newLines: LineItem[] = parsed.lines.map((seed) => {
            const sid = resolveSectionFromHint(e, seed.sectionLabelHint);
            return lineFromSeed(seed, sid);
          });
          return { ...e, lines: [...e.lines, ...newLines] };
        }),
      };
    });
    return { ok: true, imported };
  },

  importPersistJson: (json, options) => {
    try {
      const normalized = parsePersistJsonString(json);
      if (!normalized) {
        return { ok: false, error: "Unrecognized backup format (expected app v2–v4)." };
      }
      const cur = get().persistMeta;
      const backupMs = normalized.lastModifiedMs ?? 0;
      const backupGen = normalized.persistGeneration ?? 0;
      const backupIsOlder =
        backupMs < cur.lastModifiedMs ||
        (backupMs === cur.lastModifiedMs && backupGen < cur.persistGeneration);
      if (backupIsOlder && !options?.force) {
        return {
          ok: false,
          error: "This backup is older than your current workspace.",
          staleBackup: true,
        };
      }
      const cl = {
        ...defaultOnboardingChecklist,
        ...(normalized.ui?.onboardingChecklist ?? {}),
      };
      set({
        estimates: normalized.estimates,
        activeEstimateId: normalized.activeEstimateId,
        revisionsByEstimateId: normalized.revisionsByEstimateId ?? {},
        settings: { ...defaultSettings, ...normalized.settings },
        ui: {
          lineFilter: normalized.ui?.lineFilter ?? "",
          collapsedLineIds: normalized.ui?.collapsedLineIds ?? [],
          onboardingComplete: Boolean(normalized.ui?.onboardingComplete),
          onboardingChecklist: cl,
        },
        branding: { ...defaultBranding, ...normalized.branding },
        savedLineLibrary: normalized.savedLineLibrary ?? [],
        customAssemblies: normalized.customAssemblies ?? [],
        persistMeta: {
          lastModifiedMs: normalized.lastModifiedMs ?? Date.now(),
          persistGeneration: normalized.persistGeneration ?? 1,
        },
        undoStack: [],
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
    void idbClearApp();
    clearAllAppStorage();
    const p = createDefaultAppPersist();
    set({
      estimates: p.estimates,
      activeEstimateId: p.activeEstimateId,
      revisionsByEstimateId: p.revisionsByEstimateId ?? {},
      settings: p.settings,
      ui: { ...defaultUiState },
      branding: p.branding ? { ...defaultBranding, ...p.branding } : { ...defaultBranding },
      savedLineLibrary: p.savedLineLibrary ?? [],
      customAssemblies: p.customAssemblies ?? [],
      persistMeta: {
        lastModifiedMs: p.lastModifiedMs ?? Date.now(),
        persistGeneration: p.persistGeneration ?? 1,
      },
      undoStack: [],
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
