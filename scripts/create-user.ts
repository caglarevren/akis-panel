import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const email = readArg("email")?.trim().toLowerCase();
  const password = readArg("password");
  const name = readArg("name")?.trim();
  const username = readArg("username")?.trim().toLowerCase() || undefined;

  if (!email || !password || !name) {
    console.error('Usage: npm run db:create-user -- --email=pelin@ajans.com --password=... --name="Pelin Kilit" [--username=pelin.kilit]');
    process.exitCode = 1;
    return;
  }
  if (username?.includes("@")) {
    console.error('Username must not contain "@".');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, name, ...(username && { username }) },
    create: { email, password: hashed, name, username },
  });

  console.log(`Account manager ready: ${user.name} <${user.email}>${user.username ? ` (username: ${user.username})` : ""}`);
}

main()
  .catch((error) => {
    console.error("Failed to create user:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
