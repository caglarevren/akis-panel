import { useTranslations } from "next-intl";
import type { Platform } from "@/generated/prisma/enums";
import { PLATFORM_ABBR } from "@/lib/content-options";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const t = useTranslations("Platform");
  return (
    <span
      title={t(platform)}
      className="grid size-[30px] shrink-0 place-items-center rounded-lg border border-border bg-muted font-mono text-[10.5px] font-medium tracking-tight text-muted-foreground"
    >
      <span aria-hidden>{PLATFORM_ABBR[platform]}</span>
      <span className="sr-only">{t(platform)}</span>
    </span>
  );
}
