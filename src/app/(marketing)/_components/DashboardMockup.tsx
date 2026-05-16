const SIDEBAR_DOTS = [
  { color: '#3b82f6', short: false },
  { color: '#f59e0b', short: true },
  { color: '#06b6d4', short: false },
  { color: '#22c55e', short: true },
  { color: '#ec4899', short: false },
  { color: '#6366f1', short: true },
];

const CARD_COLORS = ['#3b82f6', '#f59e0b', '#06b6d4', '#22c55e', '#6366f1', '#ec4899'];

export default function DashboardMockup() {
  return (
    <div className="flex h-[220px] rounded-lg overflow-hidden bg-[#0d0d10] border border-[#1e1e24]">
      {/* Sidebar */}
      <div className="w-[72px] bg-[#0a0a0d] border-r border-[#1e1e24] p-3 flex flex-col gap-2">
        {SIDEBAR_DOTS.map(({ color, short }, i) => (
          <div key={i} className="flex items-center gap-[7px]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className={`h-1.5 bg-[#2a2a32] rounded-full ${short ? 'w-[60%]' : 'flex-1'}`} />
          </div>
        ))}
      </div>
      {/* Main grid */}
      <div className="flex-1 p-2.5 grid grid-cols-2 gap-2 content-start">
        {CARD_COLORS.map((color, i) => (
          <div
            key={i}
            className="bg-[#111113] border border-[#1e1e24] rounded-md p-2 flex flex-col gap-[5px]"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          >
            <div className="h-1.5 bg-[#2a2a32] rounded-full w-[80%]" />
            <div className="h-1.5 bg-[#2a2a32] rounded-full w-[55%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
