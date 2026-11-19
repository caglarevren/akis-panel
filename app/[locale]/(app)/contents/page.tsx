import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContentList } from "@/app/components/content/ContentList";
import { NewContentButton } from "@/app/components/content/NewContentButton";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { getContentList } from "@/lib/db/contents";

export async function generateMetadata({ params }: PageProps<"/[locale]/contents">): Promise<Metadata> {
  const { locale } = await params;
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace: "Contents" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${t("title")} · ${meta("title")}` };
}

// Filters, search and status changes from the list arrive in Faz 6.
export default async function ContentsPage({ params }: PageProps<"/[locale]/contents">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [contents, t] = await Promise.all([getContentList(), getTranslations("Contents")]);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} actions={<NewContentButton />} />
      {contents.length > 0 ? (
        <ContentList contents={contents} showClient />
      ) : (
        <EmptyState icon={FileText} title={t("emptyTitle")} description={t("emptyDescription")} />
      )}
    </>
  );
}
