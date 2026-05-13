import type { Estimate, LineType } from "./estimateTypes";

export const APP_SCHEMA_VERSION = 3 as const;

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

/** Company identity for print, exports, and client HTML */
export type WorkspaceBranding = {
  companyName: string;
  companyTagline: string;
  /** Payment terms, warranty, exclusions — shown on client view and printable exports */
  proposalTerms: string;
  /** Optional logo as data URL (keep images small) */
  logoDataUrl: string;
};

/** User-saved line presets (beyond built-in templates) */
export type SavedLineTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  lineType: LineType;
};

export type AppUiState = {
  lineFilter: string;
  collapsedLineIds: string[];
  /** First-run overlay dismissed */
  onboardingComplete: boolean;
};

export type AppPersist = {
  version: number;
  estimates: Estimate[];
  activeEstimateId: string;
  settings: AppSettings;
  ui?: Partial<AppUiState>;
  /** Local snapshots keyed by estimate id. */
  revisionsByEstimateId?: Record<string, EstimateRevision[]>;
  branding?: WorkspaceBranding;
  savedLineLibrary?: SavedLineTemplate[];
};

export type SaveStatus = "idle" | "pending" | "saved" | "error";

export const defaultSettings: AppSettings = {
  currency: "USD",
  locale: "en-US",
  density: "comfortable",
};

export const defaultBranding: WorkspaceBranding = {
  companyName: "",
  companyTagline: "",
  proposalTerms: "",
  logoDataUrl: "",
};

export const defaultUiState: AppUiState = {
  lineFilter: "",
  collapsedLineIds: [],
  onboardingComplete: false,
};
