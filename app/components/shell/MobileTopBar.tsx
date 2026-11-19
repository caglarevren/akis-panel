"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BrandMark } from "@/app/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent, type ShellUser } from "./SidebarContent";
import { ThemeToggle } from "./ThemeToggle";

interface MobileTopBarProps {
  user: ShellUser;
  inReviewCount: number;
}

export function MobileTopBar({ user, inReviewCount }: MobileTopBarProps) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-3 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button type="button" variant="outline" size="icon" aria-label={t("openMenu")} />}>
          <Menu className="size-[18px]" aria-hidden />
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="w-[min(18rem,86vw)] p-4 pt-5">
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <SheetClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("closeMenu")}
                className="absolute top-4 right-3 text-muted-foreground"
              />
            }
          >
            <X className="size-4" aria-hidden />
          </SheetClose>
          <SidebarContent user={user} inReviewCount={inReviewCount} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="min-w-0 flex-1">
        <BrandMark homeLink />
      </div>
      <ThemeToggle />
    </header>
  );
}
