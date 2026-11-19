"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useContentSheet } from "./ContentSheetProvider";

export function NewContentButton({ clientId }: { clientId?: string }) {
  const t = useTranslations("Contents");
  const { openNew, hasActiveClients } = useContentSheet();

  return (
    <Button
      type="button"
      onClick={() => openNew(clientId)}
      disabled={!hasActiveClients}
      title={hasActiveClients ? undefined : t("noActiveClients")}
      className="h-9 px-3.5"
    >
      <Plus className="size-4" aria-hidden />
      {t("newContent")}
    </Button>
  );
}
