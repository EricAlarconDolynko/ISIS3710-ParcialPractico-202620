const NUMBER_LOCALE: Record<string, string> = {
    es: "es-CO",
    en: "en-US",
};

export function formatPrice(value: number, locale: string): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale] ?? locale, {
    style: "currency",
    currency: "COP",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}