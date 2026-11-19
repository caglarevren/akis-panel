import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { MobileTopBar } from "@/app/components/shell/MobileTopBar";
import { SidebarContent } from "@/app/components/shell/SidebarContent";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getInReviewCount } from "@/lib/db/contents";

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  // proxy.ts already guards these routes; this is a second line of defense
  // and gives the shell a typed user.
  const session = await auth();
  if (!session?.user?.name || !session.user.email) {
    return redirect({ href: "/login", locale });
  }
  const user = { name: session.user.name, email: session.user.email };
  const inReviewCount = await getInReviewCount();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card px-3.5 py-4 lg:flex">
        <SidebarContent user={user} inReviewCount={inReviewCount} />
      </aside>
      <div className="min-w-0">
        <MobileTopBar user={user} inReviewCount={inReviewCount} />
        <main className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
