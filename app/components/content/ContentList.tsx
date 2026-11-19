"use client";

import { useTranslations } from "next-intl";
import { startTransition, useOptimistic } from "react";
import { BrandSwatch } from "@/app/components/clients/ClientAvatar";
import type { ContentListItem } from "@/app/types/content";
import type { ContentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { useContentSheet } from "./ContentSheetProvider";
import { PlatformBadge } from "./PlatformBadge";
import { PublishDay } from "./PublishDay";
import { StatusMenu } from "./StatusMenu";
import { useStatusChange } from "./useStatusChange";

interface ContentListProps {
  contents: ContentListItem[];
  showClient?: boolean;
}

const GRID_WITH_CLIENT = "md:grid-cols-[minmax(0,2.8fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_170px]";
const GRID_WITHOUT_CLIENT = "md:grid-cols-[minmax(0,3fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_170px]";

// The title button is stretched over the whole row (after:inset-0), so the
// row opens the sheet anywhere you click; the status menu sits above it as
// its own control. On narrow screens the row stacks: title + status, then
// client · type · date.
export function ContentList({ contents, showClient = false }: ContentListProps) {
  const t = useTranslations();
  const { openEdit } = useContentSheet();
  const changeStatus = useStatusChange();
  // Shows the new status immediately; settles to the server's data when the
  // action's revalidation arrives, or snaps back if the action fails.
  const [items, setOptimisticStatus] = useOptimistic(
    contents,
    (state, change: { id: string; status: ContentStatus }) =>
      state.map((item) => (item.id === change.id ? { ...item, status: change.status } : item)),
  );
  const grid = showClient ? GRID_WITH_CLIENT : GRID_WITHOUT_CLIENT;

  function onStatusChange(content: ContentListItem, status: ContentStatus) {
    startTransition(async () => {
      setOptimisticStatus({ id: content.id, status });
      await changeStatus(content, status);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div aria-hidden className={cn("hidden gap-5 bg-muted px-5 py-2.5 text-xs font-medium text-subtle md:grid", grid)}>
        <span>{t("ContentList.columns.title")}</span>
        {showClient && <span>{t("ContentList.columns.client")}</span>}
        <span>{t("ContentList.columns.type")}</span>
        <span>{t("ContentList.columns.date")}</span>
        <span>{t("ContentList.columns.status")}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((content) => (
          <li
            key={content.id}
            className={cn(
              "relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 transition-colors hover:bg-muted has-[[data-row-open]:focus-visible]:bg-muted md:gap-5 md:px-5 md:py-3.5",
              grid,
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <PlatformBadge platform={content.platform} />
              <span className="min-w-0">
                <button
                  type="button"
                  data-row-open
                  onClick={() => openEdit(content)}
                  className="line-clamp-2 cursor-pointer text-left font-medium outline-none after:absolute after:inset-0 md:line-clamp-1"
                >
                  {content.title}
                </button>
                <span className="block truncate text-xs text-muted-foreground">
                  {t("ContentList.assignee", { name: content.assigneeName })}
                </span>
              </span>
            </span>

            {showClient && (
              <span className="hidden min-w-0 items-center gap-2 md:flex">
                <BrandSwatch color={content.clientColor} />
                <span className="truncate">{content.clientName}</span>
              </span>
            )}
            <span className="hidden text-sm text-muted-foreground md:block">{t(`ContentType.${content.type}`)}</span>
            <span className="hidden md:block">
              <PublishDay date={content.publishDate} status={content.status} />
            </span>

            <span className="relative z-10 col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
              <StatusMenu status={content.status} onChange={(status) => onStatusChange(content, status)} />
            </span>

            <span className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-[42px] text-[12.5px] text-muted-foreground md:hidden">
              {showClient && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <BrandSwatch color={content.clientColor} />
                  <span className="truncate">{content.clientName}</span>
                  <span aria-hidden>·</span>
                </span>
              )}
              <span>{t(`ContentType.${content.type}`)}</span>
              <span aria-hidden>·</span>
              <PublishDay date={content.publishDate} status={content.status} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
