import { Hammer } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface ComingSoonProps {
  description: string;
}

// Temporary stand-in for screens built in later phases (Faz 4-7).
export async function ComingSoon({ description }: ComingSoonProps) {
  const t = await getTranslations("Placeholder");
  return (
    <div className="grid justify-items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-muted text-subtle">
        <Hammer className="size-5" aria-hidden />
      </span>
      <p className="font-medium">{t("title")}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
