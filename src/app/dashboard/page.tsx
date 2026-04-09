import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardPage() {
  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections}>
      <DashboardMain />
    </DashboardShell>
  );
}
