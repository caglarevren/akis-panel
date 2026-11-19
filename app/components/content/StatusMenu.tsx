"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ContentStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import { STATUS_ORDER, STATUS_STYLES } from "./status-styles";
import { StatusDot } from "./StatusPill";

interface StatusMenuProps {
  status: ContentStatus;
  onChange: (status: ContentStatus) => void;
  disabled?: boolean;
}

// The status pill doubles as the menu trigger: one click to see the options.
export function StatusMenu({ status, onChange, disabled }: StatusMenuProps) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        aria-label={t("StatusMenu.current", { status: t(`Status.${status}`) })}
        className={cn(
          "inline-flex h-6.5 cursor-pointer items-center gap-1.5 rounded-full border border-transparent pr-1.5 pl-2.5 text-[12.5px] font-medium whitespace-nowrap transition-colors outline-none hover:border-current/30 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-default disabled:opacity-70 data-popup-open:border-current/30",
          STATUS_STYLES[status].pill,
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {t(`Status.${status}`)}
        <ChevronDown aria-hidden className="size-3.5 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("StatusMenu.label")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={status} onValueChange={(value) => onChange(value as ContentStatus)}>
            {STATUS_ORDER.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
                // Radio items keep the menu open by default; a status pick is final.
                closeOnClick
                className="h-8 gap-2 font-medium"
              >
                <StatusDot status={option} />
                {t(`Status.${option}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
