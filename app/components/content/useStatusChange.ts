"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { changeContentStatus, undoStatusChange } from "@/app/actions/content-status";
import type { ContentStatus } from "@/generated/prisma/enums";

interface StatusChangeOptions {
  // Called after the server has reverted an undone change, so local state
  // that isn't driven by server props (e.g. the open sheet) can follow.
  onUndone?: () => void;
}

// Runs a status change and shows the result toast with an "Undo" action.
// Resolves to false on failure so callers can roll back optimistic state.
export function useStatusChange() {
  const t = useTranslations();

  return useCallback(
    async (content: { id: string; title: string }, to: ContentStatus, options: StatusChangeOptions = {}) => {
      const result = await changeContentStatus(content.id, to);
      if (!result.success) {
        toast.error(t("StatusMenu.error"));
        return false;
      }
      const { activityId } = result.data;
      if (activityId) {
        toast.success(t("StatusMenu.changed", { title: content.title, status: t(`Status.${to}`) }), {
          // Long enough to notice a mistake and reach the button.
          duration: 10_000,
          action: {
            label: t("StatusMenu.undo"),
            onClick: async () => {
              const undo = await undoStatusChange(activityId);
              if (undo.success) {
                options.onUndone?.();
                toast(t("StatusMenu.undone"));
              } else {
                toast.error(t(undo.error === "expired" ? "StatusMenu.undoExpired" : "StatusMenu.error"));
              }
            },
          },
        });
      }
      return true;
    },
    [t],
  );
}
