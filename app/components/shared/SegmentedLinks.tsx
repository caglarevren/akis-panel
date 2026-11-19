import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface SegmentItem {
  key: string;
  label: string;
  count: number;
  href: string;
  icon?: ReactNode;
}

interface SegmentedLinksProps {
  items: SegmentItem[];
  activeKey: string;
  label: string;
}

// Filter tabs as plain links, so the selection lives in the URL and works
// without client JavaScript.
export function SegmentedLinks({ items, activeKey, label }: SegmentedLinksProps) {
  return (
    <nav
      aria-label={label}
      className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[10px] border border-border bg-muted p-[3px] [scrollbar-width:none]"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              active && "bg-card text-foreground shadow-xs",
            )}
          >
            {item.icon}
            {item.label}
            <span className="font-mono text-[11px] text-subtle">{item.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
