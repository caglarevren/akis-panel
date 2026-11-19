import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="grid max-w-md justify-items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-muted text-subtle">
          <FileQuestion className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-balance">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <Link href="/" className={cn(buttonVariants(), "mt-2 h-9 px-3.5")}>
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
