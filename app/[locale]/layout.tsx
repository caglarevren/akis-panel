import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/app/components/layout/ThemeProvider";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
