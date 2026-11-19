import type { StatusCounts } from "@/app/types/client";
import { cn } from "@/lib/utils";
import { STATUS_ORDER, STATUS_STYLES } from "./status-styles";

interface StatusBarProps {
  counts: StatusCounts;
  label: string;
  className?: string;
}

// Proportional stacked bar. Widths are data, so they're set inline.
export function StatusBar({ counts, label, className }: StatusBarProps) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
  return (
    <div role="img" aria-label={label} className={cn("flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted", className)}>
      {total > 0 &&
        STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => (
          <span key={status} className={cn("min-w-[3px]", STATUS_STYLES[status].dot)} style={{ flexGrow: counts[status] }} />
        ))}
    </div>
  );
}
