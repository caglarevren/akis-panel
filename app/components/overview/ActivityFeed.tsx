import { useFormatter, useNow, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { UserAvatar } from "@/app/components/shell/UserAvatar";
import { STATUS_STYLES } from "@/app/components/content/status-styles";
import type { OverviewActivity } from "@/app/types/overview";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { PanelEmpty } from "./Panel";

// Each entry links to its client, where the content lives.
export function ActivityFeed({ activities }: { activities: OverviewActivity[] }) {
  const t = useTranslations();
  const format = useFormatter();
  const now = useNow();

  if (activities.length === 0) return <PanelEmpty>{t("Overview.activityEmpty")}</PanelEmpty>;

  return (
    <ul className="grid px-5 py-2">
      {activities.map((activity) => {
        const values = {
          user: activity.userName,
          name: activity.clientName,
          title: activity.contentTitle ?? "",
          to: activity.toStatus ? t(`Status.${activity.toStatus}`) : "",
          b: (chunks: ReactNode) => <strong className="font-medium text-foreground">{chunks}</strong>,
          status: (chunks: ReactNode) => (
            <span className={cn("font-medium", activity.toStatus && STATUS_STYLES[activity.toStatus].text)}>{chunks}</span>
          ),
        };
        return (
          <li key={activity.id} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3 border-b border-border py-3 last:border-b-0">
            <UserAvatar name={activity.userName} className="size-[22px] text-[9px]" />
            <div className="min-w-0">
              <Link href={`/clients/${activity.clientId}`} className="block text-[13px] leading-snug text-muted-foreground hover:[&_strong]:underline">
                {t.rich(`Overview.act.${activity.kind}`, values)}
              </Link>
              <p className="mt-0.5 text-[11.5px] text-subtle">
                <time dateTime={activity.createdAt.toISOString()}>{format.relativeTime(activity.createdAt, now)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
