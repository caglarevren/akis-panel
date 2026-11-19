"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteContent } from "@/app/actions/contents";
import { ConfirmDeleteDialog } from "@/app/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";

interface DeleteContentButtonProps {
  content: { id: string; title: string };
  // "sheet": labelled button in the edit sheet's footer.
  // "icon": compact action on a list row.
  variant?: "sheet" | "icon";
  onDeleted?: () => void;
}

export function DeleteContentButton({ content, variant = "sheet", onDeleted }: DeleteContentButtonProps) {
  const t = useTranslations();

  async function remove() {
    const result = await deleteContent(content.id);
    if (result.success) {
      toast.success(t("ContentForm.toastDeleted"));
      onDeleted?.();
      return true;
    }
    if (result.error === "not-found") {
      // Already gone (deleted elsewhere): nothing left to confirm.
      toast.error(t("ContentForm.errors.notFound"));
      onDeleted?.();
      return true;
    }
    toast.error(t(result.error === "unauthorized" ? "ContentForm.errors.unauthorized" : "ContentForm.errors.server"));
    return false;
  }

  const label = t("ContentList.deleteLabel", { title: content.title });

  return (
    <ConfirmDeleteDialog
      trigger={
        variant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={t("ContentForm.delete")}
            className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          />
        ) : (
          <Button type="button" variant="ghost" className="mr-auto h-9 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" />
        )
      }
      triggerContent={
        variant === "icon" ? (
          <Trash2 className="size-4" aria-hidden />
        ) : (
          <>
            <Trash2 className="size-4" aria-hidden />
            {t("ContentForm.delete")}
          </>
        )
      }
      title={t("ContentForm.deleteTitle")}
      description={t("ContentForm.deleteDescription", { title: content.title })}
      confirmLabel={t("ContentForm.delete")}
      pendingLabel={t("ContentForm.deleting")}
      cancelLabel={t("ContentForm.cancel")}
      onConfirm={remove}
    />
  );
}
