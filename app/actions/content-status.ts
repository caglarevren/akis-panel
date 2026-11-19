"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ContentStatus } from "@/generated/prisma/enums";
import { UNDO_WINDOW_MS } from "@/lib/content-status";
import { prisma } from "@/lib/prisma";
import type { StatusChangeResult, UndoStatusResult } from "@/app/types/content";


function isStatus(value: unknown): value is ContentStatus {
  return typeof value === "string" && (Object.values(ContentStatus) as string[]).includes(value);
}

// Any status can move to any other. `publishedAt` is the moment the item
// last entered PUBLISHED and is empty in every other status.
export async function changeContentStatus(contentId: string, toStatus: unknown): Promise<StatusChangeResult> {
  const actorId = (await auth())?.user?.id;
  if (!actorId) return { success: false, error: "unauthorized" };
  if (!isStatus(toStatus)) return { success: false, error: "invalid" };

  try {
    const content = await prisma.content.findUnique({ where: { id: contentId }, select: { status: true, clientId: true } });
    if (!content) return { success: false, error: "not-found" };
    if (content.status === toStatus) return { success: true, data: { activityId: null } };

    // One timestamp for both rows, so undo can restore publishedAt exactly
    // from the activity history.
    const changedAt = new Date();
    const activity = await prisma.$transaction(async (tx) => {
      await tx.content.update({
        where: { id: contentId },
        data: { status: toStatus, publishedAt: toStatus === "PUBLISHED" ? changedAt : null },
      });
      return tx.activity.create({
        data: {
          kind: "STATUS_CHANGED",
          userId: actorId,
          clientId: content.clientId,
          contentId,
          fromStatus: content.status,
          toStatus,
          createdAt: changedAt,
        },
        select: { id: true },
      });
    });

    revalidatePath("/", "layout");
    return { success: true, data: { activityId: activity.id } };
  } catch (error) {
    console.error("changeContentStatus failed", error);
    return { success: false, error: "server-error" };
  }
}

// Reverts a status change as if it never happened: the content goes back to
// the previous status and the activity row is removed. Only the author can
// undo, only within UNDO_WINDOW_MS, and only while it is still the latest
// change and the content hasn't moved on.
export async function undoStatusChange(activityId: string): Promise<UndoStatusResult> {
  const actorId = (await auth())?.user?.id;
  if (!actorId) return { success: false, error: "unauthorized" };

  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        kind: true,
        userId: true,
        contentId: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
        content: { select: { status: true } },
      },
    });
    if (
      !activity ||
      activity.kind !== "STATUS_CHANGED" ||
      activity.userId !== actorId ||
      !activity.contentId ||
      !activity.fromStatus ||
      activity.content?.status !== activity.toStatus ||
      Date.now() - activity.createdAt.getTime() > UNDO_WINDOW_MS
    ) {
      return { success: false, error: "expired" };
    }
    const { contentId, fromStatus } = activity;

    const newer = await prisma.activity.count({
      where: { contentId, kind: "STATUS_CHANGED", createdAt: { gt: activity.createdAt } },
    });
    if (newer > 0) return { success: false, error: "expired" };

    await prisma.$transaction(async (tx) => {
      await tx.activity.delete({ where: { id: activityId } });
      // Back to PUBLISHED: restore when it was last published, from history.
      const lastPublished =
        fromStatus === "PUBLISHED"
          ? await tx.activity.findFirst({
              where: { contentId, kind: "STATUS_CHANGED", toStatus: "PUBLISHED" },
              orderBy: { createdAt: "desc" },
              select: { createdAt: true },
            })
          : null;
      await tx.content.update({
        where: { id: contentId },
        data: {
          status: fromStatus,
          publishedAt: fromStatus === "PUBLISHED" ? (lastPublished?.createdAt ?? new Date()) : null,
        },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("undoStatusChange failed", error);
    return { success: false, error: "server-error" };
  }
}
