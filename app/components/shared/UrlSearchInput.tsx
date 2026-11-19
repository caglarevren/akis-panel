"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 250;

interface UrlSearchInputProps {
  label: string;
  placeholder: string;
}

// Keeps `?q=` in the URL in sync with the input, debounced, so the server
// component re-renders the filtered list and the search survives reloads.
export function UrlSearchInput({ label, placeholder }: UrlSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";
  const [value, setValue] = useState(current);
  const [syncedQuery, setSyncedQuery] = useState(current);
  const [isPending, startTransition] = useTransition();

  // The URL can change from outside the input (a "clear search" link, back
  // button). Adopt the new query during render instead of re-applying the
  // stale input value.
  if (current !== syncedQuery) {
    setSyncedQuery(current);
    // Our own debounced write only trims; keep what the user is typing.
    if (current.trim() !== value.trim()) setValue(current);
  }

  useEffect(() => {
    if (value.trim() === current.trim()) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      const query = params.toString();
      startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, current, pathname, router, searchParams]);

  return (
    <label className="relative flex min-w-0 flex-[1_1_240px] items-center sm:max-w-[340px]">
      <Search className="pointer-events-none absolute left-3 size-4 text-subtle" aria-hidden />
      <span className="sr-only">{label}</span>
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-busy={isPending || undefined}
        className="h-9 bg-card pl-9"
      />
    </label>
  );
}
