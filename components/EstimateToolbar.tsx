"use client";

import { ASSEMBLIES } from "@/lib/assemblies";
import { LINE_TEMPLATES } from "@/lib/lineTemplates";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { toolbarWellFrame } from "@/lib/uiTokens";
import { useProBuildStore } from "@/store/proBuildStore";

type Props = {
  onAddLine: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  /** Save as PDF (print-to-PDF); defaults to onPrint when omitted */
  onExportPdf?: () => void;
  onClear: () => void;
};

function IconTable({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.5 4.5h13v11h-13v-11Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M3.5 8.5h13M8.5 4.5v11" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function IconPrint({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 14.5V16h8v-1.5M5.5 11h9a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1V10a1 1 0 0 0 1 1Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M7 7V4.5h6V7" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/35";

export function EstimateToolbar({ onAddLine, onExportCsv, onPrint, onExportPdf, onClear }: Props) {
  const insertTemplate = useProBuildStore((s) => s.insertTemplate);
  const insertAssembly = useProBuildStore((s) => s.insertAssembly);
  const addAlternateSection = useProBuildStore((s) => s.addAlternateSection);
  const d = useDensityClasses();
  const exportPdf = onExportPdf ?? onPrint;

  return (
    <div className={`print-hide flex flex-col ${d.toolbarMt} gap-3`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
        <button
          type="button"
          data-testid="add-line-item"
          onClick={onAddLine}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-lg font-light leading-none" aria-hidden>
            +
          </span>
          Add line item
        </button>

        <button
          type="button"
          data-testid="add-alternate-section"
          onClick={() => addAlternateSection()}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-950 shadow-sm transition hover:bg-violet-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600/40"
        >
          Add alternate scope
        </button>

        <div className={`flex flex-wrap gap-2 sm:flex-1 sm:justify-end sm:gap-1.5 ${toolbarWellFrame} ${d.toolbarWellPad}`}>
          <label className="sr-only" htmlFor="template-insert">
            Insert template lines
          </label>
          <select
            id="template-insert"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = "";
              if (v) insertTemplate(v);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-xs font-medium text-stone-800 sm:max-w-[12rem] sm:flex-none sm:text-sm"
          >
            <option value="">+ Insert template…</option>
            {LINE_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="assembly-insert">
            Insert assembly or kit
          </label>
          <select
            id="assembly-insert"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = "";
              if (v) insertAssembly(v);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-teal-200 bg-teal-50 px-2 text-xs font-medium text-teal-950 sm:max-w-[12rem] sm:flex-none sm:text-sm"
          >
            <option value="">+ Insert assembly…</option>
            {ASSEMBLIES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={onExportCsv} className={`${ghostBtn} flex-1 sm:flex-none`}>
            <IconTable className="h-4 w-4 text-teal-700" />
            CSV
          </button>
          <button
            type="button"
            data-testid="export-pdf"
            onClick={exportPdf}
            className={`${ghostBtn} flex-1 sm:flex-none`}
          >
            PDF
          </button>
          <button type="button" onClick={onPrint} className={`${ghostBtn} flex-1 sm:flex-none`}>
            <IconPrint className="h-4 w-4 text-teal-700" />
            Print
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`${ghostBtn} flex-1 border-rose-200 text-rose-900 hover:border-rose-300 hover:bg-rose-50 sm:flex-none`}
          >
            Clear fields
          </button>
        </div>
      </div>
      <p className="text-[11px] text-stone-500">
        Tip: <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono">⌘/Ctrl+N</kbd> adds a line
        anywhere on this page.
      </p>
    </div>
  );
}
