"use client";

import { useProBuildStore } from "@/store/proBuildStore";

export function SaveStatusBadge() {
  const saveStatus = useProBuildStore((s) => s.saveStatus);
  const saveErrorMessage = useProBuildStore((s) => s.saveErrorMessage);

  if (saveStatus === "idle") {
    return null;
  }

  const base =
    "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide";

  if (saveStatus === "pending") {
    return (
      <span className={`${base} border border-amber-200/80 bg-amber-50/90 text-amber-900`}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-600" aria-hidden />
        Saving…
      </span>
    );
  }

  if (saveStatus === "saved") {
    return (
      <span className={`${base} border border-teal-200/80 bg-teal-50/90 text-teal-900`}>Saved</span>
    );
  }

  return (
    <span
      className={`${base} border border-rose-200/80 bg-rose-50/90 text-rose-900`}
      title={saveErrorMessage ?? undefined}
    >
      Save failed
    </span>
  );
}
