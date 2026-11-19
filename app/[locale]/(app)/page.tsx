import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { NewContentButton } from "@/app/components/content/NewContentButton";
import { ActivityFeed } from "@/app/components/overview/ActivityFeed";
import { KpiTiles } from "@/app/components/overview/KpiTiles";
import { OverdueBanner } from "@/app/components/overview/OverdueBanner";
import { Panel } from "@/app/components/overview/Panel";
import { ReviewList } from "@/app/components/overview/ReviewList";
import { StatusBreakdown } from "@/app/components/overview/StatusBreakdown";
import { WeekList } from "@/app/components/overview/WeekList";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { getOverview } from "@/lib/db/overview";

export default async function OverviewPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, data, t, format] = await Promise.all([auth(), getOverview(), getTranslations("Overview"), getFormatter()]);
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        eyebrow={format.dateTime(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        title={t("greeting", { name: firstName })}
        actions={<NewContentButton />}
      />

      <div className="grid gap-[18px]">
        <KpiTiles data={data} />
        <StatusBreakdown counts={data.statusCounts} total={data.totalContents} />
        <OverdueBanner count={data.overdueCount} />

        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel title={t("week")} action={{ label: t("viewAll"), href: "/contents?due=week" }} className="lg:row-span-2">
            <WeekList items={data.weekItems} />
          </Panel>
          <Panel
            title={
              <>
                {t("review")} <span className="font-mono font-normal text-subtle">· {data.statusCounts.IN_REVIEW}</span>
              </>
            }
            action={{ label: t("viewAll"), href: "/contents?status=IN_REVIEW" }}
          >
            <ReviewList items={data.inReview} />
          </Panel>
          <Panel title={t("activity")}>
            <ActivityFeed activities={data.recentActivity} />
          </Panel>
        </div>
      </div>
    </>
  );
}
