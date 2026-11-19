"use client";

import { ErrorView } from "@/app/components/shell/ErrorView";

// A failing page keeps the sidebar; only the content area shows the error.
export default function AppError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} />;
}
