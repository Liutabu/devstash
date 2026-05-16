import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/ui/FadeIn';

export default function CtaSection() {
  return (
    <section className="py-[100px] border-t border-[#1e1e24]">
      <div className="max-w-[1100px] mx-auto px-6">
        <FadeIn className="text-center max-w-[540px] mx-auto">
          <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold mb-4">Ready to Organize Your Knowledge?</h2>
          <p className="text-[17px] text-[#7a7a8a] mb-8 leading-[1.7]">
            Join developers who&apos;ve stopped losing their best work. Start free, no credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 text-[15px] rounded-[10px] shadow-[0_4px_16px_rgba(59,130,246,0.4)] hover:-translate-y-px transition-all">
              Get Started Free
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
