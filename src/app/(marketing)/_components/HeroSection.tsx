import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ChaosArena from './ChaosArena';
import DashboardMockup from './DashboardMockup';

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center pt-[calc(64px+60px)] pb-20 relative overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-[1100px] mx-auto px-6 w-full">
        {/* Text */}
        <div className="text-center max-w-[740px] mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-[12px] font-semibold text-blue-400 tracking-wide uppercase mb-6">
            Developer Knowledge Hub
          </div>
          <h1 className="text-[clamp(38px,6vw,64px)] font-extrabold leading-[1.1] tracking-[-1.5px] mb-5">
            Stop Losing Your<br />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="text-lg text-[#7a7a8a] max-w-[580px] mx-auto mb-8 leading-[1.7]">
            Snippets scattered across 5 tabs, prompts buried in chat history, commands lost in bash history. DevStash brings everything into one fast, searchable hub.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/register">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 text-[15px] rounded-[10px] shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] hover:-translate-y-px transition-all">
                Get Started Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="px-7 py-3 text-[15px] rounded-[10px] text-[#7a7a8a] border-[#2a2a32] bg-transparent hover:bg-[#111113] hover:text-white">
                See Features
              </Button>
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {/* Chaos box */}
          <div className="flex-1 max-w-[340px] w-full bg-[#111113] border border-[#1e1e24] rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="text-[11px] font-semibold text-[#4a4a58] uppercase tracking-[0.8px] mb-3">
              Your knowledge today...
            </div>
            <ChaosArena />
          </div>

          {/* Arrow */}
          <div className="rotate-90 md:rotate-0 shrink-0 w-12 h-12 flex items-center justify-center text-blue-500">
            <div className="animate-arrow-pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {/* Dashboard box */}
          <div className="flex-1 max-w-[340px] w-full bg-[#111113] border border-[#1e1e24] rounded-xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
            <div className="text-[11px] font-semibold text-[#4a4a58] uppercase tracking-[0.8px] mb-3">
              ...with DevStash
            </div>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
