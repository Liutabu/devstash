'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/ui/FadeIn';

function CheckIcon({ green = true }: { green?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={green ? '#4ade80' : '#4a4a58'} strokeWidth="2.5" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#4a4a58" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 shrink-0">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-[100px] border-t border-[#1e1e24]">
      <div className="max-w-[1100px] mx-auto px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-[clamp(28px,4vw,38px)] font-extrabold mb-3">Simple, transparent pricing</h2>
          <p className="text-[17px] text-[#7a7a8a] max-w-[480px] mx-auto">Start free. Upgrade when you need more.</p>
          <div className="flex items-center justify-center gap-3 mt-7">
            <span className={`text-sm flex items-center gap-1.5 transition-colors ${!yearly ? 'text-white' : 'text-[#7a7a8a]'}`}>Monthly</span>
            <button
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly(!yearly)}
              className="relative inline-block w-11 h-6 cursor-pointer rounded-full transition-colors duration-200"
              style={{ background: yearly ? '#3b82f6' : '#2a2a32' }}
            >
              <span
                className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
                style={{ transform: yearly ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <span className={`text-sm flex items-center gap-1.5 transition-colors ${yearly ? 'text-white' : 'text-[#7a7a8a]'}`}>
              Yearly{' '}
              <span className="px-2 py-0.5 bg-green-500/15 border border-green-500/30 rounded-full text-[11px] text-green-400 font-semibold">
                Save 25%
              </span>
            </span>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[700px] mx-auto">
            {/* Free */}
            <div className="bg-[#111113] border border-[#1e1e24] rounded-xl p-8 relative">
              <div className="text-[13px] font-bold text-[#7a7a8a] uppercase tracking-[1px] mb-3">Free</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[48px] font-extrabold tracking-[-2px] leading-none">$0</span>
                <span className="text-sm text-[#7a7a8a]">/month</span>
              </div>
              <p className="text-sm text-[#7a7a8a] mb-7 leading-[1.5]">Everything you need to get started.</p>
              <ul className="flex flex-col gap-3 mb-7">
                {[
                  { text: '50 items', ok: true },
                  { text: '3 collections', ok: true },
                  { text: 'All item types (text & links)', ok: true },
                  { text: 'Full-text search', ok: true },
                  { text: 'File & image uploads', ok: false },
                  { text: 'AI features', ok: false },
                ].map(({ text, ok }) => (
                  <li key={text} className={`flex items-center gap-2.5 text-sm ${ok ? 'text-[#f1f1f3]' : 'text-[#4a4a58]'}`}>
                    {ok ? <CheckIcon /> : <XIcon />}
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-[#2a2a32] bg-transparent hover:bg-[#16161a] hover:border-[#4a4a58] text-white">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#111113] border border-blue-500 rounded-xl p-8 relative shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_40px_rgba(59,130,246,0.1)]">
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-[11px] font-bold text-white tracking-[0.5px] whitespace-nowrap">
                Most Popular
              </div>
              <div className="text-[13px] font-bold text-[#7a7a8a] uppercase tracking-[1px] mb-3">Pro</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[48px] font-extrabold tracking-[-2px] leading-none">{yearly ? '$6' : '$8'}</span>
                <span className="text-sm text-[#7a7a8a]">{yearly ? '/month, billed $72/yr' : '/month'}</span>
              </div>
              <p className="text-sm text-[#7a7a8a] mb-7 leading-[1.5]">Unlimited everything, plus AI superpowers.</p>
              <ul className="flex flex-col gap-3 mb-7">
                {[
                  'Unlimited items',
                  'Unlimited collections',
                  'File & image uploads',
                  'AI tagging & summaries',
                  'Explain code & optimize prompts',
                  'Export data (JSON / ZIP)',
                ].map((text) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-[#f1f1f3]">
                    <CheckIcon />
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
