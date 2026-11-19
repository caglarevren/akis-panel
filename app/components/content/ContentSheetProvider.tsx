"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ContentFormOptions, ContentListItem } from "@/app/types/content";
import { ContentSheet } from "./ContentSheet";

export type SheetTarget = { mode: "new"; clientId?: string } | { mode: "edit"; content: ContentListItem };

interface ContentSheetContextValue {
  openNew: (clientId?: string) => void;
  openEdit: (content: ContentListItem) => void;
  hasActiveClients: boolean;
}

const ContentSheetContext = createContext<ContentSheetContextValue | null>(null);

export function useContentSheet(): ContentSheetContextValue {
  const context = useContext(ContentSheetContext);
  if (!context) throw new Error("useContentSheet must be used inside ContentSheetProvider");
  return context;
}

interface ContentSheetProviderProps {
  options: ContentFormOptions;
  children: ReactNode;
}

// Mounted once in the panel layout so any list or button can open the same
// sheet. `session` changes on every opening, which remounts the form and
// starts it from the target's values.
export function ContentSheetProvider({ options, children }: ContentSheetProviderProps) {
  const [target, setTarget] = useState<SheetTarget | null>(null);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  const show = useCallback((next: SheetTarget) => {
    setTarget(next);
    setSession((value) => value + 1);
    setOpen(true);
  }, []);

  const value = useMemo<ContentSheetContextValue>(
    () => ({
      openNew: (clientId) => show({ mode: "new", clientId }),
      openEdit: (content) => show({ mode: "edit", content }),
      hasActiveClients: options.clients.some((client) => client.isActive),
    }),
    [show, options.clients],
  );

  return (
    <ContentSheetContext.Provider value={value}>
      {children}
      <ContentSheet open={open} onOpenChange={setOpen} target={target} session={session} options={options} />
    </ContentSheetContext.Provider>
  );
}
