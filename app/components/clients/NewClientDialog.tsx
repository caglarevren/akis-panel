"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AccountManagerOption } from "@/app/types/client";
import { NewClientForm } from "./NewClientForm";

interface NewClientDialogProps {
  managers: AccountManagerOption[];
  currentUserId: string;
}

export function NewClientDialog({ managers, currentUserId }: NewClientDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" className="h-9 px-3.5" />}>
        <Plus className="size-4" aria-hidden />
        {t("Clients.newClient")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-3rem)] gap-0 overflow-y-auto p-0 sm:max-w-[520px]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold tracking-tight">{t("ClientForm.title")}</DialogTitle>
          <DialogDescription>{t("ClientForm.description")}</DialogDescription>
        </DialogHeader>
        {/* Unmounted with the popup on close, so each opening starts blank. */}
        <NewClientForm managers={managers} currentUserId={currentUserId} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
