import { ArrowRight, CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function OverdueBanner({ count }: { count: number }) {
  const t = useTranslations("Overview");
  if (count === 0) return null;

  return (
    <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-destructive/10 py-2.5 pr-2.5 pl-3.5 text-[13.5px] font-medium text-destructive">
      <CircleAlert className="size-[18px] shrink-0" aria-hidden />
      <span className="min-w-0 flex-[1_1_240px]">{t("overdue", { count })}</span>
      <Link
        href="/contents?overdue=1"
        className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-card px-2.5 text-[13px] font-medium text-destructive shadow-xs hover:bg-muted"
      >
        {t("show")}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
