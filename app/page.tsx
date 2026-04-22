import { LandingCTA } from "@/components/landing/cta";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/nav";
import { LandingRoadmap } from "@/components/landing/roadmap";
import { LandingValues } from "@/components/landing/values";

/**
 * 마케팅 랜딩 페이지 (Server Component).
 * 섹션별로 파일을 분리해 단일 파일이 비대해지지 않도록 유지.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingValues />
        <LandingFeatures />
        <LandingRoadmap />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
