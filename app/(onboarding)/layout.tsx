import type { ReactNode } from "react";

import { OnboardingProvider } from "@/features/onboarding/onboarding-provider";

/**
 * 온보딩 라우트 그룹 레이아웃.
 * 글래스모피즘 카드 + 블러 배경 + OnboardingProvider.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-surface-base px-6 py-12">
      {/* 배경 블러 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-[-140px] size-[500px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-100px] right-1/4 size-[400px] rounded-full bg-brand-glow/8 blur-[160px]" />
        <div className="absolute left-[-50px] top-1/2 size-[300px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[460px]">
        {/* 글래스 카드 */}
        <OnboardingProvider>
          <div className="animate-step-in rounded-2xl border border-border-subtle/60 bg-surface-elevated/40 px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
            {children}
          </div>
        </OnboardingProvider>

        {/* 하단 카피 */}
        <p className="mt-6 text-center text-xs text-fg-tertiary">
          Nexus — 팀의 맥락을 잃지 않는 단 하나의 홈
        </p>
      </div>
    </div>
  );
}
