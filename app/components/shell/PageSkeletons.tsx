import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholders shaped like the real screens, shown by loading.tsx while a
// page's data is fetched. They announce "Loading" once instead of pulsing
// silently.
function Region({ children }: { children: ReactNode }) {
  const t = useTranslations("Common");
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      {children}
    </div>
  );
}

function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-48" />
      </div>
      {action && <Skeleton className="h-9 w-32 rounded-lg" />}
    </div>
  );
}

function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-9 rounded-none" />
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="size-[30px] shrink-0 rounded-lg" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-4 w-3/5 max-w-sm" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <Skeleton className="h-9 w-full max-w-[340px] rounded-lg" />
      <Skeleton className="h-9 w-56 rounded-[10px]" />
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <Region>
      <HeaderSkeleton />
      <div className="grid gap-[18px]">
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-2 rounded-full" />
        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Skeleton className="h-80 rounded-2xl lg:row-span-2" />
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </Region>
  );
}

export function ClientsSkeleton() {
  return (
    <Region>
      <HeaderSkeleton />
      <ToolbarSkeleton />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-[178px] rounded-2xl" />
        ))}
      </div>
    </Region>
  );
}

export function ContentsSkeleton() {
  return (
    <Region>
      <HeaderSkeleton />
      <ToolbarSkeleton />
      <RowsSkeleton />
    </Region>
  );
}

export function ClientDetailSkeleton() {
  return (
    <Region>
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-6 h-44 rounded-2xl" />
      <Skeleton className="mb-3 h-5 w-28" />
      <Skeleton className="mb-3 h-9 w-72 max-w-full rounded-[10px]" />
      <RowsSkeleton rows={4} />
    </Region>
  );
}
