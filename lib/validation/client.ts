import { isBrandColor } from "@/lib/brand-colors";
import type { ClientField, ClientFieldError, ClientInput } from "@/app/types/client";

export const CLIENT_LIMITS = {
  name: 80,
  sector: 60,
  contactName: 80,
  contactEmail: 120,
  contactPhone: 30,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+\d][\d\s()-]*$/;

type FieldErrors = Partial<Record<ClientField, ClientFieldError>>;

export type ClientValidation = { ok: true; data: ClientInput } | { ok: false; fieldErrors: FieldErrors };

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Shape and format checks only. Uniqueness and owner existence need the
// database and are checked in the server action.
export function validateClientForm(form: FormData): ClientValidation {
  const errors: FieldErrors = {};
  const name = text(form, "name");
  const sector = text(form, "sector");
  const ownerId = text(form, "ownerId");
  const contactName = text(form, "contactName");
  const contactEmail = text(form, "contactEmail").toLowerCase();
  const contactPhone = text(form, "contactPhone");
  const brandColor = text(form, "brandColor");

  if (!name) errors.name = "required";
  else if (name.length > CLIENT_LIMITS.name) errors.name = "too-long";

  if (sector.length > CLIENT_LIMITS.sector) errors.sector = "too-long";
  if (!ownerId) errors.ownerId = "required";
  if (contactName.length > CLIENT_LIMITS.contactName) errors.contactName = "too-long";

  if (contactEmail.length > CLIENT_LIMITS.contactEmail) errors.contactEmail = "too-long";
  else if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) errors.contactEmail = "invalid";

  if (contactPhone.length > CLIENT_LIMITS.contactPhone) errors.contactPhone = "too-long";
  else if (contactPhone && !PHONE_PATTERN.test(contactPhone)) errors.contactPhone = "invalid";

  if (!isBrandColor(brandColor)) errors.brandColor = "invalid";

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      name,
      sector: sector || null,
      ownerId,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      brandColor,
    },
  };
}
