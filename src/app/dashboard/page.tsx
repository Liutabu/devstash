import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar placeholder */}
        <aside className="w-60 shrink-0 border-r border-border bg-background p-4">
          <h2 className="text-foreground font-semibold">Sidebar</h2>
        </aside>

        {/* Main area placeholder */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <h2 className="text-foreground font-semibold">Main</h2>
        </main>
      </div>
    </div>
  );
}