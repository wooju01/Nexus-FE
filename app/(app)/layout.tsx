import type { ReactNode } from "react";

import { LeftRail } from "@/components/app-shell/left-rail";
import { Sidebar } from "@/components/app-shell/sidebar";
import { TopBar } from "@/components/app-shell/top-bar";
import { UserProvider } from "@/features/auth/user-provider";
import { WorkspaceProvider } from "@/features/workspace/workspace-provider";

/**
 * 인증된 애플리케이션 쉘 레이아웃.
 * 구성: TopBar (위) + LeftRail · Sidebar · Main (아래).
 *
 * 인증 체크는 후속 단계에서 middleware + session 쿠키로 붙인다.
 * 지금은 순수 UI 스켈레톤.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <WorkspaceProvider>
        <div className="flex h-dvh flex-col bg-surface-base text-fg-primary">
          <TopBar />
          <div className="flex min-h-0 flex-1">
            <LeftRail />
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </WorkspaceProvider>
    </UserProvider>
  );
}
