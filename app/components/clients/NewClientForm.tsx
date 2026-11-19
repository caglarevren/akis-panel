"use client";

import { Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState, type CSSProperties, type ReactNode } from "react";
import { toast } from "sonner";
import { createClient } from "@/app/actions/clients";
import { NativeSelect } from "@/app/components/shared/NativeSelect";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountManagerOption, ClientField, ClientFieldError, CreateClientResult } from "@/app/types/client";
import { useRouter } from "@/i18n/navigation";
import { BRAND_COLORS } from "@/lib/brand-colors";
import { CLIENT_LIMITS } from "@/lib/validation/client";

type Errors = Partial<Record<ClientField, ClientFieldError>>;
type TextField = Exclude<ClientField, "brandColor">;

const INVALID_KEYS: Partial<Record<ClientField, string>> = {
  contactEmail: "invalidEmail",
  contactPhone: "invalidPhone",
  ownerId: "invalidOwner",
  brandColor: "invalidColor",
};

interface NewClientFormProps {
  managers: AccountManagerOption[];
  currentUserId: string;
  onDone: () => void;
}

export function NewClientForm({ managers, currentUserId, onDone }: NewClientFormProps) {
  const t = useTranslations("ClientForm");
  const router = useRouter();
  // Controlled: React 19 resets uncontrolled fields after every form action,
  // which would wipe the form on a validation error.
  const [values, setValues] = useState<Record<TextField, string>>({
    name: "",
    sector: "",
    ownerId: managers.some((manager) => manager.id === currentUserId) ? currentUserId : (managers[0]?.id ?? ""),
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [brandColor, setBrandColor] = useState<string>(BRAND_COLORS[0]);
  const [errors, setErrors] = useState<Errors>({});

  const [state, formAction, pending] = useActionState(
    async (prev: CreateClientResult | null, formData: FormData) => {
      const result = await createClient(prev, formData);
      if (result.success) {
        toast.success(t("created", { name: values.name.trim() }));
        onDone();
        router.push(`/clients/${result.data.id}`);
      } else {
        setErrors(result.fieldErrors ?? {});
        const firstInvalid = Object.keys(result.fieldErrors ?? {})[0];
        if (firstInvalid) document.getElementById(`client-${firstInvalid}`)?.focus();
      }
      return result;
    },
    null,
  );

  function update(field: TextField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function message(field: ClientField): string | undefined {
    const error = errors[field];
    if (!error) return undefined;
    if (error === "invalid") return t(`errors.${INVALID_KEYS[field] ?? "required"}`);
    return t(`errors.${error === "too-long" ? "tooLong" : error}`);
  }

  const textField = (field: TextField, options: { type?: string; inputMode?: "email" | "tel"; placeholder?: string; optional?: boolean; maxLength: number }) => (
    <Field id={`client-${field}`} label={t(field)} optional={options.optional} optionalLabel={t("optional")} error={message(field)}>
      <Input
        id={`client-${field}`}
        name={field}
        type={options.type ?? "text"}
        inputMode={options.inputMode}
        value={values[field]}
        onChange={(event) => update(field, event.target.value)}
        placeholder={options.placeholder}
        maxLength={options.maxLength}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? `client-${field}-error` : undefined}
        className="h-9"
      />
    </Field>
  );

  const generalError = state && !state.success && state.error !== "validation" ? state.error : null;

  return (
    <form action={formAction} noValidate>
      <div className="grid gap-4 px-6 py-5">
        {generalError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            {t(generalError === "unauthorized" ? "errors.unauthorized" : "errors.server")}
          </p>
        )}
        {textField("name", { placeholder: t("namePlaceholder"), maxLength: CLIENT_LIMITS.name })}
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("sector", { placeholder: t("sectorPlaceholder"), optional: true, maxLength: CLIENT_LIMITS.sector })}
          <Field id="client-ownerId" label={t("owner")} error={message("ownerId")}>
            <NativeSelect
              id="client-ownerId"
              name="ownerId"
              value={values.ownerId}
              onChange={(event) => update("ownerId", event.target.value)}
              aria-invalid={errors.ownerId ? true : undefined}
            >
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        {textField("contactName", { optional: true, maxLength: CLIENT_LIMITS.contactName })}
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("contactEmail", { type: "email", inputMode: "email", optional: true, maxLength: CLIENT_LIMITS.contactEmail })}
          {textField("contactPhone", { type: "tel", inputMode: "tel", optional: true, maxLength: CLIENT_LIMITS.contactPhone })}
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-medium">{t("brandColor")}</legend>
          <div className="flex flex-wrap gap-2">
            {BRAND_COLORS.map((color, index) => (
              <label key={color} className="relative cursor-pointer" title={t("colorOption", { index: index + 1 })}>
                <input
                  type="radio"
                  name="brandColor"
                  value={color}
                  checked={brandColor === color}
                  onChange={() => setBrandColor(color)}
                  className="peer sr-only"
                  aria-label={t("colorOption", { index: index + 1 })}
                />
                <span
                  style={{ "--brand": color } as CSSProperties}
                  className="grid size-7 place-items-center rounded-lg bg-(--brand) text-white ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                >
                  {brandColor === color && <Check className="size-3.5" aria-hidden />}
                </span>
              </label>
            ))}
          </div>
          {message("brandColor") && <p className="text-xs text-destructive">{message("brandColor")}</p>}
        </fieldset>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
        <DialogClose render={<Button type="button" variant="ghost" className="h-9" />}>{t("cancel")}</DialogClose>
        <Button type="submit" disabled={pending} className="h-9 px-3.5" aria-label={pending ? t("submitting") : undefined}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, optional, optionalLabel, error, children }: FieldProps) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="font-normal text-subtle">· {optionalLabel}</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
