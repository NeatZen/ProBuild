import type {
  AppPersist,
  AppSettings,
  AppUiState,
  EstimateRevision,
  SavedLineTemplate,
  WorkspaceBranding,
} from "./appTypes";
import {
  APP_SCHEMA_VERSION,
  defaultBranding,
  defaultSettings,
  defaultUiState,
  type CurrencyCode,
  type DensityMode,
} from "./appTypes";
import type { LineType } from "./estimateTypes";
import { normalizeEstimate } from "./estimateNormalize";
import { createDefaultEstimate, type Estimate } from "./estimateTypes";

export const LEGACY_STORAGE_KEY = "probuild-estimate-v1";
export const APP_STORAGE_KEY = "probuild-app-v3";
export const APP_STORAGE_KEY_LEGACY = "probuild-app-v2";

export const DEBOUNCE_MS = 500;

export function serializeEstimate(estimate: Estimate): string {
  return JSON.stringify(estimate);
}

export function parseStoredEstimate(raw: string | null): Estimate | null {
  if (raw == null || raw === "") return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (typeof obj.id !== "string" || !Array.isArray(obj.lines)) return null;
    return normalizeEstimate(data);
  } catch {
    return null;
  }
}

function normalizeSavedLineLibrary(raw: unknown): SavedLineTemplate[] {
  if (!Array.isArray(raw)) return [];
  const allowed: LineType[] = [
    "labor",
    "material",
    "allowance",
    "subcontractor",
    "equipment",
    "other",
  ];
  const out: SavedLineTemplate[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || !o.id) continue;
    const name = typeof o.name === "string" ? o.name : "Saved line";
    const lt =
      typeof o.lineType === "string" && allowed.includes(o.lineType as LineType)
        ? (o.lineType as LineType)
        : "other";
    out.push({
      id: o.id,
      name,
      description: typeof o.description === "string" ? o.description : "",
      category: typeof o.category === "string" ? o.category : "",
      quantity: Number.isFinite(Number(o.quantity)) ? Number(o.quantity) : 1,
      unit: typeof o.unit === "string" ? o.unit : "ea",
      unitCost: Number.isFinite(Number(o.unitCost)) ? Number(o.unitCost) : 0,
      lineType: lt,
    });
  }
  return out.slice(0, 800);
}

function normalizeWorkspaceBranding(raw: unknown): WorkspaceBranding {
  if (!raw || typeof raw !== "object") return { ...defaultBranding };
  const o = raw as Record<string, unknown>;
  return {
    companyName: typeof o.companyName === "string" ? o.companyName : "",
    companyTagline: typeof o.companyTagline === "string" ? o.companyTagline : "",
    proposalTerms: typeof o.proposalTerms === "string" ? o.proposalTerms : "",
    logoDataUrl: typeof o.logoDataUrl === "string" ? o.logoDataUrl : "",
  };
}

function normalizeRevisionsMap(raw: unknown): Record<string, EstimateRevision[]> {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as Record<string, unknown>;
  const out: Record<string, EstimateRevision[]> = {};
  for (const [estimateId, list] of Object.entries(src)) {
    if (typeof estimateId !== "string" || !estimateId) continue;
    if (!Array.isArray(list)) continue;
    const revs: EstimateRevision[] = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.createdAt !== "string") continue;
      const note = typeof o.note === "string" ? o.note : "";
      const rawPayload = o.payload ?? o.estimate;
      revs.push({
        id: o.id,
        createdAt: o.createdAt,
        note,
        payload: normalizeEstimate(rawPayload),
      });
    }
    out[estimateId] = revs.slice(0, 40);
  }
  return out;
}

function parseAppPersist(raw: string | null): AppPersist | null {
  if (raw == null || raw === "") return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    const v = obj.version;
    if (v !== 2 && v !== 3) return null;
    if (!Array.isArray(obj.estimates) || typeof obj.activeEstimateId !== "string") return null;
    return data as AppPersist;
  } catch {
    return null;
  }
}

