'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[rgba(10,10,11,0.92)] backdrop-blur-md border-[#1e1e24] shadow-[0_1px_20px_rgba(0,0,0,0.3)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-[17px] font-bold text-white shrink-0">
          <svg className="w-[22px] h-[22px] text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          DevStash
        </Link>

        <div className="hidden md:flex gap-6 flex-1">
          <a href="/#features" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Features</a>
          <a href="/#pricing" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <Link href="/sign-in">
            <Button variant="outline" size="sm" className="text-[#7a7a8a] border-[#2a2a32] bg-transparent hover:bg-[#111113] hover:text-white hover:border-[#4a4a58]">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)]">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden ml-auto text-[#7a7a8a] hover:text-white p-1 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden flex flex-col gap-1 px-6 pb-5 border-t border-[#1e1e24] bg-[rgba(10,10,11,0.96)]">
          <a href="/#features" className="px-3 py-2.5 text-[15px] text-[#7a7a8a] hover:text-white hover:bg-[#111113] rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="/#pricing" className="px-3 py-2.5 text-[15px] text-[#7a7a8a] hover:text-white hover:bg-[#111113] rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Pricing</a>
          <Link href="/sign-in" className="px-3 py-2.5 text-[15px] text-[#7a7a8a] hover:text-white hover:bg-[#111113] rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link href="/register" onClick={() => setMobileOpen(false)}>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-1">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
