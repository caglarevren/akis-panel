"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginError, LoginState } from "@/app/types/auth";

const INITIAL_STATE: LoginState = { success: false };

const ERROR_KEYS: Record<LoginError, "errorMissingFields" | "errorInvalidCredentials" | "errorServer"> = {
  "missing-fields": "errorMissingFields",
  "invalid-credentials": "errorInvalidCredentials",
  "server-error": "errorServer",
};

interface LoginFormProps {
  locale: string;
  callbackUrl?: string;
}

export function LoginForm({ locale, callbackUrl }: LoginFormProps) {
  const t = useTranslations("Login");
  const [state, formAction, pending] = useActionState(login, INITIAL_STATE);
  // Controlled so React 19's automatic form reset after the action doesn't
  // clear the username on a failed attempt. The password is left uncontrolled
  // on purpose: it should be cleared.
  const [identifier, setIdentifier] = useState("");

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

      {state.error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
          {t(ERROR_KEYS[state.error])}
        </p>
      )}

      <div className="grid gap-2">
        <Label htmlFor="identifier">{t("identifier")}</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t("identifierPlaceholder")}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          aria-invalid={state.error === "missing-fields" && !identifier.trim() ? true : undefined}
          className="h-10"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          aria-invalid={state.error ? true : undefined}
          className="h-10"
        />
      </div>

      <Button type="submit" disabled={pending} className="h-10 w-full" aria-label={pending ? t("submitting") : undefined}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {t("submit")}
      </Button>
    </form>
  );
}
