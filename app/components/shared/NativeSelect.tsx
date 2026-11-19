import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Styled native <select>: full keyboard and screen-reader support, and the
// OS picker on phones, which suits short option lists.
export function NativeSelect({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select
        {...props}
        className={cn(
          "h-9 w-full cursor-pointer appearance-none rounded-lg border border-input bg-transparent pr-8 pl-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
          className,
        )}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-1.5 -translate-y-3/4 rotate-45 border-r-[1.5px] border-b-[1.5px] border-muted-foreground"
      />
    </span>
  );
}
