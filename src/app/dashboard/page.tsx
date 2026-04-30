import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections } from "@/lib/db/collections";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const [itemTypes, sidebarCollections] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
  ]);

  const user = session.user;

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} user={user}>
      <DashboardMain userId={userId} />
    </DashboardShell>
  );
}
