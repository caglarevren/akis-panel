"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteClient } from "@/app/actions/clients";
import { ConfirmDeleteDialog } from "@/app/components/shared/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

interface DeleteClientButtonProps {
  client: { id: string; name: string };
  contentCount: number;
  // "page": labelled button on the client's own page; deleting leaves for the list.
  // "icon": compact action on a list card; deleting just refreshes the list in place.
  variant?: "page" | "icon";
}

export function DeleteClientButton({ client, contentCount, variant = "page" }: DeleteClientButtonProps) {
  const t = useTranslations("ClientDetail");
  const tForm = useTranslations("ClientForm");
  const tList = useTranslations("Clients");
  const router = useRouter();

  async function remove() {
    const result = await deleteClient(client.id);
    if (result.success || result.error === "not-found") {
      toast[result.success ? "success" : "error"](
        result.success ? t("deleted", { name: client.name }) : t("deleteNotFound"),
      );
      // On the client's own page, navigate first and refresh after, so the
      // deleted page is never re-rendered ("not found" flash). In the list we
      // stay put (keeping the search and filter) and just refresh; refresh also
      // updates the layout (in-review badge).
      if (variant === "page") router.push("/clients");
      router.refresh();
      return true;
    }
    toast.error(t(result.error === "unauthorized" ? "deleteUnauthorized" : "deleteError"));
    return false;
  }

  return (
    <ConfirmDeleteDialog
      trigger={
        variant === "icon" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={tList("deleteLabel", { name: client.name })}
            title={t("delete")}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          />
        ) : (
          <Button type="button" variant="outline" className="h-9 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive" />
        )
      }
      triggerContent={
        variant === "icon" ? (
          <Trash2 className="size-4" aria-hidden />
        ) : (
          <>
            <Trash2 className="size-4" aria-hidden />
            {t("delete")}
          </>
        )
      }
      title={t("deleteTitle", { name: client.name })}
      description={contentCount > 0 ? t("deleteDescription", { count: contentCount }) : t("deleteDescriptionEmpty")}
      confirmLabel={t("deleteConfirm")}
      pendingLabel={t("deleting")}
      cancelLabel={tForm("cancel")}
      onConfirm={remove}
    />
  );
}
