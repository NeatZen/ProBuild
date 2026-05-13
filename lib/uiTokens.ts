/** Shared Tailwind class strings for a consistent ProBuild look. */

export const labelClass =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500/90";

export const labelClassCompact =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500/90 sm:text-[11px] sm:tracking-[0.12em]";

export const inputClass =
  [
    "mt-1.5 w-full min-h-11 rounded-xl border border-stone-200/90 bg-white/[0.88] px-3.5 py-2.5 text-base text-stone-900",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] shadow-sm shadow-stone-900/[0.04]",
    "outline-none transition duration-150 ease-out",
    "placeholder:text-stone-400/85",
    "focus-visible:border-teal-400/95 focus-visible:bg-white",
    "focus-visible:shadow-[inset_0_1px_0_#fff,0_0_0_3px_rgba(20,184,166,0.16)]",
    "max-sm:mt-1 max-sm:min-h-9 max-sm:rounded-lg max-sm:px-2.5 max-sm:py-1.5 max-sm:text-sm",
  ].join(" ");

export const cardSurface =
  [
    "rounded-2xl border border-stone-200/55 bg-white/[0.68]",
    "shadow-[0_1px_0_rgba(255,255,255,0.88)_inset,0_22px_56px_-34px_rgba(28,25,23,0.2)]",
    "ring-1 ring-white/45 backdrop-blur-md",
  ].join(" ");

/** Sticky totals dock: top-rounded on mobile, full card from `sm`. */
export const cardSurfaceDock =
  [
    "rounded-t-2xl rounded-b-none border border-stone-200/55 border-b-0 bg-white/[0.68]",
    "shadow-[0_1px_0_rgba(255,255,255,0.88)_inset,0_22px_56px_-34px_rgba(28,25,23,0.2)]",
    "ring-1 ring-white/45 backdrop-blur-md sm:rounded-2xl sm:border-b",
  ].join(" ");

export const cardSurfaceElevated =
  [
    cardSurface,
    "transition duration-200 ease-out",
    "hover:border-stone-300/70 hover:shadow-[0_1px_0_rgba(255,255,255,0.92)_inset,0_28px_70px_-36px_rgba(15,118,110,0.18)]",
  ].join(" ");
