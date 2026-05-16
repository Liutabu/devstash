import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Navbar from './_components/Navbar';
import HeroSection from './_components/HeroSection';
import FeaturesSection from './_components/FeaturesSection';
import AiSection from './_components/AiSection';
import PricingSection from './_components/PricingSection';
import CtaSection from './_components/CtaSection';
import Footer from './_components/Footer';

export default async function MarketingPage() {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <div className="bg-[#0a0a0b] text-[#f1f1f3] min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AiSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
