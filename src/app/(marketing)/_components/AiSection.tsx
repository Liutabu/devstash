import FadeIn from '@/components/ui/FadeIn';

const checkItems = [
  { label: 'Auto-tag suggestions', desc: 'AI suggests relevant tags when you save items' },
  { label: 'AI Summaries', desc: 'Generate concise descriptions for any item instantly' },
  { label: 'Explain This Code', desc: 'Understand any snippet in plain language' },
  { label: 'Prompt Optimizer', desc: 'Rewrite and improve your AI prompts automatically' },
];

const codeHtml = [
  '<span class="c-kw">import</span> <span class="c-p">{ useState, useEffect }</span> <span class="c-kw">from</span> <span class="c-str">\'react\'</span>',
  '',
  '<span class="c-kw">export function</span> <span class="c-fn">useDebounce</span><span class="c-p">&lt;T&gt;(</span>',
  '  <span class="c-var">value</span><span class="c-p">: T,</span>',
  '  <span class="c-var">delay</span><span class="c-p">: number</span>',
  '<span class="c-p">): T {</span>',
  '  <span class="c-kw">const</span> <span class="c-p">[</span><span class="c-var">debounced</span><span class="c-p">,</span> <span class="c-var">setDebounced</span><span class="c-p">] =</span>',
  '    <span class="c-fn">useState</span><span class="c-p">(</span><span class="c-var">value</span><span class="c-p">)</span>',
  '',
  '  <span class="c-fn">useEffect</span><span class="c-p">(() =&gt; {</span>',
  '    <span class="c-kw">const</span> <span class="c-var">t</span> <span class="c-p">=</span> <span class="c-fn">setTimeout</span><span class="c-p">(() =&gt;</span>',
  '      <span class="c-fn">setDebounced</span><span class="c-p">(</span><span class="c-var">value</span><span class="c-p">),</span> <span class="c-var">delay</span>',
  '    <span class="c-p">)</span>',
  '    <span class="c-kw">return</span> <span class="c-p">() =&gt;</span> <span class="c-fn">clearTimeout</span><span class="c-p">(</span><span class="c-var">t</span><span class="c-p">)</span>',
  '  <span class="c-p">}, [</span><span class="c-var">value</span><span class="c-p">,</span> <span class="c-var">delay</span><span class="c-p">])</span>',
  '',
  '  <span class="c-kw">return</span> <span class="c-var">debounced</span>',
  '<span class="c-p">}</span>',
].join('\n');

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AiSection() {
  return (
    <section id="ai" className="py-[100px] border-t border-[#1e1e24]" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.03) 50%, transparent 100%)' }}>
      <div className="max-w-[1100px] mx-auto px-6">
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[60px] items-center">
            {/* Left */}
            <div>
              <span className="inline-flex items-center px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[11px] font-bold text-amber-400 tracking-[1px] uppercase mb-5">
                PRO FEATURE
              </span>
              <h2 className="text-[clamp(26px,3.5vw,36px)] font-extrabold leading-[1.2] mb-4">AI that works for you</h2>
              <p className="text-[16px] text-[#7a7a8a] leading-[1.7] mb-8">
                DevStash Pro brings AI directly into your workflow — tagging, summarizing, and improving your knowledge automatically.
              </p>
              <ul className="flex flex-col gap-4">
                {checkItems.map(({ label, desc }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-[#7a7a8a]">
                    <CheckIcon />
                    <span><strong className="text-white">{label}</strong> — {desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: code editor mockup */}
            <div className="rounded-xl overflow-hidden border border-[#333] shadow-[0_4px_24px_rgba(0,0,0,0.4)]" style={{ background: '#1e1e1e' }}>
              {/* Editor header */}
              <div className="flex items-center gap-3 px-3.5 py-2.5 border-b border-[#3a3a3a]" style={{ background: '#2d2d2d' }}>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28ca41]" />
                </div>
                <span className="text-[12px] text-[#9ca3af] font-mono">useDebounce.ts</span>
              </div>

              {/* Code body */}
              <div className="p-5 overflow-x-auto">
                <pre className="font-mono text-[12.5px] leading-[1.75] m-0">
                  <code dangerouslySetInnerHTML={{ __html: codeHtml }} />
                </pre>
              </div>

              {/* AI tags footer */}
              <div className="px-5 py-3.5 border-t border-[#333]" style={{ background: '#252525' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-[0.5px] mb-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  AI Generated Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['react', 'hooks', 'typescript', 'performance', 'debounce'].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-[11px] text-blue-300 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
