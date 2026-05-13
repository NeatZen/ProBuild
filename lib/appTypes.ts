import type { Estimate } from "./estimateTypes";

export const APP_SCHEMA_VERSION = 2 as const;

/** Point-in-time snapshot of an estimate for local revision history. */
export type EstimateRevision = {
  id: string;
  createdAt: string;
  note: string;
  payload: Estimate;
};

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

export type DensityMode = "comfortable" | "compact";

export type AppSettings = {
  currency: CurrencyCode;
  /** BCP 47 locale for number formatting */
  locale: string;
  /** Vertical rhythm: tighter spacing and smaller targets in compact mode */
  density: DensityMode;
};

export type AppUiState = {
  lineFilter: string;
  collapsedLineIds: string[];
};

export type AppPersist = {
  version: typeof APP_SCHEMA_VERSION;
  estimates: Estimate[];
  activeEstimateId: string;
  settings: AppSettings;
  ui?: Partial<Pick<AppUiState, "lineFilter" | "collapsedLineIds">>;
  /** Local snapshots keyed by estimate id. */
  revisionsByEstimateId?: Record<string, EstimateRevision[]>;
};

export type SaveStatus = "idle" | "pending" | "saved" | "error";

export const defaultSettings: AppSettings = {
  currency: "USD",
  locale: "en-US",
  density: "comfortable",
};

export const defaultUiState: AppUiState = {
  lineFilter: "",
  collapsedLineIds: [],
};
