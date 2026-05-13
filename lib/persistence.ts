import type { Estimate } from "./estimateTypes";
import { ESTIMATE_SCHEMA_VERSION, createDefaultEstimate } from "./estimateTypes";

export const STORAGE_KEY = "probuild-estimate-v1";

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
    if (obj.version !== ESTIMATE_SCHEMA_VERSION) return null;
    if (typeof obj.id !== "string" || !Array.isArray(obj.lines)) return null;
    return data as Estimate;
  } catch {
    return null;
  }
}

export function loadFromStorage(): Estimate | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredEstimate(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveToStorage(estimate: Estimate): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeEstimate(estimate));
  } catch {
    // Quota or private mode — ignore
  }
}

export function clearStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hydrateOrDefault(): Estimate {
  const loaded = loadFromStorage();
  if (loaded) return loaded;
  return createDefaultEstimate();
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
