"use client";

import { X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { ContentFormOptions } from "@/app/types/content";
import { ContentForm } from "./ContentForm";
import type { SheetTarget } from "./ContentSheetProvider";
import { StatusPill } from "./StatusPill";

interface ContentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: SheetTarget | null;
  session: number;
  options: ContentFormOptions;
}

export function ContentSheet({ open, onOpenChange, target, session, options }: ContentSheetProps) {
  const t = useTranslations("ContentForm");
  const format = useFormatter();
  const content = target?.mode === "edit" ? target.content : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[540px]"
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
          <div className="min-w-0">
            <SheetTitle className="text-lg font-semibold tracking-tight">{content ? t("editTitle") : t("newTitle")}</SheetTitle>
            <SheetDescription className={content ? "truncate" : "sr-only"}>{content?.clientName ?? t("newTitle")}</SheetDescription>
          </div>
          <SheetClose
            render={<Button type="button" variant="outline" size="icon" aria-label={t("close")} className="shrink-0 text-muted-foreground" />}
          >
            <X className="size-4" aria-hidden />
          </SheetClose>
        </div>

        {content && (
          <div className="mx-6 mb-1 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-muted px-3.5 py-3">
            <span className="text-[12.5px] font-medium text-muted-foreground">{t("status")}</span>
            <StatusPill status={content.status} />
            <span className="ml-auto text-xs text-subtle">
              {t("created", { date: format.dateTime(content.createdAt, { day: "numeric", month: "long", year: "numeric" }) })}
            </span>
          </div>
        )}

        {target && (
          <ContentForm key={session} target={target} options={options} onDone={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}
