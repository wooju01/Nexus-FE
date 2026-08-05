"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LandingCTA } from "@/components/landing/cta";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/nav";
import { LandingShowcase } from "@/components/landing/showcase";
import { refreshApi, getProfileApi } from "@/lib/api/auth";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokens";

export default function RootPage() {
  const router = useRouter();
  // null = 확인 중, true = 로그인됨(리다이렉트), false = 미로그인(랜딩 표시)
  const [authChecked, setAuthChecked] = useState<boolean | null>(null);

  useEffect(() => {
    async function resolveDestination() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        setAuthChecked(false);
        return;
      }

      if (accessToken) {
        try {
          await getProfileApi(accessToken);
          const workspaces = await getWorkspacesApi(accessToken);
          router.replace(workspaces.length > 0 ? "/dashboard" : "/profile");
          return;
        } catch {
          // 만료 → refresh 시도
        }
      }

      if (refreshToken) {
        try {
          const tokens = await refreshApi(refreshToken);
          setTokens(tokens.accessToken, tokens.refreshToken);
          const workspaces = await getWorkspacesApi(tokens.accessToken);
          router.replace(workspaces.length > 0 ? "/dashboard" : "/profile");
          return;
        } catch {
          clearTokens();
        }
      }

      setAuthChecked(false);
    }

    resolveDestination();
  }, [router]);

  // 토큰 확인 중
  if (authChecked === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-base">
        <div className="size-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
      </div>
    );
  }

  // 미로그인 → 랜딩 페이지
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingShowcase />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
