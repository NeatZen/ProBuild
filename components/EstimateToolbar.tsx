"use client";

type Props = {
  onAddLine: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
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

function IconDoc({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 3.5h5.2L14.5 6.8V16.5H6A1.5 1.5 0 0 1 4.5 15V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M11 3.6V6.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200/70 bg-white/65 px-3.5 text-sm font-medium text-stone-800 shadow-sm shadow-stone-900/[0.04] ring-1 ring-white/50 backdrop-blur-md transition duration-150 ease-out hover:border-stone-300/90 hover:bg-white active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/35";

export function EstimateToolbar({ onAddLine, onExportCsv, onPrint, onClear }: Props) {
  return (
    <div className="print-hide mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
      <button
        type="button"
        onClick={onAddLine}
        className="group relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-teal-600 to-teal-800 px-5 text-sm font-semibold text-white shadow-[0_14px_34px_-18px_rgba(15,118,110,0.75),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/15 transition duration-150 ease-out hover:from-teal-500 hover:to-teal-700 hover:shadow-[0_18px_40px_-18px_rgba(15,118,110,0.55)] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <span
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.22),transparent_55%)] opacity-90 transition group-hover:opacity-100"
          aria-hidden
        />
        <span
          className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-lg font-light leading-none ring-1 ring-white/15"
          aria-hidden
        >
          +
        </span>
        <span className="relative">Add line item</span>
      </button>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-200/55 bg-white/40 p-1.5 shadow-sm shadow-stone-900/[0.04] ring-1 ring-white/45 backdrop-blur-md sm:flex-1 sm:justify-end sm:gap-1.5">
        <button type="button" onClick={onExportCsv} className={`${ghostBtn} flex-1 border-0 shadow-none ring-0 sm:flex-none`}>
          <IconTable className="h-4 w-4 text-teal-700/80" />
          CSV
        </button>
        <button type="button" onClick={onPrint} className={`${ghostBtn} flex-1 border-0 shadow-none ring-0 sm:flex-none`}>
          <IconPrint className="h-4 w-4 text-teal-700/80" />
          Print
        </button>
        <button
          type="button"
          onClick={onClear}
          className={`${ghostBtn} flex-1 border-rose-200/80 text-rose-800 hover:border-rose-300 hover:bg-rose-50/80 focus-visible:outline-rose-400/45 sm:flex-none`}
        >
          <IconDoc className="h-4 w-4 text-rose-600/80" />
          Clear
        </button>
      </div>
    </div>
  );
}
