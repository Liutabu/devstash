import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getSidebarCollections, getUserCollections } from "@/lib/db/collections";
import { getSearchData } from "@/lib/db/search";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const [itemTypes, sidebarCollections, userCollections, searchData] = await Promise.all([
    getItemTypesWithCounts(userId),
    getSidebarCollections(userId),
    getUserCollections(userId),
    getSearchData(userId),
  ]);

  const user = session.user;

  return (
    <DashboardShell itemTypes={itemTypes} sidebarCollections={sidebarCollections} userCollections={userCollections} searchData={searchData} user={user}>
      <DashboardMain userId={userId} />
    </DashboardShell>
  );
}
