import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ComingSoon } from "@/app/components/shell/ComingSoon";
import { PageHeader } from "@/app/components/shell/PageHeader";

export default async function OverviewPage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, t, format] = await Promise.all([auth(), getTranslations("Overview"), getFormatter()]);
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        eyebrow={format.dateTime(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        title={t("greeting", { name: firstName })}
      />
      <ComingSoon description={t("comingSoon")} />
    </>
  );
}
