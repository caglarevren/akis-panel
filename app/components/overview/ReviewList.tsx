"use client";

import { useTranslations } from "next-intl";
import { startTransition, useOptimistic } from "react";
import { BrandSwatch } from "@/app/components/clients/ClientAvatar";
import { useContentSheet } from "@/app/components/content/ContentSheetProvider";
import { PublishDay } from "@/app/components/content/PublishDay";
import { useStatusChange } from "@/app/components/content/useStatusChange";
import { Button } from "@/components/ui/button";
import type { ContentListItem } from "@/app/types/content";
import { PanelEmpty } from "./Panel";

// "Publish" removes the row at once; the refreshed overview (or an undo)
// brings the list back in sync.
export function ReviewList({ items }: { items: ContentListItem[] }) {
  const t = useTranslations();
  const { openEdit } = useContentSheet();
  const changeStatus = useStatusChange();
  const [visible, hide] = useOptimistic(items, (state, id: string) => state.filter((item) => item.id !== id));

  if (visible.length === 0) return <PanelEmpty>{t("Overview.reviewEmpty")}</PanelEmpty>;

  function publish(item: ContentListItem) {
    startTransition(async () => {
      hide(item.id);
      await changeStatus(item, "PUBLISHED");
    });
  }

  return (
    <ul className="grid gap-0.5 p-2">
      {visible.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted">
          <button type="button" onClick={() => openEdit(item)} className="grid min-w-0 flex-1 cursor-pointer gap-0.5 text-left focus-visible:outline-none">
            <span className="truncate text-[13.5px] font-medium">{item.title}</span>
            <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <BrandSwatch color={item.clientColor} />
              <span className="truncate">{item.clientName}</span>
              <span aria-hidden>·</span>
              <PublishDay date={item.publishDate} status={item.status} className="shrink-0" />
            </span>
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => publish(item)}
            aria-label={t("Overview.publishLabel", { title: item.title })}
            className="h-8 shrink-0 px-3"
          >
            {t("Overview.publish")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
