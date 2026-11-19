"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { createContent, updateContent } from "@/app/actions/contents";
import { NativeSelect } from "@/app/components/shared/NativeSelect";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContentField, ContentFieldError, ContentFormOptions, SaveContentResult } from "@/app/types/content";
import { ContentType, type Platform } from "@/generated/prisma/enums";
import { PLATFORMS_BY_TYPE, defaultPlatformFor, isPlatformAllowed } from "@/lib/content-options";
import { CONTENT_LIMITS } from "@/lib/validation/content";
import type { SheetTarget } from "./ContentSheetProvider";

type Errors = Partial<Record<ContentField, ContentFieldError>>;
type Values = Record<ContentField, string>;
type Intent = "draft" | "review" | "save";

const TYPES = Object.values(ContentType);

const ERROR_KEYS: Record<ContentFieldError, string> = {
  required: "required",
  "too-long": "tooLong",
  invalid: "invalid",
  "inactive-client": "inactiveClient",
};

const INVALID_KEYS: Partial<Record<ContentField, string>> = {
  type: "invalidType",
  platform: "invalidPlatform",
  publishDate: "invalidDate",
  clientId: "invalidClient",
  assigneeId: "invalidAssignee",
};

function initialValues(target: SheetTarget, options: ContentFormOptions, fallbackAssignee: string): Values {
  if (target.mode === "edit") {
    const { content } = target;
    return {
      title: content.title,
      clientId: content.clientId,
      type: content.type,
      platform: content.platform,
      publishDate: content.publishDate ? content.publishDate.toISOString().slice(0, 10) : "",
      assigneeId: content.assigneeId,
      notes: content.notes ?? "",
    };
  }
  const preset = options.clients.find((client) => client.id === target.clientId && client.isActive);
  return {
    title: "",
    clientId: preset?.id ?? "",
    type: "SOCIAL_POST",
    platform: defaultPlatformFor("SOCIAL_POST"),
    publishDate: "",
    assigneeId: fallbackAssignee,
    notes: "",
  };
}

interface ContentFormProps {
  target: SheetTarget;
  options: ContentFormOptions;
  onDone: () => void;
}

