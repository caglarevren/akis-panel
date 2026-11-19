import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-2xl border border-border bg-card px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-muted text-subtle">
        <Icon className="size-5" aria-hidden />
      </span>
      {title && <p className="font-medium">{title}</p>}
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
