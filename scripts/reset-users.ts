import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const KEEP_EMAIL = "demo@devstash.io";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const demo = await prisma.user.findUnique({ where: { email: KEEP_EMAIL } });
  if (!demo) {
    console.error(`✗ ${KEEP_EMAIL} not found — aborting`);
    process.exit(1);
  }

  const targets = await prisma.user.findMany({
    where: { id: { not: demo.id } },
    select: { id: true, email: true },
  });

  if (targets.length === 0) {
    console.log("No other users found — nothing to delete.");
    return;
  }

  console.log(`Deleting ${targets.length} user(s):`);
  for (const u of targets) {
    console.log(`  ${u.email ?? u.id}`);
  }

  const ids = targets.map((u) => u.id);

  // Delete in dependency order (cascade handles most, but verification tokens
  // use email as identifier, not a FK, so we delete them manually first).
  const emails = targets.map((u) => u.email).filter(Boolean) as string[];

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: { in: emails } } }),
    prisma.tagsOnItems.deleteMany({ where: { item: { userId: { in: ids } } } }),
    prisma.itemCollection.deleteMany({ where: { item: { userId: { in: ids } } } }),
    prisma.item.deleteMany({ where: { userId: { in: ids } } }),
    prisma.collection.deleteMany({ where: { userId: { in: ids } } }),
    prisma.itemType.deleteMany({ where: { userId: { in: ids } } }),
    prisma.session.deleteMany({ where: { userId: { in: ids } } }),
    prisma.account.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);

  console.log(`\n✓ Deleted ${targets.length} user(s) and all their content.`);
  console.log(`  Kept: ${KEEP_EMAIL}`);
}

main()
  .catch((err) => {
    console.error("✗ Reset failed:\n", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
