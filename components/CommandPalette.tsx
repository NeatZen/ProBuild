"use client";

import { useEffect, useState } from "react";

import { useProBuildStore } from "@/store/proBuildStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div
      className="print-hide fixed inset-0 z-[100] bg-stone-900/45"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div className="flex items-start justify-center p-4 pt-[12vh]" onClick={(e) => e.stopPropagation()}>
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Quick actions</p>
            <p className="text-[11px] text-stone-400">⌘K / Ctrl+K · Esc to close</p>
          </div>
          <div className="flex max-h-[min(60vh,420px)] flex-col gap-1 overflow-y-auto p-2">
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm hover:bg-stone-50"
              onClick={() => run(() => useProBuildStore.getState().addLine())}
            >
              Add line item
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm hover:bg-stone-50"
              onClick={() =>
                run(() => {
                  document.getElementById("totals-panel-start")?.focus();
                })
              }
            >
              Jump to totals
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm hover:bg-stone-50"
              onClick={() =>
                run(() => useProBuildStore.getState().setOnboardingChecklist({ reviewedTotals: true }))
              }
            >
              Mark “reviewed totals” checklist item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
