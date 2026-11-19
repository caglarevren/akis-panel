import type { CSSProperties } from "react";
import { initialsOf } from "@/app/components/shell/UserAvatar";
import { cn } from "@/lib/utils";

interface ClientAvatarProps {
  name: string;
  color: string;
  size?: "md" | "lg";
}

// Initials on the client's brand color. The color is user data, so it is
// passed as a CSS variable (the one inline-style exception in the codebase).
export function ClientAvatar({ name, color, size = "md" }: ClientAvatarProps) {
  return (
    <span
      aria-hidden
      style={{ "--brand": color } as CSSProperties}
      className={cn(
        "grid shrink-0 place-items-center bg-(--brand) font-semibold tracking-wide text-white",
        size === "md" ? "size-10 rounded-[10px] text-sm" : "size-13 rounded-[13px] text-[17px]",
      )}
    >
      {initialsOf(name.replace(/^(Dr\.|Av\.)\s*/, ""))}
    </span>
  );
}

export function BrandSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{ "--brand": color } as CSSProperties}
      className="inline-block size-[9px] shrink-0 rounded-[3px] bg-(--brand)"
    />
  );
}
