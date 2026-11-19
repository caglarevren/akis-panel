import type { Metadata } from "next";
import { FileText, SearchX, X } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ContentList } from "@/app/components/content/ContentList";
import { NewContentButton } from "@/app/components/content/NewContentButton";
import { StatusDot } from "@/app/components/content/StatusPill";
import { STATUS_ORDER } from "@/app/components/content/status-styles";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SegmentedLinks } from "@/app/components/shared/SegmentedLinks";
import { UrlFilterSelect } from "@/app/components/shared/UrlFilterSelect";
import { UrlSearchInput } from "@/app/components/shared/UrlSearchInput";
import { PageHeader } from "@/app/components/shell/PageHeader";
import { ContentType } from "@/generated/prisma/enums";
import { Link } from "@/i18n/navigation";
import { EMPTY_FILTERS, filtersToQuery, hasActiveFilters, parseContentFilters, type ContentFilters } from "@/lib/content-filters";
import { getClientOptions } from "@/lib/db/clients";
import { getContentList } from "@/lib/db/contents";

export async function generateMetadata({ params }: PageProps<"/[locale]/contents">): Promise<Metadata> {
  const { locale } = await params;
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace: "Contents" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${t("title")} · ${meta("title")}` };
}

const href = (filters: ContentFilters, changes: Partial<ContentFilters> = {}) => `/contents${filtersToQuery(filters, changes)}`;

export default async function ContentsPage({ params, searchParams }: PageProps<"/[locale]/contents">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const filters = parseContentFilters(await searchParams);
  const [{ items, statusCounts }, clients, t] = await Promise.all([
    getContentList(filters),
    getClientOptions(),
    getTranslations(),
  ]);
  const filtered = hasActiveFilters(filters);
  const allCount = STATUS_ORDER.reduce((sum, status) => sum + statusCounts[status], 0);
  const chips = [
    filters.dueWeek && { key: "due", label: t("ContentFilters.dueWeek"), href: href(filters, { dueWeek: false }) },
    filters.overdue && { key: "overdue", label: t("ContentFilters.overdue"), href: href(filters, { overdue: false }) },
  ].filter((chip) => chip !== false);

  return (
    <>
      <PageHeader title={t("Contents.title")} description={t("Contents.description")} actions={<NewContentButton />} />

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Suspense>
          <UrlSearchInput label={t("ContentFilters.searchLabel")} placeholder={t("ContentFilters.searchPlaceholder")} />
        </Suspense>
        <SegmentedLinks
          label={t("ContentFilters.statusLabel")}
          activeKey={filters.status ?? "all"}
          items={[
            { key: "all", label: t("ContentFilters.all"), count: allCount, href: href(filters, { status: null }) },
            ...STATUS_ORDER.map((status) => ({
              key: status,
              label: t(`Status.${status}`),
              count: statusCounts[status],
              href: href(filters, { status }),
              icon: <StatusDot status={status} />,
            })),
          ]}
        />
        <Suspense>
          <UrlFilterSelect
            param="type"
            label={t("ContentFilters.typeLabel")}
            allLabel={t("ContentFilters.allTypes")}
            options={Object.values(ContentType).map((type) => ({ value: type, label: t(`ContentType.${type}`) }))}
          />
          <UrlFilterSelect
            param="client"
            label={t("ContentFilters.clientLabel")}
            allLabel={t("ContentFilters.allClients")}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
          />
        </Suspense>
      </div>

      <div className="mb-3 flex min-h-7 flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            scroll={false}
            aria-label={t("ContentFilters.remove", { name: chip.label })}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-soft pr-1.5 pl-2.5 text-[12.5px] font-medium text-primary hover:bg-primary-soft/70"
          >
            {chip.label}
            <X className="size-3.5" aria-hidden />
          </Link>
        ))}
        {filtered && (
          <Link
            href="/contents"
            scroll={false}
            className="px-1 text-[12.5px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
          >
            {t("ContentFilters.clear")}
          </Link>
        )}
        <span className="ml-auto text-[12.5px] text-subtle">{t("ContentFilters.count", { count: items.length })}</span>
      </div>

      {items.length > 0 ? (
        <ContentList contents={items} showClient />
      ) : filtered ? (
        <EmptyState
          icon={SearchX}
          description={t("ContentFilters.noResults")}
          action={
            <Link href={href(EMPTY_FILTERS)} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              {t("ContentFilters.clear")}
            </Link>
          }
        />
      ) : (
        <EmptyState icon={FileText} title={t("Contents.emptyTitle")} description={t("Contents.emptyDescription")} />
      )}
    </>
  );
}
