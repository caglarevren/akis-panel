import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/app/components/shell/ComingSoon";
import { PageHeader } from "@/app/components/shell/PageHeader";

export async function generateMetadata({ params }: PageProps<"/[locale]/contents">): Promise<Metadata> {
  const { locale } = await params;
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace: "Contents" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${t("title")} · ${meta("title")}` };
}

export default async function ContentsPage({ params }: PageProps<"/[locale]/contents">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contents");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ComingSoon description={t("comingSoon")} />
    </>
  );
}
