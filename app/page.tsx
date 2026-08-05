"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { refreshApi, getProfileApi } from "@/lib/api/auth";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/tokens";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    async function resolveDestination() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken && !refreshToken) {
        router.replace("/login");
        return;
      }

      // access token이 있으면 유효성 확인
      if (accessToken) {
        try {
          await getProfileApi(accessToken);
          const workspaces = await getWorkspacesApi(accessToken);
          router.replace(workspaces.length > 0 ? "/dashboard" : "/profile");
          return;
        } catch {
          // 만료됐을 가능성 → refresh 시도
        }
      }

      // refresh token으로 갱신
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

      router.replace("/login");
    }

    resolveDestination();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
        <p className="text-sm text-fg-tertiary">불러오는 중…</p>
      </div>
    </div>
  );
}
