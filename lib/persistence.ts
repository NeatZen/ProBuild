import type { AppPersist, AppSettings, EstimateRevision } from "./appTypes";
import { APP_SCHEMA_VERSION, defaultSettings, defaultUiState, type CurrencyCode } from "./appTypes";
import { normalizeEstimate } from "./estimateNormalize";
import { createDefaultEstimate, type Estimate } from "./estimateTypes";

export const LEGACY_STORAGE_KEY = "probuild-estimate-v1";
export const APP_STORAGE_KEY = "probuild-app-v2";

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
    if (obj.version !== APP_SCHEMA_VERSION) return null;
    if (!Array.isArray(obj.estimates) || typeof obj.activeEstimateId !== "string") return null;
    return data as AppPersist;
  } catch {
    return null;
  }
}

export function migrateLegacyIfNeeded(): void {
  if (typeof window === "undefined") return;
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
  if (estimates.length === 0) {
    const e = createDefaultEstimate();
    return {
      version: APP_SCHEMA_VERSION,
      estimates: [e],
      activeEstimateId: e.id,
      settings: { ...defaultSettings, ...input.settings },
      ui: { ...defaultUiState, ...input.ui },
      revisionsByEstimateId: normalizeRevisionsMap(input.revisionsByEstimateId),
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
  return {
    version: APP_SCHEMA_VERSION,
    estimates,
    activeEstimateId,
    settings,
    ui: {
      lineFilter: input.ui?.lineFilter ?? "",
      collapsedLineIds: Array.isArray(input.ui?.collapsedLineIds)
        ? input.ui.collapsedLineIds
        : [],
    },
    revisionsByEstimateId: normalizeRevisionsMap(input.revisionsByEstimateId),
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
  };
}

export function loadAppPersistFromStorage(): AppPersist | null {
  if (typeof window === "undefined") return null;
  try {
    migrateLegacyIfNeeded();
    return parseAppPersist(window.localStorage.getItem(APP_STORAGE_KEY));
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

export function clearAllAppStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(APP_STORAGE_KEY);
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
