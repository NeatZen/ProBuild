"use client";

import { useDensityClasses } from "@/hooks/useDensityClasses";

export function AppFooterNotes() {
  const d = useDensityClasses();
  return (
    <footer
      className={`print-hide border-t border-stone-200/50 pt-6 text-xs leading-relaxed text-stone-500 ${d.appFooterMt}`}
    >
      <p>
        Amounts round to two decimals. Line subtotal receives optional per-category markups, then global markup,
        overhead on that subtotal, a flat bond/insurance add-on, tax on the pretax subtotal, and retention shown as a
        hold against net due.
      </p>
      <p className="mt-2">
        <span className="font-medium text-stone-600">Shortcuts:</span>{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">⌘/Ctrl</kbd>{" "}
        +{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">N</kbd> add line ·{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">Esc</kbd> clear line
        search. On touch devices, swipe left on an expanded line to delete (with confirmation).{" "}
        <span className="font-medium text-stone-600">Layout</span> (under the search bar) switches Comfortable vs
        Compact spacing.
      </p>
      <p className="mt-3 text-stone-400">
        Offline-first: data stays in this browser until you export it. Sign-in and cloud sync can be added later if
        you want multi-device workflows.
      </p>
    </footer>
  );
}
