import "server-only";
import { prisma } from "@/lib/prisma";
import type { AccountManagerOption } from "@/app/types/client";

export async function getAccountManagers(): Promise<AccountManagerOption[]> {
  return prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
