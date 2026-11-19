"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateClientForm } from "@/lib/validation/client";
import type { CreateClientResult } from "@/app/types/client";
import type { DeleteResult } from "@/app/types/content";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function createClient(_prev: CreateClientResult | null, formData: FormData): Promise<CreateClientResult> {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) return { success: false, error: "unauthorized" };

  const parsed = validateClientForm(formData);
  if (!parsed.ok) return { success: false, error: "validation", fieldErrors: parsed.fieldErrors };
  const { data } = parsed;

  try {
    const [duplicate, owner] = await Promise.all([
      prisma.client.findFirst({ where: { name: { equals: data.name, mode: "insensitive" } }, select: { id: true } }),
      prisma.user.findUnique({ where: { id: data.ownerId }, select: { id: true } }),
    ]);
    if (duplicate || !owner) {
      return {
        success: false,
        error: "validation",
        fieldErrors: { ...(duplicate && { name: "duplicate" }), ...(!owner && { ownerId: "invalid" }) },
      };
    }

    const client = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({ data, select: { id: true } });
      await tx.activity.create({ data: { kind: "CLIENT_CREATED", userId: actorId, clientId: created.id } });
      return created;
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: client.id } };
  } catch (error) {
    // Two people creating the same name at once: the unique index catches
    // what the findFirst check above couldn't.
    if (isUniqueViolation(error)) {
      return { success: false, error: "validation", fieldErrors: { name: "duplicate" } };
    }
    console.error("createClient failed", error);
    return { success: false, error: "server-error" };
  }
}

// Permanent. The client's contents and all activity rows go with it (ON DELETE
// CASCADE). Deliberately no revalidatePath: the caller is on this client's own
// page, and refreshing it first would flash a "not found" screen. The caller
// navigates away and then refreshes the router, which also updates the layout.
export async function deleteClient(clientId: string): Promise<DeleteResult> {
  if (!(await auth())?.user?.id) return { success: false, error: "unauthorized" };

  try {
    await prisma.client.delete({ where: { id: clientId } });
    return { success: true };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return { success: false, error: "not-found" };
    }
    console.error("deleteClient failed", error);
    return { success: false, error: "server-error" };
  }
}
