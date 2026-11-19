import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import { BrandMark } from "@/app/components/layout/BrandMark";
import { LocaleSwitcher } from "@/app/components/layout/LocaleSwitcher";
import { Button } from "@/components/ui/button";

// Faz 0 placeholder: proves the authenticated, localized route works.
// The real overview screen and app shell arrive in Faz 3 and Faz 7.
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, t] = await Promise.all([auth(), getTranslations()]);
  const name = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4">
      <header className="flex items-center justify-between py-5">
        <BrandMark subtitle={t("Common.brandSub")} />
        <LocaleSwitcher />
      </header>
      <main className="flex flex-1 flex-col justify-center pb-24">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{t("Home.greeting", { name })}</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">{t("Home.description")}</p>
        <form action={logout.bind(null, locale)} className="mt-8">
          <Button type="submit" variant="outline">
            {t("Home.signOut")}
          </Button>
        </form>
      </main>
    </div>
  );
}
