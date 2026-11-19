"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface ErrorViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  // true when there is no app shell around it (errors thrown by the layout).
  fullScreen?: boolean;
}

export function ErrorView({ error, reset, fullScreen = false }: ErrorViewProps) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className={cn("grid place-items-center px-4", fullScreen ? "min-h-dvh" : "py-24")}>
      <div className="grid max-w-md justify-items-center gap-3 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-semibold tracking-tight text-balance">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        {error.digest && (
          <p className="font-mono text-xs text-subtle">
            {t("reference")}: {error.digest}
          </p>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset} className="h-9 px-3.5">
            <RefreshCw className="size-4" aria-hidden />
            {t("retry")}
          </Button>
          <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-9 px-3.5")}>
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
