interface BrandMarkProps {
  subtitle?: string;
}

export function BrandMark({ subtitle }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-foreground text-[15px] font-bold tracking-tight text-background">
        A
      </span>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">Akış</div>
        {subtitle && <div className="text-xs text-subtle">{subtitle}</div>}
      </div>
    </div>
  );
}
