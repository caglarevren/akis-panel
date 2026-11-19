"use client";

import { ErrorView } from "@/app/components/shell/ErrorView";

// Catches what the app shell's own layout can't (for example the database
// being unreachable while the shell loads), so there is no sidebar here.
export default function LocaleError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} fullScreen />;
}
