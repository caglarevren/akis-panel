import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { MobileTopBar } from "@/app/components/shell/MobileTopBar";
import { SidebarContent } from "@/app/components/shell/SidebarContent";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ContentSheetProvider } from "@/app/components/content/ContentSheetProvider";
import { getContentFormOptions, getInReviewCount } from "@/lib/db/contents";

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // proxy.ts already guards these routes; this is a second line of defense
  // and gives the shell a typed user.
  const session = await auth();
  if (!session?.user?.id || !session.user.name || !session.user.email) {
    return redirect({ href: "/login", locale });
  }
  const user = { name: session.user.name, email: session.user.email };
  const [inReviewCount, contentFormOptions, t] = await Promise.all([
    getInReviewCount(),
    getContentFormOptions(session.user.id),
    getTranslations("Nav"),
  ]);

  return (
    <ContentSheetProvider options={contentFormOptions}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-3.5 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        {t("skipToContent")}
      </a>
      <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card px-3.5 py-4 lg:flex">
          <SidebarContent user={user} inReviewCount={inReviewCount} />
        </aside>
        <div className="min-w-0">
          <MobileTopBar user={user} inReviewCount={inReviewCount} />
          <main id="main-content" tabIndex={-1} className="mx-auto w-full outline-none max-w-[1240px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
        </div>
      </div>
    </ContentSheetProvider>
  );
}
