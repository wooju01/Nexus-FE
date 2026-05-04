"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CheckCircleIcon, PeopleIcon } from "@/components/icons";
import { acceptInvitation } from "@/lib/api/invitations";
import { getAccessToken } from "@/lib/auth/tokens";

import type { Invitation } from "@/types/invitation";

type AcceptViewProps = {
  invitation: Invitation;
};

/**
 * 초대 수락 Client Component.
 *
 * 흐름:
 *   1. 컴포넌트 마운트 시 access token 확인
 *      - 비로그인 → /signup?invite={token} 으로 redirect
 *      - 로그인 → 그대로 수락 화면 표시
 *   2. 수락 클릭 → POST /invitations/:token/accept
 *      - 성공: 워크스페이스 home(/dashboard) 로 이동
 *      - 실패(만료/이메일 불일치 등): 에러 메시지 인라인 표시
 *
 * status 별 UI:
 *   - expired → 만료 안내 (수락 불가)
 *   - accepted → 환영 화면 + 대시보드 이동
 *   - pending → 수락 버튼
 */
export function AcceptView({ invitation }: AcceptViewProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(
    invitation.status === "accepted",
  );
  const [error, setError] = useState<string | null>(null);

  // 비로그인 사용자는 가입 페이지로 보낸다 (만료된 초대는 굳이 가입 유도하지 않음).
  useEffect(() => {
    if (invitation.status === "expired" || isAccepted) return;
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.replace(`/signup?invite=${invitation.token}`);
    }
  }, [invitation.status, invitation.token, isAccepted, router]);

  const handleAccept = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.replace(`/signup?invite=${invitation.token}`);
      return;
    }

    setIsAccepting(true);
    setError(null);
    try {
      await acceptInvitation(accessToken, invitation.token);
      setIsAccepted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "초대 수락 중 오류가 발생했습니다.",
      );
    } finally {
      setIsAccepting(false);
    }
  }, [invitation.token, router]);

  // 만료된 초대
  if (invitation.status === "expired") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-surface-overlay">
          <span className="text-3xl" role="img" aria-label="만료">
            ⏳
          </span>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-fg-primary">
          만료된 초대입니다
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
          이 초대 링크는 만료되었습니다. 워크스페이스 관리자에게 새 초대를
          요청해주세요.
        </p>
        <Link href="/login" className="mt-8 block w-full">
          <Button variant="outline" size="md" className="w-full">
            로그인 페이지로 이동
          </Button>
        </Link>
      </div>
    );
  }

  // 이미 수락 완료
  if (isAccepted) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-status-done/15 blur-xl" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-status-done/10 ring-1 ring-status-done/20">
            <CheckCircleIcon
              width={32}
              height={32}
              className="text-status-done"
            />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-fg-primary">
          환영합니다!
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
          <span className="font-semibold text-fg-primary">
            {invitation.workspaceName}
          </span>
          에 성공적으로 참여했습니다.
        </p>
        <Link href="/dashboard" className="mt-8 block w-full">
          <Button variant="primary" size="lg" className="w-full">
            대시보드로 이동
          </Button>
        </Link>
      </div>
    );
  }

  // 수락 대기 (pending)
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
        <PeopleIcon width={28} height={28} className="text-accent" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-fg-primary">
        {invitation.workspaceName}
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-secondary">
        <span className="font-semibold text-fg-primary">
          {invitation.creatorName}
        </span>
        님이{" "}
        <span className="font-semibold text-fg-primary">
          {invitation.role === "ADMIN" ? "관리자" : "멤버"}
        </span>{" "}
        역할로 초대했습니다.
      </p>
      {invitation.email ? (
        <p className="mt-1 text-xs text-fg-tertiary">{invitation.email}</p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        onClick={handleAccept}
        isLoading={isAccepting}
        className="mt-8 w-full"
      >
        초대 수락
      </Button>
      <p className="mt-3 text-[11px] text-fg-tertiary">
        수락하면{" "}
        <span className="text-fg-secondary">{invitation.workspaceName}</span>
        의 팀원이 됩니다.
      </p>
    </div>
  );
}
