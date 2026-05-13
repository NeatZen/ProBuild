"use client";

import { useMemo } from "react";

import { densityClasses } from "@/lib/densityStyles";
import { useProBuildStore } from "@/store/proBuildStore";

export function useDensityClasses() {
  const density = useProBuildStore((s) => s.settings.density);
  return useMemo(() => densityClasses(density), [density]);
}
