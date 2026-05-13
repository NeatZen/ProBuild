const cache = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}\0${currency}`;
  let fmt = cache.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      fmt = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    cache.set(key, fmt);
  }
  return fmt;
}

export function formatMoney(value: number, currency = "USD", locale = "en-US"): string {
  if (!Number.isFinite(value)) return formatterFor(locale, currency).format(0);
  return formatterFor(locale, currency).format(value);
}
