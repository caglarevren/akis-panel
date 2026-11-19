import { useTranslations } from "next-intl";
import { PublishDay } from "@/app/components/content/PublishDay";
import { StatusBar } from "@/app/components/content/StatusBar";
import { UserAvatar } from "@/app/components/shell/UserAvatar";
import type { ClientListItem } from "@/app/types/client";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ClientAvatar } from "./ClientAvatar";
import { DeleteClientButton } from "./DeleteClientButton";

// The card is a container, not a link: the client's name is the link and is
// stretched over the whole card (after:inset-0), so the delete button can sit
// on top as its own control instead of nesting a button inside an anchor.
export function ClientCard({ client }: { client: ClientListItem }) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "relative grid gap-[18px] rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,translate] hover:-translate-y-px hover:border-ring/30 hover:shadow-md has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        !client.isActive && "opacity-75",
      )}
    >
      <div className="absolute top-3 right-3 z-10">
        <DeleteClientButton client={{ id: client.id, name: client.name }} contentCount={client.totalContents} variant="icon" />
      </div>

      <div className="flex min-w-0 items-center gap-3 pr-8">
        <ClientAvatar name={client.name} color={client.brandColor} />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={`/clients/${client.id}`}
              className="truncate text-[15px] font-semibold tracking-tight outline-none after:absolute after:inset-0 after:rounded-2xl"
            >
              {client.name}
            </Link>
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
    </div>
  );
}
