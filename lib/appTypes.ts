import type { Estimate, LineType } from "./estimateTypes";
import type { AssemblyLineSeed } from "./assemblies";

export const APP_SCHEMA_VERSION = 4 as const;

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

/** User-defined kit; same shape as built-in assemblies. */
export type CustomAssemblyDefinition = {
  id: string;
  name: string;
  description: string;
  lines: AssemblyLineSeed[];
};

/** Company identity for print, exports, and client HTML */
export type WorkspaceBranding = {
  companyName: string;
  companyTagline: string;
  /** Payment terms, warranty, exclusions — shown on client view and printable exports */
  proposalTerms: string;
  /** Optional logo as data URL (keep images small) */
  logoDataUrl: string;
  /** Contractor license # (shown on client export) */
  contractorLicense?: string;
  /** GL / WC summary line */
  insuranceSummary?: string;
  /** Intro line above signature / acceptance block */
  acceptanceIntro?: string;
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

/** First-run checklist (replaces single-modal flow over time). */
export type OnboardingChecklistState = {
  namedProject: boolean;
  addedDetailLine: boolean;
  reviewedTotals: boolean;
  exportedOrBackup: boolean;
};

export type AppUiState = {
  lineFilter: string;
  collapsedLineIds: string[];
  /** First-run overlay dismissed */
  onboardingComplete: boolean;
  /** Optional structured onboarding */
  onboardingChecklist: OnboardingChecklistState;
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
  /** Saved user kits (merge with built-ins in UI). */
  customAssemblies?: CustomAssemblyDefinition[];
  /** Monotonic clock for conflict-aware restore (ms). */
  lastModifiedMs?: number;
  /** Logical generation for same-ms edge cases */
  persistGeneration?: number;
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

export const defaultOnboardingChecklist: OnboardingChecklistState = {
  namedProject: false,
  addedDetailLine: false,
  reviewedTotals: false,
  exportedOrBackup: false,
};

export const defaultUiState: AppUiState = {
  lineFilter: "",
  collapsedLineIds: [],
  onboardingComplete: false,
  onboardingChecklist: { ...defaultOnboardingChecklist },
};
