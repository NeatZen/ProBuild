import type { DensityMode } from "./appTypes";

export type DensityClasses = {
  /** Main content area top padding */
  shellMainPt: string;
  /** Main content bottom padding (space for sticky totals) */
  shellMainPb: string;
  revisionSectionMt: string;
  validationBannerMb: string;
  emptyTipsMt: string;
  lineSectionMt: string;
  lineStackGap: string;
  lineCountBadge: string;
  /** Primary cards (project details, etc.) */
  cardPad: string;
  /** Secondary cards (revisions, tips) */
  cardPadTight: string;
  appFooterMt: string;
  headerShellPy: string;
  headerShellGap: string;
  searchBarMt: string;
  searchBarPad: string;
  searchBarInnerGap: string;
  /** Column gap in search bar (find lines vs controls) */
  searchBarStackGap: string;
  /** Row of currency / locale / density */
  searchBarControlsGap: string;
  toolbarMt: string;
  toolbarWellPad: string;
  /** Line item article padding */
  lineItemPad: string;
  lineItemFieldGap: string;
  lineItemCollapsedPad: string;
  lineLabelChip: string;
  totalsAsideMaxH: string;
  totalsScrollPadding: string;
  totalsSectionTitlePb: string;
  grandTotalStackMt: string;
  dockSafeBottom: string;
  workspaceDataBtnH: string;
  /** Extra classes for form controls (line items, search) */
  formFieldMinH: string;
  /** Totals dock numeric inputs — keep ≥44px on comfortable for touch */
  dockFieldMinH: string;
};

const comfortable: DensityClasses = {
  shellMainPt: "pt-7 sm:pt-8",
  shellMainPb:
    "pb-[calc(min(42vh,20rem)+env(safe-area-inset-bottom,0px)+1rem)] sm:pb-14",
  revisionSectionMt: "mt-5",
  validationBannerMb: "mb-5",
  emptyTipsMt: "mt-6",
  lineSectionMt: "mt-10",
  lineStackGap: "gap-5",
  lineCountBadge: "px-2.5 py-1 text-[11px]",
  cardPad: "p-5 sm:p-6",
  cardPadTight: "p-4 sm:p-5",
  appFooterMt: "mt-12",
  headerShellPy: "py-5 sm:py-6",
  headerShellGap: "gap-4 sm:gap-6",
  searchBarMt: "mt-5",
  searchBarPad: "p-4",
  searchBarInnerGap: "gap-3",
  searchBarStackGap: "gap-2.5 sm:gap-4",
  searchBarControlsGap: "gap-3 sm:gap-4",
  toolbarMt: "mt-7",
  toolbarWellPad: "p-1.5",
  lineItemPad: "p-5 sm:p-6",
  lineItemFieldGap: "gap-4",
  lineItemCollapsedPad: "p-4",
  lineLabelChip: "px-2.5 py-1 text-[11px]",
  totalsAsideMaxH: "max-h-[min(42vh,20rem)]",
  totalsScrollPadding: "px-3 py-3 sm:p-6 sm:pb-6",
  totalsSectionTitlePb: "pb-2 sm:pb-4",
  grandTotalStackMt: "mt-2 sm:mt-4",
  dockSafeBottom: "max-sm:pb-[max(0.35rem,env(safe-area-inset-bottom))]",
  workspaceDataBtnH: "min-h-9",
  formFieldMinH: "min-h-11 max-sm:min-h-10",
  dockFieldMinH: "min-h-[44px] max-sm:min-h-[44px]",
};

const compact: DensityClasses = {
  shellMainPt: "pt-5 sm:pt-6",
  shellMainPb:
    "pb-[calc(min(34vh,16rem)+env(safe-area-inset-bottom,0px)+0.75rem)] sm:pb-10",
  revisionSectionMt: "mt-3",
  validationBannerMb: "mb-3",
  emptyTipsMt: "mt-4",
  lineSectionMt: "mt-6",
  lineStackGap: "gap-3",
  lineCountBadge: "px-2 py-0.5 text-[10px]",
  cardPad: "p-4 sm:p-4",
  cardPadTight: "p-3 sm:p-3.5",
  appFooterMt: "mt-8",
  headerShellPy: "py-4 sm:py-5",
  headerShellGap: "gap-3 sm:gap-5",
  searchBarMt: "mt-3",
  searchBarPad: "p-3",
  searchBarInnerGap: "gap-2",
  searchBarStackGap: "gap-2 sm:gap-3",
  searchBarControlsGap: "gap-2 sm:gap-3",
  toolbarMt: "mt-5",
  toolbarWellPad: "p-1",
  lineItemPad: "p-4 sm:p-4",
  lineItemFieldGap: "gap-3",
  lineItemCollapsedPad: "p-3",
  lineLabelChip: "px-2 py-0.5 text-[10px]",
  totalsAsideMaxH: "max-h-[min(34vh,16rem)]",
  totalsScrollPadding: "px-3 py-2.5 sm:p-4 sm:pb-4",
  totalsSectionTitlePb: "pb-1.5 sm:pb-3",
  grandTotalStackMt: "mt-1.5 sm:mt-3",
  dockSafeBottom: "max-sm:pb-[max(0.25rem,env(safe-area-inset-bottom))]",
  workspaceDataBtnH: "min-h-8",
  formFieldMinH: "min-h-10 max-sm:min-h-10",
  dockFieldMinH: "min-h-10 sm:min-h-11",
};

export function densityClasses(mode: DensityMode): DensityClasses {
  return mode === "compact" ? compact : comfortable;
}
