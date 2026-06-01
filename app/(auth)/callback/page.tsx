import { Suspense } from "react";

import { OAuthCallback } from "@/features/auth/oauth-callback";

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-sm text-fg-secondary">로그인 처리 중...</p>
        </div>
      }
    >
      <OAuthCallback />
    </Suspense>
  );
}