export function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(APP_STORAGE_KEY)) return;

  const legV2 = window.localStorage.getItem(APP_STORAGE_KEY_LEGACY);
  if (legV2) {
    const p = parseAppPersist(legV2);
    if (p) {
      const migrated = normalizeAppPersist(p);
      try {
        window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated));
      } catch {
        // ignore
      }
      return;
    }
  }

  if (window.localStorage.getItem(APP_STORAGE_KEY)) return;
  const legacy = parseStoredEstimate(window.localStorage.getItem(LEGACY_STORAGE_KEY));
  if (!legacy) return;
  const persist: AppPersist = {
    version: APP_SCHEMA_VERSION,
    estimates: [normalizeEstimate(legacy)],
    activeEstimateId: legacy.id,
    settings: { ...defaultSettings },
    ui: { ...defaultUiState },
    revisionsByEstimateId: {},
    branding: { ...defaultBranding },
    savedLineLibrary: [],
  };
  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(persist));
  } catch {
    // ignore
  }
}

export function normalizeAppPersist(input: AppPersist): AppPersist {
  const estimates = input.estimates
    .filter((e) => e && typeof e === "object" && Array.isArray((e as Estimate).lines))
    .map((e) => normalizeEstimate(e));
  const branding = normalizeWorkspaceBranding(input.branding);
  const savedLineLibrary = normalizeSavedLineLibrary(input.savedLineLibrary);

  const uiMerged: AppUiState = {
    lineFilter: input.ui?.lineFilter ?? "",
    collapsedLineIds: Array.isArray(input.ui?.collapsedLineIds) ? input.ui.collapsedLineIds : [],
    onboardingComplete: Boolean(input.ui?.onboardingComplete),
  };

  if (estimates.length === 0) {
    const e = createDefaultEstimate();
    const settings: AppSettings = { ...defaultSettings, ...input.settings };
    settings.density = settings.density === "compact" ? "compact" : "comfortable";
    return {
      version: APP_SCHEMA_VERSION,
      estimates: [e],
      activeEstimateId: e.id,
      settings,
      ui: uiMerged,
      revisionsByEstimateId: normalizeRevisionsMap(input.revisionsByEstimateId),
      branding,
      savedLineLibrary,
    };
  }
  const activeOk = estimates.some((e) => e.id === input.activeEstimateId);
  const activeEstimateId = activeOk ? input.activeEstimateId : estimates[0].id;
  const settings: AppSettings = {
    ...defaultSettings,
    ...input.settings,
  };
  const allowed: CurrencyCode[] = ["USD", "EUR", "GBP", "CAD", "AUD"];
  if (!allowed.includes(settings.currency)) {
    settings.currency = "USD";
  }
  const density: DensityMode = settings.density === "compact" ? "compact" : "comfortable";
  settings.density = density;
  return {
    version: APP_SCHEMA_VERSION,
    estimates,
    activeEstimateId,
    settings,
    ui: uiMerged,
    revisionsByEstimateId: normalizeRevisionsMap(input.revisionsByEstimateId),
    branding,
    savedLineLibrary,
  };
}

export function createDefaultAppPersist(): AppPersist {
  const e = createDefaultEstimate();
  return {
    version: APP_SCHEMA_VERSION,
    estimates: [e],
    activeEstimateId: e.id,
    settings: { ...defaultSettings },
    ui: { ...defaultUiState },
    revisionsByEstimateId: {},
    branding: { ...defaultBranding },
    savedLineLibrary: [],
  };
}

export function loadAppPersistFromStorage(): AppPersist | null {
  if (typeof window === "undefined") return null;
  try {
    migrateLegacyIfNeeded();
    const raw =
      window.localStorage.getItem(APP_STORAGE_KEY) ?? window.localStorage.getItem(APP_STORAGE_KEY_LEGACY);
    return parseAppPersist(raw);
  } catch {
    return null;
  }
}

export function loadOrCreateAppPersist(): AppPersist {
  const loaded = loadAppPersistFromStorage();
  if (loaded) return normalizeAppPersist(loaded);
  return createDefaultAppPersist();
}

export function saveAppPersistToStorage(persist: AppPersist): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(persist));
    return true;
  } catch {
    return false;
  }
}

/** Best-effort quota signal for UI (not persisted). */
export async function estimateStoragePressure(): Promise<"ok" | "high" | "unknown"> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return "unknown";
  try {
    const est = await navigator.storage.estimate();
    if (!est.usage || !est.quota || est.quota <= 0) return "unknown";
    const ratio = est.usage / est.quota;
    return ratio > 0.92 ? "high" : "ok";
  } catch {
    return "unknown";
  }
}

export function clearAllAppStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(APP_STORAGE_KEY);
    window.localStorage.removeItem(APP_STORAGE_KEY_LEGACY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout> | undefined;
  const wrapped = (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = undefined;
      fn(...args);
    }, ms);
  };
  return wrapped as T;
}
