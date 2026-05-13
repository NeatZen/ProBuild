"use client";

type Props = {
  onAddLine: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onClear: () => void;
};

const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200/90 bg-white/80 px-4 text-sm font-medium text-stone-800 shadow-sm shadow-stone-900/5 backdrop-blur-sm transition hover:border-stone-300 hover:bg-white active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/40";

export function EstimateToolbar({ onAddLine, onExportCsv, onPrint, onClear }: Props) {
  return (
    <div className="print-hide mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onAddLine}
        className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-900/25 ring-1 ring-white/15 transition hover:from-teal-500 hover:to-teal-600 hover:shadow-xl hover:shadow-teal-900/30 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 text-lg font-light leading-none transition group-hover:bg-white/20"
          aria-hidden
        >
          +
        </span>
        Add line item
      </button>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button type="button" onClick={onExportCsv} className={`${ghostBtn} flex-1 sm:flex-none`}>
          Export CSV
        </button>
        <button type="button" onClick={onPrint} className={`${ghostBtn} flex-1 sm:flex-none`}>
          Print / PDF
        </button>
        <button
          type="button"
          onClick={onClear}
          className={`${ghostBtn} flex-1 border-rose-200/90 text-rose-800 hover:border-rose-300 hover:bg-rose-50/90 focus-visible:outline-rose-400/50 sm:flex-none`}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
