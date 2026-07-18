import { Navbar } from "@/components/landing/sections/Navbar";
import { Hero } from "@/components/landing/sections/Hero";
import { AboutReveal } from "@/components/landing/sections/AboutReveal";
import { FeaturesBento } from "@/components/landing/sections/FeaturesBento";
import { UseCase } from "@/components/landing/sections/UseCase";
import { SocialProof } from "@/components/landing/sections/SocialProof";
import { CounterStats } from "@/components/landing/sections/CounterStats";
import { AiSuggestions } from "@/components/landing/sections/AiSuggestions";
import { Reviews } from "@/components/landing/sections/Reviews";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { CtaFooter } from "@/components/landing/sections/CtaFooter";

export default function LandingPage() {
  return (
    <main className="overflow-x-clip bg-white">
      <Navbar />
      <Hero />
      <AboutReveal />
      <FeaturesBento />
      <UseCase />
      <SocialProof />
      <CounterStats />
      <AiSuggestions />
      <div id="reviews">
        <Reviews />
      </div>
      <div id="faq">
        <FaqSection />
      </div>
      <CtaFooter />
    </main>
  );
}
