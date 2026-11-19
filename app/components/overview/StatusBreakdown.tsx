import { useTranslations } from "next-intl";
import { StatusBar } from "@/app/components/content/StatusBar";
import { StatusDot } from "@/app/components/content/StatusPill";
import { STATUS_ORDER } from "@/app/components/content/status-styles";
import type { StatusCounts } from "@/app/types/client";
import { Link } from "@/i18n/navigation";

export function StatusBreakdown({ counts, total }: { counts: StatusCounts; total: number }) {
  const t = useTranslations();

  return (
    <section aria-label={t("Overview.breakdown")} className="grid gap-2.5">
      <StatusBar counts={counts} label={t("Overview.breakdown")} className="h-2" />
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {STATUS_ORDER.map((status) => (
          <Link
            key={status}
            href={`/contents?status=${status}`}
            className="inline-flex items-center gap-2 py-0.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            <StatusDot status={status} />
            {t(`Status.${status}`)}
            <span className="font-mono text-[13px] font-medium text-foreground">{counts[status]}</span>
            <span className="font-mono text-xs text-subtle">{total > 0 ? Math.round((counts[status] / total) * 100) : 0}%</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
