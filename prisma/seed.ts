import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { isPlatformAllowed } from "../lib/content-options";
import { SEED_CLIENTS, SEED_CONTENTS, SEED_USERS, type SeedContent } from "./seed-data";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

const daysAgo = (days: number, hourOffset = 0) => new Date(now - days * DAY - hourOffset * HOUR);

// @db.Date column: store the calendar day as UTC midnight so it reads back as
// the same day everywhere.
function calendarDay(offsetDays: number): Date {
  const local = new Date(now + offsetDays * DAY);
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}

// Existing accounts keep their password. New ones get a random hash nobody
// knows, so the seed never ships a usable credential; set a real password
// with `npm run db:create-user`.
async function seedUsers(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const user of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    const record = existing
      ? await prisma.user.update({ where: { id: existing.id }, data: { name: user.name } })
      : await prisma.user.create({
          data: { name: user.name, email: user.email, password: await bcrypt.hash(randomBytes(32).toString("hex"), 12) },
        });
    if (!existing) console.log(`  created ${user.email} (no usable password yet)`);
    ids.set(user.key, record.id);
  }
  return ids;
}

interface Timeline {
  createdAt: Date;
  reviewAt?: Date;
  publishedAt?: Date;
}

// Plausible history: created → (sent for review) → (published on its publish day).
// Items currently in review were sent recently, a few hours apart, so the
// activity feed looks alive.
function timelineFor(content: SeedContent, reviewIndex: number): Timeline {
  const createdAt = daysAgo(content.createdDaysAgo, 2);
  if (content.status === "DRAFT") return { createdAt };
  if (content.status === "IN_REVIEW") return { createdAt, reviewAt: new Date(now - (reviewIndex + 1) * 5 * HOUR) };
  const publishedAt = new Date(calendarDay(content.publishInDays ?? 0).getTime() + 7 * HOUR);
  return { createdAt, reviewAt: new Date(publishedAt.getTime() - DAY), publishedAt };
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed with NODE_ENV=production.");
  }
  const host = new URL(process.env.DIRECT_URL ?? "").host;
  console.log(`Seeding ${host}`);

  for (const content of SEED_CONTENTS) {
    if (!isPlatformAllowed(content.type, content.platform)) {
      throw new Error(`Invalid platform ${content.platform} for ${content.type}: "${content.title}"`);
    }
  }

  const userIds = await seedUsers();
  const userId = (key: string) => userIds.get(key) as string;

  await prisma.$transaction([prisma.activity.deleteMany(), prisma.content.deleteMany(), prisma.client.deleteMany()]);

  const clientIds = new Map<string, string>();
  for (const client of SEED_CLIENTS) {
    const { key, owner, createdDaysAgo, ...fields } = client;
    const createdAt = daysAgo(createdDaysAgo);
    const record = await prisma.client.create({ data: { ...fields, ownerId: userId(owner), createdAt } });
    clientIds.set(key, record.id);
    await prisma.activity.create({
      data: { kind: "CLIENT_CREATED", userId: userId(owner), clientId: record.id, createdAt },
    });
  }

  let reviewIndex = 0;
  for (const content of SEED_CONTENTS) {
    const timeline = timelineFor(content, content.status === "IN_REVIEW" ? reviewIndex++ : 0);
    const actor = userId(content.assignee);
    const clientId = clientIds.get(content.client) as string;

    const record = await prisma.content.create({
      data: {
        title: content.title,
        type: content.type,
        platform: content.platform,
        status: content.status,
        notes: content.notes ?? null,
        clientId,
        assigneeId: actor,
        publishDate: content.publishInDays === null ? null : calendarDay(content.publishInDays),
        publishedAt: timeline.publishedAt ?? null,
        createdAt: timeline.createdAt,
      },
    });

    const base = { userId: actor, clientId, contentId: record.id };
    await prisma.activity.create({ data: { ...base, kind: "CONTENT_CREATED", createdAt: timeline.createdAt } });
    if (timeline.reviewAt) {
      await prisma.activity.create({
        data: { ...base, kind: "STATUS_CHANGED", fromStatus: "DRAFT", toStatus: "IN_REVIEW", createdAt: timeline.reviewAt },
      });
    }
    if (timeline.publishedAt) {
      await prisma.activity.create({
        data: { ...base, kind: "STATUS_CHANGED", fromStatus: "IN_REVIEW", toStatus: "PUBLISHED", createdAt: timeline.publishedAt },
      });
    }
  }

  const [users, clients, contents, activities] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.content.count(),
    prisma.activity.count(),
  ]);
  console.log(`Done: ${users} users, ${clients} clients, ${contents} contents, ${activities} activities`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
