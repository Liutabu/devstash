import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // ─── Row counts ────────────────────────────────────────────────────────────

  const [users, itemTypes, items, collections, tags, accounts, sessions] =
    await Promise.all([
      prisma.user.count(),
      prisma.itemType.count(),
      prisma.item.count(),
      prisma.collection.count(),
      prisma.tag.count(),
      prisma.account.count(),
      prisma.session.count(),
    ]);

  console.log("✓ Connected to database\n");
  console.log("Row counts:");
  console.log(`  users         ${users}`);
  console.log(`  item_types    ${itemTypes}`);
  console.log(`  items         ${items}`);
  console.log(`  collections   ${collections}`);
  console.log(`  tags          ${tags}`);
  console.log(`  accounts      ${accounts}`);
  console.log(`  sessions      ${sessions}`);

  // ─── Demo user ─────────────────────────────────────────────────────────────

  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    include: { accounts: { select: { provider: true } } },
  });

  if (!user) {
    console.log("\n✗ Demo user not found — run `npm run db:seed` first");
    return;
  }

  console.log(`\nDemo user:`);
  console.log(`  id            ${user.id}`);
  console.log(`  email         ${user.email}`);
  console.log(`  name          ${user.name}`);
  console.log(`  emailVerified ${user.emailVerified?.toISOString()}`);
  console.log(`  isPro         ${user.isPro}`);
  console.log(`  accounts      ${user.accounts.map((a) => a.provider).join(", ")}`);

  // ─── Item types ────────────────────────────────────────────────────────────

  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  console.log(`\nSystem item types (${types.length}):`);
  for (const t of types) {
    console.log(`  ${t.slug.padEnd(10)} ${t.icon.padEnd(12)} ${t.color}  items: ${t._count.items}`);
  }

  // ─── Collections & items ───────────────────────────────────────────────────

  const cols = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: {
      items: {
        include: {
          item: {
            include: {
              itemType: true,
              tags: { include: { tag: true } },
            },
          },
        },
      },
    },
  });

  console.log(`\nCollections (${cols.length}):`);
  for (const col of cols) {
    const star = col.isFavorite ? " ★" : "";
    console.log(`\n  ${col.name}${star} — ${col.description ?? ""}`);
    for (const ci of col.items) {
      const { item } = ci;
      const tagList = item.tags.map((t) => t.tag.name).join(", ");
      const pin = item.isPinned ? " 📌" : "";
      const fav = item.isFavorite ? " ★" : "";
      console.log(
        `    [${item.itemType.slug.padEnd(8)}]${pin}${fav} ${item.title}` +
          (tagList ? `  (${tagList})` : "")
      );
    }
  }

  console.log("\n✓ Seed data verified");
}

main()
  .catch((err) => {
    console.error("✗ Database check failed:\n", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
