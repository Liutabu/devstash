import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardMain } from "@/components/dashboard/DashboardMain";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardMain />
    </DashboardShell>
  );
}
