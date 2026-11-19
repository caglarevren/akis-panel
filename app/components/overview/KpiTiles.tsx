import { useFormatter, useTranslations } from "next-intl";
import { StatusDot } from "@/app/components/content/StatusPill";
import { Link } from "@/i18n/navigation";
import type { OverviewData } from "@/app/types/overview";

// Headline numbers only; each tile opens the list behind the number.
export function KpiTiles({ data }: { data: OverviewData }) {
  const t = useTranslations("Overview.kpi");
  const format = useFormatter();
  const tiles = [
    { key: "activeClients", value: data.activeClients, href: "/clients?status=active" },
    { key: "totalContents", value: data.totalContents, href: "/contents" },
    { key: "inReview", value: data.statusCounts.IN_REVIEW, href: "/contents?status=IN_REVIEW", dot: true },
    { key: "dueWeek", value: data.dueWeekCount, href: "/contents?due=week" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.key}
          href={tile.href}
          className="grid content-between gap-1.5 rounded-2xl border border-border bg-card px-5 py-[18px] transition-[border-color,box-shadow,translate] hover:-translate-y-px hover:border-ring/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
            {"dot" in tile && <StatusDot status="IN_REVIEW" />}
            {t(tile.key)}
          </span>
          <span className="text-[27px] leading-tight font-semibold tracking-tight tabular-nums sm:text-[32px]">
            {format.number(tile.value)}
          </span>
        </Link>
      ))}
    </div>
  );
}
