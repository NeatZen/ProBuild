export const headingClass =
  "font-heading font-semibold tracking-tight text-stone-900";

/** Page title (hero) — slightly larger weight */
export const displayHeadingClass = "font-heading font-semibold tracking-tight text-stone-900";

export const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500";

export const labelClassCompact =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 sm:text-[11px] sm:tracking-[0.1em]";

export const inputClass =
  [
    "mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-base text-stone-900",
    "shadow-sm shadow-stone-900/[0.03]",
    "outline-none transition duration-150 ease-out",
    "placeholder:text-stone-400",
    "hover:border-stone-300",
    "focus-visible:border-teal-600/80 focus-visible:bg-white",
    "focus-visible:ring-2 focus-visible:ring-teal-600/15",
    "max-sm:mt-1 max-sm:rounded-md max-sm:px-3 max-sm:py-2 max-sm:text-sm",
  ].join(" ");

/** Primary content cards */
export const cardSurface =
  [
    "rounded-xl border border-stone-200 bg-white",
    "shadow-sm shadow-stone-900/[0.04]",
  ].join(" ");

/** Sticky totals dock: top-rounded on mobile, full card from `sm`. */
export const cardSurfaceDock =
  [
    "rounded-t-xl rounded-b-none border border-b-0 border-stone-200 bg-white",
    "shadow-sm shadow-stone-900/[0.06] sm:rounded-xl sm:border sm:shadow-md sm:shadow-stone-900/[0.06]",
  ].join(" ");

export const cardSurfaceElevated =
  [
    cardSurface,
    "transition duration-200 ease-out",
    "hover:border-stone-300 hover:shadow-md hover:shadow-stone-900/[0.05]",
  ].join(" ");

export const toolbarWellFrame =
  "rounded-xl border border-stone-200 bg-stone-50/80 shadow-sm shadow-stone-900/[0.03]";

export const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold uppercase tracking-wide text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100/80";
