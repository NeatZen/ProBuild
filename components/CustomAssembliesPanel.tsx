"use client";

import type { AssemblyLineSeed } from "@/lib/assemblies";
import { cardSurface, headingClass } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { useProBuildStore } from "@/store/proBuildStore";

export function CustomAssembliesPanel() {
  const customAssemblies = useProBuildStore((s) => s.customAssemblies);
  const upsert = useProBuildStore((s) => s.upsertCustomAssembly);
  const remove = useProBuildStore((s) => s.removeCustomAssembly);
  const d = useDensityClasses();

  const addKit = () => {
    const name = window.prompt("New kit name?");
    if (name === null || !name.trim()) return;
    const line: AssemblyLineSeed = {
      description: "First scope line",
      category: "",
      quantity: 1,
      unit: "ea",
      unitCost: 0,
    };
    upsert({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: "",
      lines: [line],
    });
  };

  return (
    <section className={`print-hide ${cardSurface} ${d.cardPad}`} aria-label="Custom assemblies">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={`${headingClass} text-sm`}>Custom assemblies</h2>
          <p className="mt-1 text-xs text-stone-500">
            Saved kits appear in “Insert assembly” with the built-ins. Use lines to model repeatable scopes.
          </p>
        </div>
        <button type="button" className="text-xs font-semibold text-teal-900 underline" onClick={addKit}>
          + New kit
        </button>
      </div>
      {customAssemblies.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">No custom kits yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {customAssemblies.map((k) => (
            <li
              key={k.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">{k.name}</p>
                <p className="text-[11px] text-stone-500">{k.lines.length} seed line(s)</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-rose-800 hover:underline"
                onClick={() => {
                  if (window.confirm(`Delete kit “${k.name}”?`)) remove(k.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <details className="mt-4 rounded-lg border border-stone-200 bg-white p-3 text-sm">
        <summary className="cursor-pointer font-semibold text-stone-800">Editor note</summary>
        <p className="mt-2 text-xs leading-relaxed text-stone-600">
          We start each kit with one placeholder line. Insert the kit from the toolbar, then edit quantities and
          descriptions on the expanded lines—same workflow as built-in assemblies.
        </p>
      </details>
    </section>
  );
}
