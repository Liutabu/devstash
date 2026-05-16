import FadeIn from '@/components/ui/FadeIn';

const features = [
  {
    color: '#3b82f6',
    title: 'Code Snippets',
    description: 'Store reusable code blocks with syntax highlighting. Never rewrite the same function twice.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    color: '#f59e0b',
    title: 'AI Prompts',
    description: 'Build your personal prompt library. Store, organize, and refine prompts that get results.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    color: '#6366f1',
    title: 'Instant Search',
    description: 'Full-text search across all your items. Find what you need in milliseconds with Cmd+K.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    color: '#06b6d4',
    title: 'Commands',
    description: 'Save those bash one-liners and CLI incantations you always forget. Run them in one click.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    color: '#64748b',
    title: 'Files & Docs',
    description: 'Attach context files, reference docs, and project assets. Everything in one searchable place.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    color: '#10b981',
    title: 'Collections',
    description: 'Group related items into collections. Build curated sets for projects, topics, or workflows.',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-[100px] border-t border-[#1e1e24]">
      <div className="max-w-[1100px] mx-auto px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-[clamp(28px,4vw,38px)] font-extrabold mb-3">Everything a developer needs</h2>
          <p className="text-[17px] text-[#7a7a8a] max-w-[480px] mx-auto">One hub for every type of knowledge you create and collect.</p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ color, title, description, svg }, i) => (
            <FadeIn key={title} delay={i * 80}>
              <div
                className="group relative bg-[#111113] border border-[#1e1e24] rounded-xl p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2a2a32] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden h-full"
              >
                {/* Top accent bar on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: color }}
                />
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${color}26`, color }}
                >
                  {svg}
                </div>
                <h3 className="text-[16px] font-bold mb-2">{title}</h3>
                <p className="text-sm text-[#7a7a8a] leading-[1.65]">{description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
