import { useFormatter, useTranslations } from "next-intl";
import type { ContentStatus } from "@/generated/prisma/enums";
import { daysBetween, today } from "@/lib/dates";
import { cn } from "@/lib/utils";

interface PublishDayProps {
  date: Date | null;
  status?: ContentStatus;
  showOverdue?: boolean;
  // Monospace suits columns of dates; inside a sentence it reads oddly.
  mono?: boolean;
  className?: string;
}

// Publish days are calendar days stored as UTC midnight, so they are
// formatted in UTC; any other zone could shift them by a day.
export function PublishDay({ date, status, showOverdue = true, mono = true, className }: PublishDayProps) {
  const t = useTranslations();
  const format = useFormatter();

  if (!date) return <span className={cn("text-subtle", className)}>{t("ClientDetail.noDate")}</span>;

  const diff = daysBetween(today(), date);
  const label =
    diff === 0
      ? t("Dates.today")
      : diff === 1
        ? t("Dates.tomorrow")
        : diff === -1
          ? t("Dates.yesterday")
          : format.dateTime(date, { day: "numeric", month: "short", timeZone: "UTC" });
  const overdue = showOverdue && diff < 0 && status !== undefined && status !== "PUBLISHED";

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <time dateTime={date.toISOString().slice(0, 10)} className={cn(mono && "font-mono text-[12.5px]", overdue && "text-destructive")}>
        {label}
      </time>
      {overdue && (
        <span className="rounded-[5px] bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
          {t("ClientDetail.overdue")}
        </span>
      )}
    </span>
  );
}
