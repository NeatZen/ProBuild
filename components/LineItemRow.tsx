"use client";

import { useRef, useState } from "react";

import type { LineItem, LineType } from "@/lib/estimateTypes";
import { lineExtended } from "@/lib/estimateMath";
import { applyWasteSf, grossSfFromLfHeight, roundQuantity, type RoundMode } from "@/lib/takeoffMath";
import { cardSurfaceElevated, inputClass, labelClass } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { useMoneyFormatter } from "@/hooks/useMoneyFormatter";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

const CATEGORY_SUGGESTIONS = ["Labor", "Materials", "Subcontractor", "Equipment", "Other"];

const LINE_TYPE_OPTIONS: { value: LineType; label: string }[] = [
  { value: "labor", label: "Labor" },
  { value: "material", label: "Material" },
  { value: "allowance", label: "Allowance" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type Props = {
  line: LineItem;
  index: number;
  totalLines: number;
  searchMatch: boolean;
  searchActive: boolean;
};

export function LineItemRow({ line, index, totalLines, searchMatch, searchActive }: Props) {
  const formatMoney = useMoneyFormatter();
  const setLine = useProBuildStore((s) => s.setLine);
  const setOnboardingChecklist = useProBuildStore((s) => s.setOnboardingChecklist);
  const [roundMode, setRoundMode] = useState<RoundMode>("whole");
  const removeLine = useProBuildStore((s) => s.removeLine);
  const moveLine = useProBuildStore((s) => s.moveLine);
  const duplicateLine = useProBuildStore((s) => s.duplicateLine);
  const copyLineFromPrevious = useProBuildStore((s) => s.copyLineFromPrevious);
  const saveLineToLibrary = useProBuildStore((s) => s.saveLineToLibrary);
  const collapsed = useProBuildStore((s) => s.ui.collapsedLineIds.includes(line.id));
  const toggleLineCollapsed = useProBuildStore((s) => s.toggleLineCollapsed);
  const sections = useProBuildStore((s) => selectActiveEstimate(s).sections);

  const d = useDensityClasses();

  const touchStartX = useRef<number | null>(null);

  const extended = lineExtended(line);
  const listId = `categories-${line.id}`;

  const iconBtn =
    "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-sm transition duration-150 ease-out hover:border-stone-300 hover:bg-stone-50 hover:text-teal-900 disabled:cursor-not-allowed disabled:border-stone-100 disabled:bg-stone-50 disabled:text-stone-300 disabled:shadow-none";

  const dimmed = searchActive && !searchMatch;

  if (collapsed) {
    return (
      <article
        className={`relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-opacity ${d.lineItemCollapsedPad} ${dimmed ? "opacity-35" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Line {index + 1}
            </p>
            <p className="truncate text-sm font-medium text-stone-900">
              {line.description.trim() || "Empty description"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="font-mono text-sm font-semibold tabular-nums text-teal-950">{formatMoney(extended)}</p>
            <button
              type="button"
              onClick={() => toggleLineCollapsed(line.id)}
              className="rounded-lg border border-stone-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              Expand
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start == null || totalLines <= 1) return;
        const end = e.changedTouches[0]?.clientX;
        if (end == null) return;
        if (end - start < -88) {
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate(12);
          }
          if (window.confirm("Remove this line?")) removeLine(line.id);
        }
      }}
      className={`group relative overflow-hidden ${d.lineItemPad} ${cardSurfaceElevated} before:pointer-events-none before:absolute before:inset-y-5 before:left-0 before:w-0.5 before:rounded-full before:bg-teal-600 ${dimmed ? "opacity-35" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 font-medium uppercase tracking-wide text-stone-600 ${d.lineLabelChip}`}>
            Line {index + 1}
          </span>
          {line.kitName ? (
            <p className="mt-2 text-[11px] font-medium text-teal-800/90">Assembly: {line.kitName}</p>
          ) : null}
        </div>
        <div className="print-hide flex max-w-[70%] flex-wrap justify-end gap-1.5 sm:max-w-none">
          <button
            type="button"
            onClick={() => toggleLineCollapsed(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Collapse
          </button>
          <button
            type="button"
            onClick={() => {
              const name = window.prompt("Save to library — name?", line.description.trim() || "Line");
              if (name === null) return;
              saveLineToLibrary(line.id, name);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => duplicateLine(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Duplicate
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => copyLineFromPrevious(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Copy prev
          </button>
          <button
            type="button"
            aria-label="Move line up"
            disabled={index === 0}
            onClick={() => moveLine(line.id, "up")}
            className={iconBtn}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move line down"
            disabled={index >= totalLines - 1}
            onClick={() => moveLine(line.id, "down")}
            className={iconBtn}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Remove line"
            onClick={() => removeLine(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-rose-200/80 bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-800 shadow-sm ring-1 ring-white/35 transition duration-150 hover:bg-rose-50/90"
          >
            Remove
          </button>
        </div>
      </div>

      <div className={`mt-5 flex flex-col ${d.lineItemFieldGap}`}>
        <div>
          <label className={labelClass} htmlFor={`desc-${line.id}`}>
            Description
          </label>
          <input
            id={`desc-${line.id}`}
            value={line.description}
            onChange={(e) => {
              setLine(line.id, { description: e.target.value });
              if (e.target.value.trim()) {
                setOnboardingChecklist({ addedDetailLine: true });
              }
            }}
            placeholder="Scope of work"
            className={`${inputClass} ${d.formFieldMinH}`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`cat-${line.id}`}>
            Category
          </label>
          <input
            id={`cat-${line.id}`}
            list={listId}
            value={line.category}
            onChange={(e) => setLine(line.id, { category: e.target.value })}
            placeholder="e.g. Labor"
            className={`${inputClass} ${d.formFieldMinH}`}
          />
          <datalist id={listId}>
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor={`lt-${line.id}`}>
              Line type
            </label>
            <select
              id={`lt-${line.id}`}
              value={line.lineType}
              onChange={(e) => setLine(line.id, { lineType: e.target.value as LineType })}
              className={`${inputClass} ${d.formFieldMinH}`}
            >
              {LINE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`sec-${line.id}`}>
              Section / alternate
            </label>
            <select
              id={`sec-${line.id}`}
              value={line.sectionId}
              onChange={(e) => setLine(line.id, { sectionId: e.target.value })}
              className={`${inputClass} ${d.formFieldMinH}`}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.kind === "alternate" ? "↳ " : ""}
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-1">
            <label className={labelClass} htmlFor={`qty-${line.id}`}>
              Qty
            </label>
            <input
              id={`qty-${line.id}`}
              inputMode="decimal"
              type="number"
              min={0}
              step="any"
              value={Number.isFinite(line.quantity) ? line.quantity : 0}
              onChange={(e) => setLine(line.id, { quantity: Number(e.target.value) })}
              className={`${inputClass} ${d.formFieldMinH} font-mono tabular-nums`}
            />
          </div>
          <div className="col-span-1">
            <label className={labelClass} htmlFor={`unit-${line.id}`}>
              Unit
            </label>
            <input
              id={`unit-${line.id}`}
              value={line.unit}
              onChange={(e) => setLine(line.id, { unit: e.target.value })}
              placeholder="ea"
              className={`${inputClass} ${d.formFieldMinH} font-mono text-sm uppercase tracking-wide sm:text-base`}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass} htmlFor={`uc-${line.id}`}>
              Unit cost
            </label>
            <input
              id={`uc-${line.id}`}
              inputMode="decimal"
              type="number"
              min={0}
              step="0.01"
              value={Number.isFinite(line.unitCost) ? line.unitCost : 0}
              onChange={(e) => setLine(line.id, { unitCost: Number(e.target.value) })}
              className={`${inputClass} ${d.formFieldMinH} font-mono tabular-nums`}
            />
          </div>
          <div className="col-span-2 flex flex-col justify-end sm:col-span-1">
            <span className={labelClass}>Line total</span>
            <p className={`mt-1.5 flex items-center rounded-lg border border-teal-200 bg-teal-50/90 px-3.5 py-2.5 font-mono text-base font-semibold tabular-nums text-teal-950 shadow-sm ${d.formFieldMinH}`}>
              {formatMoney(extended)}
            </p>
          </div>
        </div>

        <details className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-stone-700">Takeoff & notes</summary>
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className={labelClass} htmlFor={`to-lf-${line.id}`}>
                  LF
                </label>
                <input
                  id={`to-lf-${line.id}`}
                  type="number"
                  inputMode="decimal"
                  value={line.takeoff?.lf ?? ""}
                  onChange={(e) =>
                    setLine(line.id, {
                      takeoff: {
                        ...line.takeoff,
                        lf: e.target.value === "" ? undefined : Number(e.target.value),
                        heightFt: line.takeoff?.heightFt,
                        wastePercent: line.takeoff?.wastePercent,
                      },
                    })
                  }
                  className={`${inputClass} font-mono text-sm tabular-nums`}
                  placeholder="—"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`to-h-${line.id}`}>
                  Height (ft)
                </label>
                <input
                  id={`to-h-${line.id}`}
                  type="number"
                  inputMode="decimal"
                  value={line.takeoff?.heightFt ?? ""}
                  onChange={(e) =>
                    setLine(line.id, {
                      takeoff: {
                        ...line.takeoff,
                        lf: line.takeoff?.lf,
                        heightFt: e.target.value === "" ? undefined : Number(e.target.value),
                        wastePercent: line.takeoff?.wastePercent,
                      },
                    })
                  }
                  className={`${inputClass} font-mono text-sm tabular-nums`}
                  placeholder="—"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`to-w-${line.id}`}>
                  Waste %
                </label>
                <input
                  id={`to-w-${line.id}`}
                  type="number"
                  inputMode="decimal"
                  value={line.takeoff?.wastePercent ?? ""}
                  onChange={(e) =>
                    setLine(line.id, {
                      takeoff: {
                        ...line.takeoff,
                        lf: line.takeoff?.lf,
                        heightFt: line.takeoff?.heightFt,
                        wastePercent: e.target.value === "" ? undefined : Number(e.target.value),
                      },
                    })
                  }
                  className={`${inputClass} font-mono text-sm tabular-nums`}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor={`to-r-${line.id}`}>
                  Round
                </label>
                <select
                  id={`to-r-${line.id}`}
                  value={roundMode}
                  onChange={(e) => setRoundMode(e.target.value as RoundMode)}
                  className={`${inputClass} text-sm`}
                >
                  <option value="none">Exact</option>
                  <option value="whole">Whole SF</option>
                  <option value="half">½ SF</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-teal-600/40 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100"
                onClick={() => {
                  const lf = Number(line.takeoff?.lf);
                  const h = Number(line.takeoff?.heightFt);
                  const waste = Number(line.takeoff?.wastePercent ?? 0);
                  if (!Number.isFinite(lf) || !Number.isFinite(h) || lf <= 0 || h <= 0) return;
                  const gross = grossSfFromLfHeight(lf, h);
                  const sf = applyWasteSf(gross, waste);
                  const qty = roundQuantity(sf, roundMode);
                  setLine(line.id, { quantity: qty, unit: line.unit?.trim() ? line.unit : "SF" });
                  setOnboardingChecklist({ addedDetailLine: true });
                }}
              >
                Apply LF×height → qty
              </button>
              <span className="text-[11px] text-stone-500">
                Gross SF{" "}
                {(() => {
                  const lf = Number(line.takeoff?.lf);
                  const h = Number(line.takeoff?.heightFt);
                  if (!Number.isFinite(lf) || !Number.isFinite(h)) return "—";
                  return grossSfFromLfHeight(lf, h).toFixed(2);
                })()}
              </span>
            </div>
            <div>
              <label className={labelClass} htmlFor={`note-${line.id}`}>
                Internal note
              </label>
              <textarea
                id={`note-${line.id}`}
                value={line.internalNote ?? ""}
                onChange={(e) => setLine(line.id, { internalNote: e.target.value })}
                rows={2}
                placeholder="Estimator-only (not on client view)"
                className={`${inputClass} text-sm leading-relaxed`}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={Boolean(line.needsReview)}
                onChange={(e) => setLine(line.id, { needsReview: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300"
              />
              Flag for review / client question
            </label>
          </div>
        </details>
      </div>
    </article>
  );
}
