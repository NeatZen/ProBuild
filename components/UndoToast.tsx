"use client";

import { useProBuildStore } from "@/store/proBuildStore";

export function UndoToast() {
  const entry = useProBuildStore((s) => s.undoStack[0]);
  const undoLast = useProBuildStore((s) => s.undoLast);

  if (!entry) return null;

  return (
    <div
      role="status"
      className="print-hide fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 z-[45] w-[min(92vw,22rem)] -translate-x-1/2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-lg sm:bottom-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-stone-700">{entry.label}</span>
        <button
          type="button"
          className="shrink-0 rounded-lg bg-teal-700 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-600"
          onClick={() => undoLast()}
        >
          Undo
        </button>
      </div>
    </div>
  );
}
