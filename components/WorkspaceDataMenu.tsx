"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";

import { buildClientViewHtml, defaultClientViewFilename } from "@/lib/clientViewHtml";
import { downloadTextFile } from "@/lib/downloadText";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

type Props = {
  onExportCsv: () => void;
};

export function WorkspaceDataMenu({ onExportCsv }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const importPersistJson = useProBuildStore((s) => s.importPersistJson);
  const exportPersistJson = useProBuildStore((s) => s.exportPersistJson);
  const exportActiveEstimateJson = useProBuildStore((s) => s.exportActiveEstimateJson);
  const clearAllData = useProBuildStore((s) => s.clearAllData);
  const estimate = useProBuildStore(selectActiveEstimate);
  const currency = useProBuildStore((s) => s.settings.currency);
  const locale = useProBuildStore((s) => s.settings.locale);

  const d = useDensityClasses();
  const neutralBtn = `inline-flex items-center justify-center rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-800 shadow-sm hover:bg-stone-50 ${d.workspaceDataBtnH}`;
  const tealBtn = `inline-flex items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-teal-900 shadow-sm hover:bg-teal-100/80 ${d.workspaceDataBtnH}`;
  const dangerBtn = `inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 text-[11px] font-semibold uppercase tracking-wide text-rose-900 shadow-sm hover:bg-rose-50 ${d.workspaceDataBtnH}`;

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
      <button type="button" onClick={() => fileRef.current?.click()} className={neutralBtn}>
        Import backup
      </button>
      <button
        type="button"
        onClick={() => downloadTextFile("probuild-backup.json", exportPersistJson(), "application/json")}
        className={neutralBtn}
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
        className={neutralBtn}
      >
        Export this JSON
      </button>
      <button
        type="button"
        onClick={() =>
          downloadTextFile(
            defaultClientViewFilename(estimate),
            buildClientViewHtml(estimate, locale, currency),
            "text/html;charset=utf-8",
          )
        }
        className={tealBtn}
      >
        Client HTML
      </button>
      <button type="button" onClick={onExportCsv} className={neutralBtn}>
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
        className={dangerBtn}
      >
        Erase all
      </button>
    </div>
  );
}
