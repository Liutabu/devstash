import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Test connection by counting each table
  const [
    users,
    itemTypes,
    items,
    collections,
    tags,
    accounts,
    sessions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
    prisma.account.count(),
    prisma.session.count(),
  ]);

  console.log("✓ Connected to database successfully\n");
  console.log("Table row counts:");
  console.log(`  users              ${users}`);
  console.log(`  item_types         ${itemTypes}`);
  console.log(`  items              ${items}`);
  console.log(`  collections        ${collections}`);
  console.log(`  tags               ${tags}`);
  console.log(`  accounts           ${accounts}`);
  console.log(`  sessions           ${sessions}`);
}

main()
  .catch((err) => {
    console.error("✗ Database connection failed:\n", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
