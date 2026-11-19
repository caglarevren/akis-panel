import type { Metadata } from "next";
import { SearchX, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { auth } from "@/auth";
import { ClientCard } from "@/app/components/clients/ClientCard";
import { NewClientDialog } from "@/app/components/clients/NewClientDialog";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SegmentedLinks } from "@/app/components/shared/SegmentedLinks";
import { UrlSearchInput } from "@/app/components/shared/UrlSearchInput";
import { PageHeader } from "@/app/components/shell/PageHeader";
import type { ClientStatusFilter } from "@/app/types/client";
import { Link } from "@/i18n/navigation";
import { getClientList } from "@/lib/db/clients";
import { getAccountManagers } from "@/lib/db/users";

const FILTERS: ClientStatusFilter[] = ["all", "active", "inactive"];

function parseFilter(value: string | string[] | undefined): ClientStatusFilter {
  return FILTERS.find((filter) => filter === value) ?? "all";
}

function listHref(q: string, status: ClientStatusFilter): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `/clients?${query}` : "/clients";
}

export async function generateMetadata({ params }: PageProps<"/[locale]/clients">): Promise<Metadata> {
  const { locale } = await params;
  const [t, meta] = await Promise.all([
    getTranslations({ locale, namespace: "Clients" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${t("title")} · ${meta("title")}` };
}

export default async function ClientsPage({ params, searchParams }: PageProps<"/[locale]/clients">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const status = parseFilter(query.status);

  const [list, managers, session, t] = await Promise.all([
    getClientList({ q, status }),
    getAccountManagers(),
    auth(),
    getTranslations("Clients"),
  ]);

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<NewClientDialog managers={managers} currentUserId={session?.user?.id ?? ""} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <Suspense>
          <UrlSearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} />
        </Suspense>
        <SegmentedLinks
          label={t("filterLabel")}
          activeKey={status}
          items={FILTERS.map((filter) => ({
            key: filter,
            label: t(`filters.${filter}`),
            count: list.filterCounts[filter],
            href: listHref(q, filter),
          }))}
        />
      </div>

      {list.clients.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-4">
          {list.clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : q ? (
        <EmptyState
          icon={SearchX}
          description={list.filterCounts.all === 0 ? t("noResults") : t("noResultsInFilter")}
          action={
            <Link href={listHref("", status)} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              {t("clearSearch")}
            </Link>
          }
        />
      ) : list.filterCounts.all === 0 ? (
        <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <EmptyState icon={Users} description={t("noResultsInFilter")} />
      )}
    </>
  );
}
