"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getWorkspacesApi } from "@/lib/api/workspace";
import { setTokens } from "@/lib/auth/tokens";

export function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }

    setTokens(accessToken, refreshToken);

    getWorkspacesApi(accessToken)
      .then((workspaces) => {
        router.replace(workspaces.length === 0 ? "/profile" : "/dashboard");
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-sm text-fg-secondary">로그인 처리 중...</p>
    </div>
  );
}
