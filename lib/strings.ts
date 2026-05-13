/** Minimal string table for future i18n; swap `locale` to load alternate tables. */
export const stringsEn = {
  appTitle: "Construction estimate",
  workspaceLabel: "Estimate workspace",
  tagline: "Line items, categories, and totals—saved on this device as you work.",
  checklistTitle: "Getting started",
} as const;

export type Strings = typeof stringsEn;

export function getStrings(_locale: string): Strings {
  void _locale;
  return stringsEn;
}
