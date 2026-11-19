import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toLocaleUpperCase("tr");
}

export function UserAvatar({ name, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold tracking-wide text-primary",
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
