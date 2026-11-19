import { useTranslations } from "next-intl";
import { PublishDay } from "@/app/components/content/PublishDay";
import { StatusBar } from "@/app/components/content/StatusBar";
import { UserAvatar } from "@/app/components/shell/UserAvatar";
import type { ClientListItem } from "@/app/types/client";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ClientAvatar } from "./ClientAvatar";

export function ClientCard({ client }: { client: ClientListItem }) {
  const t = useTranslations();

  return (
    <Link
      href={`/clients/${client.id}`}
      className={cn(
        "grid gap-[18px] rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,translate] hover:-translate-y-px hover:border-ring/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        !client.isActive && "opacity-75",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ClientAvatar name={client.name} color={client.brandColor} />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[15px] font-semibold tracking-tight">{client.name}</span>
            {!client.isActive && (
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t("Clients.inactiveBadge")}
              </span>
            )}
          </div>
          <div className="truncate text-[12.5px] text-muted-foreground">{client.sector ?? "—"}</div>
        </div>
      </div>

      <div className="grid gap-2.5">
        <StatusBar counts={client.statusCounts} label={t("Clients.statusBreakdown")} />
        <span className="justify-self-end text-xs text-subtle">{t("Clients.contentCount", { count: client.totalContents })}</span>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border pt-3 text-[12.5px]">
        <span className="flex min-w-0 items-center gap-2" title={t("Clients.owner")}>
          <UserAvatar name={client.ownerName} className="size-[18px] text-[8.5px]" />
          <span className="truncate">{client.ownerName}</span>
        </span>
        <span className="shrink-0 truncate text-muted-foreground">
          {client.nextPublishDate ? (
            <>
              {t("Clients.nextUpLabel")}: <PublishDay date={client.nextPublishDate} showOverdue={false} mono={false} />
            </>
          ) : (
            t("Clients.nothingScheduled")
          )}
        </span>
      </div>
    </Link>
  );
}
