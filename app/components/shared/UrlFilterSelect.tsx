"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { NativeSelect } from "./NativeSelect";

interface UrlFilterSelectProps {
  param: string;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
}

// A select whose value is a URL search param; choosing "all" removes it.
export function UrlFilterSelect({ param, label, allLabel, options }: UrlFilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const value = searchParams.get(param) ?? "";

  function select(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(param, next);
    else params.delete(param);
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <label className="min-w-0 flex-[1_1_150px] sm:flex-[0_1_200px]">
      <span className="sr-only">{label}</span>
      <NativeSelect
        value={options.some((option) => option.value === value) ? value : ""}
        onChange={(event) => select(event.target.value)}
        aria-busy={isPending || undefined}
        className="bg-card"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
