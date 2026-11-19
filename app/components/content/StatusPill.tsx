import { useTranslations } from "next-intl";
import type { ContentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "./status-styles";

export function StatusPill({ status }: { status: ContentStatus }) {
  const t = useTranslations("Status");
  return (
    <span
      className={cn(
        "inline-flex h-6.5 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium whitespace-nowrap",
        STATUS_STYLES[status].pill,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {t(status)}
    </span>
  );
}

export function StatusDot({ status, className }: { status: ContentStatus; className?: string }) {
  return <span aria-hidden className={cn("inline-block size-[7px] shrink-0 rounded-full", STATUS_STYLES[status].dot, className)} />;
}
