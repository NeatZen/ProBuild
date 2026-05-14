"use client";

import { cardSurface, headingClass } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { useProBuildStore } from "@/store/proBuildStore";

export function LineLibraryPanel() {
  const library = useProBuildStore((s) => s.savedLineLibrary);
  const insertSavedLibraryItem = useProBuildStore((s) => s.insertSavedLibraryItem);
  const removeSavedLibraryItem = useProBuildStore((s) => s.removeSavedLibraryItem);
  const d = useDensityClasses();

  if (library.length === 0) return null;

  return (
    <section aria-label="Saved line library" className={`${cardSurface} ${d.cardPadTight}`}>
      <h2 className={`${headingClass} text-sm`}>Your line library</h2>
      <p className="mt-1 text-xs text-stone-500">Tap to insert at the end of the active estimate.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {library.map((item) => (
          <li key={item.id} className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs">
            <button type="button" className="font-medium text-teal-900 hover:underline" onClick={() => insertSavedLibraryItem(item.id)}>
              {item.name}
            </button>
            <button
              type="button"
              aria-label={`Remove ${item.name} from library`}
              className="rounded px-1 text-rose-700 hover:bg-rose-50"
              onClick={() => removeSavedLibraryItem(item.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
