"use client";

import { useState, useRef, type ChangeEvent } from "react";

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
  const importCsvText = useProBuildStore((s) => s.importCsvText);
  const exportPersistJson = useProBuildStore((s) => s.exportPersistJson);
  const exportActiveEstimateJson = useProBuildStore((s) => s.exportActiveEstimateJson);
  const clearAllData = useProBuildStore((s) => s.clearAllData);
  const estimate = useProBuildStore(selectActiveEstimate);
  const currency = useProBuildStore((s) => s.settings.currency);
  const locale = useProBuildStore((s) => s.settings.locale);
  const branding = useProBuildStore((s) => s.branding);

  const d = useDensityClasses();
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvDraft, setCsvDraft] = useState("");
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
            buildClientViewHtml(estimate, locale, currency, branding),
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
        onClick={() => setCsvOpen((v) => !v)}
        className={tealBtn}
        aria-expanded={csvOpen}
      >
        Import CSV
      </button>
      {csvOpen ? (
        <div className="w-full basis-full rounded-xl border border-teal-200 bg-white p-3 shadow-sm">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-600">
            Paste vendor CSV (header row with Description, Qty, Unit cost, …)
          </label>
          <textarea
            value={csvDraft}
            onChange={(e) => setCsvDraft(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-stone-200 bg-stone-50/80 px-2 py-1.5 font-mono text-xs text-stone-900"
            placeholder="Description,Qty,Unit cost&#10;Concrete pour,1,1500"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={tealBtn}
              onClick={() => {
                const res = importCsvText(csvDraft);
                if (!res.ok) {
                  window.alert(res.error ?? "Import failed.");
                  return;
                }
                setCsvDraft("");
                setCsvOpen(false);
                window.alert(`Imported ${res.imported ?? 0} line(s).`);
              }}
            >
              Append lines
            </button>
            <button type="button" className={neutralBtn} onClick={() => setCsvOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
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
