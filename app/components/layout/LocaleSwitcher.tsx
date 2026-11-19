"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => router.replace(pathname, { locale: next }));
        }}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60"
      >
        {routing.locales.map((value) => (
          <option key={value} value={value}>
            {t(`languages.${value}`)}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-3 size-1.5 -translate-y-0.5 rotate-45 border-r-[1.5px] border-b-[1.5px] border-muted-foreground" />
    </label>
  );
}
