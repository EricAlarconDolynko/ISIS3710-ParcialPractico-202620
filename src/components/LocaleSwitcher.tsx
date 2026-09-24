"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type AppLocale = (typeof routing.locales)[number];

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(locale: AppLocale) {
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(href, { locale });
    });
  }

  return (
    <nav aria-label={t("label")} className="flex gap-2 text-sm">
      {routing.locales.map((locale) => {
        const isCurrent = locale === currentLocale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => handleChange(locale)}
            disabled={isCurrent || isPending}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={t(locale)}
            className={
              isCurrent
                ? "font-bold text-slate-900 underline"
                : "text-slate-500 hover:underline disabled:opacity-50"
            }
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </nav>
  );
}