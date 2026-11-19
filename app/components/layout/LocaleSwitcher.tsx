"use client";

import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();

  // A full page load instead of a client-side navigation: the <html> element
  // (lang, theme script) lives in the [locale] layout, and re-rendering it on
  // the client makes React warn about next-themes' inline script. Switching
  // language is rare, so the reload costs nothing noticeable.
  function switchTo(next: string) {
    window.location.assign(getPathname({ href: pathname, locale: next }) + window.location.search);
  }

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) => switchTo(event.target.value)}
        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        {routing.locales.map((value) => (
          <option key={value} value={value}>
            {t(`languages.${value}`)}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-3 size-1.5 -translate-y-0.5 rotate-45 border-r-[1.5px] border-b-[1.5px] border-muted-foreground"
      />
    </label>
  );
}
