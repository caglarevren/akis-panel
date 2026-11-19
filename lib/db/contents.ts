import "server-only";
import { prisma } from "@/lib/prisma";

export async function getInReviewCount(): Promise<number> {
  return prisma.content.count({ where: { status: "IN_REVIEW" } });
}
