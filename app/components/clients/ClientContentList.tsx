import { useTranslations } from "next-intl";
import { PlatformBadge } from "@/app/components/content/PlatformBadge";
import { PublishDay } from "@/app/components/content/PublishDay";
import { StatusPill } from "@/app/components/content/StatusPill";
import type { ClientContentRow } from "@/app/types/client";

// Read-only for now: opening and editing a content item arrives with the
// content sheet in Faz 5, status changes in Faz 6.
export function ClientContentList({ contents }: { contents: ClientContentRow[] }) {
  const t = useTranslations();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="hidden grid-cols-[minmax(0,3fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_150px] gap-5 bg-muted px-5 py-2.5 text-xs font-medium text-subtle md:grid"
      >
        <span>{t("ClientDetail.columns.title")}</span>
        <span>{t("ClientDetail.columns.type")}</span>
        <span>{t("ClientDetail.columns.date")}</span>
        <span>{t("ClientDetail.columns.status")}</span>
      </div>
      <ul className="divide-y divide-border">
        {contents.map((content) => (
          <li
            key={content.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 md:grid-cols-[minmax(0,3fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_150px] md:gap-5 md:px-5 md:py-3.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <PlatformBadge platform={content.platform} />
              <div className="min-w-0">
                <p className="line-clamp-2 font-medium md:line-clamp-1">{content.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t("ClientDetail.assignee", { name: content.assigneeName })}</p>
              </div>
            </div>
            <span className="col-start-1 row-start-2 pl-[42px] text-[12.5px] text-muted-foreground md:col-start-auto md:row-start-auto md:pl-0 md:text-sm">
              {t(`ContentType.${content.type}`)}
              <span className="md:hidden">
                {" · "}
                <PublishDay date={content.publishDate} status={content.status} className="inline-flex" />
              </span>
            </span>
            <span className="hidden md:block">
              <PublishDay date={content.publishDate} status={content.status} />
            </span>
            <span className="col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
              <StatusPill status={content.status} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
