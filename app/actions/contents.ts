"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateContentForm } from "@/lib/validation/content";
import type { ContentField, ContentFieldError, ContentInput, DeleteResult, SaveContentResult } from "@/app/types/content";

type FieldErrors = Partial<Record<ContentField, ContentFieldError>>;

// Prisma's "record to delete does not exist".
function isRecordNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

// Client and assignee must exist. A new content (or a move to another client)
// must target an active client; an existing item may stay on its now-inactive
// client.
async function checkReferences(data: ContentInput, currentClientId?: string): Promise<FieldErrors> {
  const [client, assignee] = await Promise.all([
    prisma.client.findUnique({ where: { id: data.clientId }, select: { isActive: true } }),
    prisma.user.findUnique({ where: { id: data.assigneeId }, select: { id: true } }),
  ]);
  const errors: FieldErrors = {};
  if (!client) errors.clientId = "invalid";
  else if (!client.isActive && data.clientId !== currentClientId) errors.clientId = "inactive-client";
  if (!assignee) errors.assigneeId = "invalid";
  return errors;
}

export async function createContent(_prev: SaveContentResult | null, formData: FormData): Promise<SaveContentResult> {
  const actorId = (await auth())?.user?.id;
  if (!actorId) return { success: false, error: "unauthorized" };

  const parsed = validateContentForm(formData);
  if (!parsed.ok) return { success: false, error: "validation", fieldErrors: parsed.fieldErrors };
  const { data } = parsed;
  const sendForReview = formData.get("intent") === "review";

  try {
    const referenceErrors = await checkReferences(data);
    if (Object.keys(referenceErrors).length > 0) {
      return { success: false, error: "validation", fieldErrors: referenceErrors };
    }

    const content = await prisma.$transaction(async (tx) => {
      const created = await tx.content.create({
        data: { ...data, status: sendForReview ? "IN_REVIEW" : "DRAFT" },
        select: { id: true },
      });
      const base = { userId: actorId, clientId: data.clientId, contentId: created.id };
      await tx.activity.create({ data: { ...base, kind: "CONTENT_CREATED" } });
      if (sendForReview) {
        await tx.activity.create({ data: { ...base, kind: "STATUS_CHANGED", fromStatus: "DRAFT", toStatus: "IN_REVIEW" } });
      }
      return created;
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: content.id } };
  } catch (error) {
    console.error("createContent failed", error);
    return { success: false, error: "server-error" };
  }
}

// Edits fields only. Status changes go through their own action (Faz 6) so
// every transition is logged.
export async function updateContent(
  contentId: string,
  _prev: SaveContentResult | null,
  formData: FormData,
): Promise<SaveContentResult> {
  const actorId = (await auth())?.user?.id;
  if (!actorId) return { success: false, error: "unauthorized" };

  const parsed = validateContentForm(formData);
  if (!parsed.ok) return { success: false, error: "validation", fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  try {
    const existing = await prisma.content.findUnique({ where: { id: contentId }, select: { clientId: true } });
    if (!existing) return { success: false, error: "not-found" };

    const referenceErrors = await checkReferences(data, existing.clientId);
    if (Object.keys(referenceErrors).length > 0) {
      return { success: false, error: "validation", fieldErrors: referenceErrors };
    }

    await prisma.content.update({ where: { id: contentId }, data });
    revalidatePath("/", "layout");
    return { success: true, data: { id: contentId } };
  } catch (error) {
    console.error("updateContent failed", error);
    return { success: false, error: "server-error" };
  }
}

// Permanent. The content's activity rows go with it (ON DELETE CASCADE).
export async function deleteContent(contentId: string): Promise<DeleteResult> {
  if (!(await auth())?.user?.id) return { success: false, error: "unauthorized" };

  try {
    await prisma.content.delete({ where: { id: contentId } });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (isRecordNotFound(error)) return { success: false, error: "not-found" };
    console.error("deleteContent failed", error);
    return { success: false, error: "server-error" };
  }
}
