"use client";

import { ArrowRight, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { ContentFormOptions, ContentListItem } from "@/app/types/content";
import type { ContentStatus } from "@/generated/prisma/enums";
import { NEXT_STATUS } from "@/lib/content-status";
import { ContentForm } from "./ContentForm";
import type { SheetTarget } from "./ContentSheetProvider";
import { StatusMenu } from "./StatusMenu";
import { useStatusChange } from "./useStatusChange";

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
          <>
            <SheetStatus key={`${session}-status`} content={content} />
            <p className="mx-6 mt-2 text-xs text-subtle">
              {t("created", { date: format.dateTime(content.createdAt, { day: "numeric", month: "long", year: "numeric" }) })}
            </p>
          </>
        )}

        {target && (
          <ContentForm key={session} target={target} options={options} onDone={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  );
}

// Status changes here apply immediately (they don't wait for "Save"), like
// in the list. The sheet keeps its own copy because the content it was
// opened with is a snapshot.
function SheetStatus({ content }: { content: ContentListItem }) {
  const t = useTranslations("StatusMenu");
  const changeStatus = useStatusChange();
  const [status, setStatus] = useState<ContentStatus>(content.status);
  const [busy, setBusy] = useState(false);
  const next = NEXT_STATUS[status];

  async function change(to: ContentStatus) {
    const previous = status;
    if (to === previous) return;
    setStatus(to);
    setBusy(true);
    const ok = await changeStatus(content, to, { onUndone: () => setStatus(previous) });
    if (!ok) setStatus(previous);
    setBusy(false);
  }

  return (
    <div className="mx-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-muted px-3.5 py-3">
      <StatusMenu status={status} onChange={change} disabled={busy} />
      <span className="flex-1" />
      {next ? (
        <Button type="button" size="sm" onClick={() => change(next)} disabled={busy} className="h-8 px-3">
          {t(`next.${status as "DRAFT" | "IN_REVIEW"}`)}
          <ArrowRight className="size-3.5" aria-hidden />
        </Button>
      ) : (
        <span className="text-[12.5px] text-muted-foreground">{t("isPublished")}</span>
      )}
    </div>
  );
}
