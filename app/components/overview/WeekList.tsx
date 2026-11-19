"use client";

import { useFormatter, useTranslations } from "next-intl";
import { BrandSwatch } from "@/app/components/clients/ClientAvatar";
import { useContentSheet } from "@/app/components/content/ContentSheetProvider";
import { StatusDot } from "@/app/components/content/StatusPill";
import type { ContentListItem } from "@/app/types/content";
import { daysBetween, today } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PanelEmpty } from "./Panel";

// Grouped by publish day; days without content are left out. Items arrive
// sorted by day, so grouping is a single pass.
export function WeekList({ items }: { items: ContentListItem[] }) {
  const t = useTranslations();
  const format = useFormatter();
  const { openEdit } = useContentSheet();

  if (items.length === 0) return <PanelEmpty>{t("Overview.weekEmpty")}</PanelEmpty>;

  const groups: { key: string; date: Date; items: ContentListItem[] }[] = [];
  for (const item of items) {
    if (!item.publishDate) continue;
    const key = item.publishDate.toISOString().slice(0, 10);
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, date: item.publishDate, items: [item] });
  }
  const start = today();

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => {
        const offset = daysBetween(start, group.date);
        const label =
          offset === 0
            ? t("Dates.today")
            : offset === 1
              ? t("Dates.tomorrow")
              : format.dateTime(group.date, { weekday: "long", timeZone: "UTC" });
        return (
          <div key={group.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-3.5 sm:px-5">
            <div className="flex items-baseline gap-2 sm:grid sm:content-start sm:gap-0.5 sm:pt-1.5">
              <span className={cn("text-[13px] font-medium capitalize", offset === 0 && "text-primary")}>{label}</span>
              <time dateTime={group.key} className="font-mono text-xs text-subtle">
                {format.dateTime(group.date, { day: "numeric", month: "short", timeZone: "UTC" })}
              </time>
            </div>
            <ul className="grid min-w-0 gap-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="-mx-2.5 grid w-[calc(100%+1.25rem)] cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-0.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,auto)]"
                  >
                    <StatusDot status={item.status} />
                    <span className="sr-only">{t(`Status.${item.status}`)}: </span>
                    <span className="truncate text-[13.5px] font-medium">{item.title}</span>
                    <span className="col-start-2 flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground sm:col-start-auto sm:max-w-[14rem]">
                      <BrandSwatch color={item.clientColor} />
                      <span className="truncate">{item.clientName}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
