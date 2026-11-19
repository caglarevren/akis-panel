import type { Metadata } from "next";
import { ChevronLeft, FileText, Mail, Phone, User, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ClientAvatar } from "@/app/components/clients/ClientAvatar";
import { ClientContentList } from "@/app/components/clients/ClientContentList";
import { StatusDot } from "@/app/components/content/StatusPill";
import { STATUS_ORDER } from "@/app/components/content/status-styles";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { SegmentedLinks } from "@/app/components/shared/SegmentedLinks";
import type { ContentStatus } from "@/generated/prisma/enums";
import { Link } from "@/i18n/navigation";
import { getClientDetail } from "@/lib/db/clients";

function parseStatus(value: string | string[] | undefined): ContentStatus | "all" {
  return STATUS_ORDER.find((status) => status === value) ?? "all";
}

export async function generateMetadata({ params }: PageProps<"/[locale]/clients/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const [client, t, meta] = await Promise.all([
    getClientDetail(id),
    getTranslations({ locale, namespace: "ClientDetail" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return { title: `${client?.name ?? t("notFound")} · ${meta("title")}` };
}

export default async function ClientDetailPage({ params, searchParams }: PageProps<"/[locale]/clients/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const [client, query, t] = await Promise.all([getClientDetail(id), searchParams, getTranslations()]);

  const back = (
    <Link href="/clients" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" aria-hidden />
      {t("ClientDetail.back")}
    </Link>
  );

  if (!client) {
    return (
      <>
        {back}
        <EmptyState icon={Users} title={t("ClientDetail.notFound")} description={t("ClientDetail.notFoundDescription")} />
      </>
    );
  }

  const status = parseStatus(query.status);
  const counts = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, client.contents.filter((content) => content.status === s).length]),
  ) as Record<ContentStatus, number>;
  const visible = status === "all" ? client.contents : client.contents.filter((content) => content.status === status);
  const tabHref = (key: ContentStatus | "all") => (key === "all" ? `/clients/${client.id}` : `/clients/${client.id}?status=${key}`);

  return (
    <>
      {back}
      <section className="mb-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex min-w-0 items-center gap-4">
          <ClientAvatar name={client.name} color={client.brandColor} size="lg" />
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-[22px] leading-tight font-semibold tracking-tight sm:text-[26px]">
              <span className="min-w-0 break-words">{client.name}</span>
              {!client.isActive && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {t("Clients.inactiveBadge")}
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-muted-foreground">{client.sector ?? "—"}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem icon={<User className="size-3.5" />} label={t("ClientDetail.contactName")} value={client.contactName} />
          <InfoItem icon={<Mail className="size-3.5" />} label={t("ClientDetail.contactEmail")} value={client.contactEmail} />
          <InfoItem icon={<Phone className="size-3.5" />} label={t("ClientDetail.contactPhone")} value={client.contactPhone} mono />
          <InfoItem icon={<Users className="size-3.5" />} label={t("ClientDetail.owner")} value={client.ownerName} />
        </dl>
      </section>

      <h2 className="mb-3 text-base font-semibold tracking-tight">{t("ClientDetail.contents")}</h2>
      {client.contents.length === 0 ? (
        <EmptyState icon={FileText} description={t("ClientDetail.emptyContents")} />
      ) : (
        <>
          <div className="mb-3">
            <SegmentedLinks
              label={t("ClientDetail.statusTabs")}
              activeKey={status}
              items={[
                { key: "all", label: t("ClientDetail.all"), count: client.contents.length, href: tabHref("all") },
                ...STATUS_ORDER.map((s) => ({
                  key: s,
                  label: t(`Status.${s}`),
                  count: counts[s],
                  href: tabHref(s),
                  icon: <StatusDot status={s} />,
                })),
              ]}
            />
          </div>
          {visible.length > 0 ? (
            <ClientContentList contents={visible} />
          ) : (
            <EmptyState icon={FileText} description={t("ClientDetail.emptyTab")} />
          )}
        </>
      )}
    </>
  );
}

interface InfoItemProps {
  icon: ReactNode;
  label: string;
  value: string | null;
  mono?: boolean;
}

function InfoItem({ icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="min-w-0">
      <dt className="mb-1 flex items-center gap-1.5 text-xs text-subtle">
        <span aria-hidden>{icon}</span>
        {label}
      </dt>
      <dd className={mono ? "font-mono text-sm font-medium break-words" : "font-medium break-words"}>{value ?? "—"}</dd>
    </div>
  );
}
