import { BRAND_INITIAL, BRAND_NAME } from "@/lib/brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  subtitle?: string;
  // When set, the mark links to the overview (used inside the app shell; the
  // sign-in page shows it as plain text).
  homeLink?: boolean;
  // Lets the mobile menu close itself when the mark is used to go home.
  onNavigate?: () => void;
}

export function BrandMark({ subtitle, homeLink = false, onNavigate }: BrandMarkProps) {
  const content = (
    <>
      <span className="grid size-8 place-items-center rounded-lg bg-foreground text-[15px] font-bold tracking-tight text-background">
        {BRAND_INITIAL}
      </span>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">{BRAND_NAME}</div>
        {/* muted (not subtle): on the sign-in page this sits on the tinted glow, where subtle drops under 4.5:1 */}
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </>
  );

  if (!homeLink) return <div className="flex items-center gap-2.5">{content}</div>;

  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "-m-1 flex w-fit items-center gap-2.5 rounded-lg p-1 outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/40",
      )}
    >
      {content}
    </Link>
  );
}
