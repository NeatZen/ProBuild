"use client";

import { useProBuildStore } from "@/store/proBuildStore";

export function StorageConflictBanner() {
  const warn = useProBuildStore((s) => s.storageConflictWarning);
  const clear = useProBuildStore((s) => s.clearStorageConflictWarning);
  if (!warn) return null;
  return (
    <div
      role="alert"
      className="print-hide sticky top-0 z-[60] border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p>Your workspace may have been updated in another browser tab.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-amber-800/30 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          <button
            type="button"
            className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-semibold text-amber-900 underline"
            onClick={() => clear()}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