export function ContentForm({ target, options, onDone }: ContentFormProps) {
  const t = useTranslations();
  const editing = target.mode === "edit" ? target.content : null;
  // Controlled so a failed save keeps what was typed (React 19 resets
  // uncontrolled fields after every form action).
  const [values, setValues] = useState<Values>(() => {
    const fallback = options.managers.some((manager) => manager.id === options.currentUserId)
      ? options.currentUserId
      : (options.managers[0]?.id ?? "");
    return initialValues(target, options, fallback);
  });
  const [errors, setErrors] = useState<Errors>({});
  const [intent, setIntent] = useState<Intent>("save");

  const save = editing ? updateContent.bind(null, editing.id) : createContent;
  const [state, formAction, pending] = useActionState(async (prev: SaveContentResult | null, formData: FormData) => {
    const result = await save(prev, formData);
    if (result.success) {
      const key = editing ? "toastSaved" : formData.get("intent") === "review" ? "toastCreatedReview" : "toastCreatedDraft";
      toast.success(t(`ContentForm.${key}`));
      onDone();
    } else {
      setErrors(result.fieldErrors ?? {});
      const first = Object.keys(result.fieldErrors ?? {})[0];
      if (first) document.getElementById(`content-${first}`)?.focus();
    }
    return result;
  }, null);

  function update(field: ContentField, value: string) {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Keep the platform valid for the chosen type.
      if (field === "type" && !isPlatformAllowed(value as ContentType, prev.platform as Platform)) {
        next.platform = defaultPlatformFor(value as ContentType);
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function message(field: ContentField): string | undefined {
    const error = errors[field];
    if (!error) return undefined;
    const key = error === "invalid" ? (INVALID_KEYS[field] ?? "required") : ERROR_KEYS[error];
    return t(`ContentForm.errors.${key}`);
  }

  const fieldProps = (field: ContentField) => ({
    id: `content-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `content-${field}-error` : undefined,
  });

  // Active clients, plus the item's own client if it has since become inactive.
  const clientOptions = options.clients.filter((client) => client.isActive || client.id === editing?.clientId);
  const platforms = PLATFORMS_BY_TYPE[values.type as ContentType] ?? [];
  const generalError = state && !state.success && state.error !== "validation" ? state.error : null;
  const generalKey = generalError === "unauthorized" ? "unauthorized" : generalError === "not-found" ? "notFound" : "server";

  return (
    <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="grid flex-1 content-start gap-4 overflow-y-auto px-6 py-4">
        {generalError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive">
            {t(`ContentForm.errors.${generalKey}`)}
          </p>
        )}

        <Field field="title" label={t("ContentForm.title")} error={message("title")}>
          <Input
            {...fieldProps("title")}
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder={t("ContentForm.titlePlaceholder")}
            maxLength={CONTENT_LIMITS.title}
            autoFocus
            className="h-9"
          />
        </Field>

        <Field field="clientId" label={t("ContentForm.client")} error={message("clientId")}>
          <NativeSelect {...fieldProps("clientId")} value={values.clientId} onChange={(event) => update("clientId", event.target.value)}>
            <option value="" disabled>
              {t("ContentForm.selectClient")}
            </option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
                {!client.isActive && ` ${t("ContentForm.inactiveSuffix")}`}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field field="type" label={t("ContentForm.type")} error={message("type")}>
            <NativeSelect {...fieldProps("type")} value={values.type} onChange={(event) => update("type", event.target.value)}>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`ContentType.${type}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field field="platform" label={t("ContentForm.platform")} error={message("platform")}>
            <NativeSelect {...fieldProps("platform")} value={values.platform} onChange={(event) => update("platform", event.target.value)}>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {t(`Platform.${platform}`)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field field="publishDate" label={t("ContentForm.publishDate")} optional={t("ContentForm.optional")} error={message("publishDate")}>
            <Input
              {...fieldProps("publishDate")}
              type="date"
              value={values.publishDate}
              onChange={(event) => update("publishDate", event.target.value)}
              className="h-9 font-mono"
            />
          </Field>
          <Field field="assigneeId" label={t("ContentForm.assignee")} error={message("assigneeId")}>
            <NativeSelect {...fieldProps("assigneeId")} value={values.assigneeId} onChange={(event) => update("assigneeId", event.target.value)}>
              {options.managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        <Field field="notes" label={t("ContentForm.notes")} optional={t("ContentForm.optional")} error={message("notes")}>
          <Textarea
            {...fieldProps("notes")}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder={t("ContentForm.notesPlaceholder")}
            maxLength={CONTENT_LIMITS.notes}
            rows={7}
            className="min-h-32 resize-y"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-6 py-4">
        <SheetClose render={<Button type="button" variant="ghost" className="h-9" />}>{t("ContentForm.cancel")}</SheetClose>
        {editing ? (
          <SubmitButton intent="save" pending={pending} active={intent} onPick={setIntent} primary label={t("ContentForm.saveChanges")} savingLabel={t("ContentForm.saving")} />
        ) : (
          <>
            <SubmitButton intent="draft" pending={pending} active={intent} onPick={setIntent} label={t("ContentForm.saveDraft")} savingLabel={t("ContentForm.saving")} />
            <SubmitButton intent="review" pending={pending} active={intent} onPick={setIntent} primary label={t("ContentForm.saveReview")} savingLabel={t("ContentForm.saving")} />
          </>
        )}
      </div>
    </form>
  );
}

interface SubmitButtonProps {
  intent: Intent;
  active: Intent;
  pending: boolean;
  primary?: boolean;
  label: string;
  savingLabel: string;
  onPick: (intent: Intent) => void;
}

function SubmitButton({ intent, active, pending, primary, label, savingLabel, onPick }: SubmitButtonProps) {
  const busy = pending && active === intent;
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={primary ? "default" : "outline"}
      disabled={pending}
      onClick={() => onPick(intent)}
      aria-label={busy ? savingLabel : undefined}
      className="h-9 px-3.5"
    >
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {label}
    </Button>
  );
}

interface FieldProps {
  field: ContentField;
  label: string;
  optional?: string;
  error?: string;
  children: ReactNode;
}

function Field({ field, label, optional, error, children }: FieldProps) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <Label htmlFor={`content-${field}`}>
        {label}
        {optional && <span className="font-normal text-subtle">· {optional}</span>}
      </Label>
      {children}
      {error && (
        <p id={`content-${field}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
