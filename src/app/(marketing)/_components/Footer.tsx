import Link from 'next/link';

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-[#1e1e24] pt-[60px] pb-8">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-8 md:gap-[60px] mb-12">
          {/* Brand */}
          <div className="flex-[1.5]">
            <Link href="/" className="inline-flex items-center gap-2 text-[17px] font-bold text-white mb-3">
              <svg className="w-[22px] h-[22px] text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              DevStash
            </Link>
            <p className="text-sm text-[#7a7a8a]">The developer knowledge hub.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 md:gap-12 flex-[2]">
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.8px] mb-1">Product</h4>
              <a href="#features" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Pricing</a>
              <Link href="/dashboard" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Dashboard</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.8px] mb-1">Company</h4>
              <a href="#" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Changelog</a>
            </div>
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[12px] font-bold text-white uppercase tracking-[0.8px] mb-1">Legal</h4>
              <a href="#" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[#7a7a8a] hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1e1e24] text-[13px] text-[#4a4a58]">
          &copy; {year} DevStash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
