import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BrandMark } from "@/app/components/layout/BrandMark";
import { LocaleSwitcher } from "@/app/components/layout/LocaleSwitcher";
import { LoginForm } from "@/app/components/auth/LoginForm";
import { ThemeToggle } from "@/app/components/shell/ThemeToggle";
import { routing } from "@/i18n/routing";
import { DEMO_ACCOUNT } from "@/lib/demo-account";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace: "Login" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${t("title")} · ${meta("title")}` };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const [{ callbackUrl }, t] = await Promise.all([searchParams, getTranslations()]);

  return (
    <div className="auth-backdrop flex min-h-dvh flex-col px-4">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between py-5">
        <BrandMark subtitle={t("Common.brandSub")} />
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center pb-24">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{t("Login.title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("Login.description")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-(--auth-card) p-6 shadow-lg shadow-black/5">
            <LoginForm
              locale={locale}
              callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined}
              demo={{ username: DEMO_ACCOUNT.username, password: DEMO_ACCOUNT.password }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
