"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { useOnboarding } from "./onboarding-provider";

/**
 * 온보딩 완료 화면.
 * 축하 메시지 + 초대 링크 복사 + 대시보드 이동.
 */
export function CompleteView() {
  const { state } = useOnboarding();
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://nexus.app/${state.workspace.workspaceSlug}/invite`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 대비
    }
  }, [inviteLink]);

  return (
    <div className="flex flex-col items-center text-center">
      {/* 축하 아이콘 — 글로우 이펙트 */}
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-full bg-accent/15 blur-xl" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-brand-glow/15 ring-1 ring-accent/20">
          <span className="text-4xl" role="img" aria-label="축하">
            🎉
          </span>
        </div>
      </div>

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-fg-primary">
        준비 완료!
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
        <span className="font-semibold text-fg-primary">
          {state.workspace.workspaceName || "워크스페이스"}
        </span>
        가 성공적으로 생성되었어요.
        <br />
        팀원을 초대하고 협업을 시작하세요.
      </p>

      {/* 초대 링크 카드 */}
      <div className="mt-8 w-full rounded-xl border border-border-default bg-surface-elevated/50 p-4">
        <p className="mb-3 text-xs font-medium text-fg-tertiary">초대 링크</p>
        <div className="flex items-center gap-2 rounded-lg bg-surface-base p-2">
          <span className="min-w-0 flex-1 truncate px-2 text-left font-mono text-xs text-fg-secondary">
            {inviteLink}
          </span>
          <Button
            variant={copied ? "primary" : "secondary"}
            size="sm"
            onClick={handleCopy}
            className={cn("shrink-0 min-w-[60px]", copied ? "bg-status-done hover:bg-status-done" : "")}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                완료
              </span>
            ) : (
              "복사"
            )}
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-fg-tertiary">
          나중에 설정에서도 팀원을 초대할 수 있어요.
        </p>
      </div>

      {/* 대시보드 이동 */}
      <Link href="/dashboard" className="mt-8 block w-full">
        <Button variant="primary" size="lg" className="w-full">
          대시보드로 이동
        </Button>
      </Link>
    </div>
  );
}
