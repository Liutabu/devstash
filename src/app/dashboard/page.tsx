import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardPage() {
  const [session, itemTypes, sidebarCollections] = await Promise.all([
    auth(),
    getItemTypesWithCounts(),
    getSidebarCollections(),
  ]);

  const user = session?.user ?? { name: null, email: null, image: null };

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user}>
      <DashboardMain />
    </DashboardShell>
  );
}
