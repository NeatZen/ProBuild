"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";

import { downloadTextFile } from "@/lib/downloadText";
import { useProBuildStore } from "@/store/proBuildStore";

type Props = {
  onExportCsv: () => void;
};

export function WorkspaceDataMenu({ onExportCsv }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const importPersistJson = useProBuildStore((s) => s.importPersistJson);
  const exportPersistJson = useProBuildStore((s) => s.exportPersistJson);
  const exportActiveEstimateJson = useProBuildStore((s) => s.exportActiveEstimateJson);
  const clearAllData = useProBuildStore((s) => s.clearAllData);

  const onPickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const res = importPersistJson(text);
    if (!res.ok) {
      window.alert(res.error ?? "Import failed.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onPickFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/70 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-white"
      >
        Import backup
      </button>
      <button
        type="button"
        onClick={() => downloadTextFile("probuild-backup.json", exportPersistJson(), "application/json")}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/70 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-white"
      >
        Export backup
      </button>
      <button
        type="button"
        onClick={() =>
          downloadTextFile(
            "probuild-estimate.json",
            exportActiveEstimateJson(),
            "application/json",
          )
        }
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/70 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-white"
      >
        Export this JSON
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/70 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-white"
      >
        CSV
      </button>
      <button
        type="button"
        onClick={() => {
          if (
            !window.confirm(
              "Erase ALL estimates and settings from this browser? This cannot be undone.",
            )
          ) {
            return;
          }
          clearAllData();
        }}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200/80 bg-white/70 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-rose-800 hover:bg-rose-50"
      >
        Erase all
      </button>
    </div>
  );
}
