"use client";

import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { logout } from "@/app/actions/auth";
import { BrandMark } from "@/app/components/layout/BrandMark";
import { LocaleSwitcher } from "@/app/components/layout/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "./UserAvatar";

export interface ShellUser {
  name: string;
  email: string;
}

interface SidebarContentProps {
  user: ShellUser;
  inReviewCount: number;
  onNavigate?: () => void;
}

export function SidebarContent({ user, inReviewCount, onNavigate }: SidebarContentProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="px-1.5 pt-1">
        <BrandMark subtitle={t("Common.brandSub")} homeLink onNavigate={onNavigate} />
      </div>

      <SidebarNav inReviewCount={inReviewCount} onNavigate={onNavigate} />

      <div className="mt-auto grid gap-3">
        <div className="flex items-center gap-2">
          <LocaleSwitcher className="min-w-0 flex-1" />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2.5 border-t border-border px-1.5 pt-3">
          <UserAvatar name={user.name} />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-medium" title={user.email}>
              {user.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">{t("Nav.role")}</div>
          </div>
          <form action={logout.bind(null, locale)}>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label={t("Nav.signOut")}
              title={t("Nav.signOut")}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" aria-hidden />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
