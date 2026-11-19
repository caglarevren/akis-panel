"use client";

import { FileText, House, Users, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: "/" | "/clients" | "/contents";
  labelKey: "overview" | "clients" | "contents";
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "overview", icon: House },
  { href: "/clients", labelKey: "clients", icon: Users },
  { href: "/contents", labelKey: "contents", icon: FileText },
];

function isActive(pathname: string, href: NavItem["href"]): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarNavProps {
  inReviewCount: number;
  onNavigate?: () => void;
}

export function SidebarNav({ inReviewCount, onNavigate }: SidebarNavProps) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="grid gap-0.5">
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-muted text-foreground",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} aria-hidden />
            <span className="truncate">{t(labelKey)}</span>
            {labelKey === "contents" && inReviewCount > 0 && (
              <span
                title={t("inReview", { count: inReviewCount })}
                className="ml-auto rounded-md bg-status-review-bg px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium text-status-review"
              >
                {inReviewCount}
                <span className="sr-only">: {t("inReview", { count: inReviewCount })}</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
