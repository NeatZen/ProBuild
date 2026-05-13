"use client";

import { useCallback } from "react";

import { formatMoney } from "@/lib/formatMoney";
import { useProBuildStore } from "@/store/proBuildStore";

export function useMoneyFormatter(): (value: number) => string {
  const currency = useProBuildStore((s) => s.settings.currency);
  const locale = useProBuildStore((s) => s.settings.locale);
  return useCallback(
    (value: number) => formatMoney(value, currency, locale),
    [currency, locale],
  );
}
