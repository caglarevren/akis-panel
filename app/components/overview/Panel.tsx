import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: ReactNode;
  action?: { label: string; href: string };
  className?: string;
  children: ReactNode;
}

export function Panel({ title, action, className, children }: PanelProps) {
  return (
    <section className={cn("min-w-0 rounded-2xl border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-[12.5px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
          >
            {action.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

export function PanelEmpty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-subtle">{children}</p>;
}
