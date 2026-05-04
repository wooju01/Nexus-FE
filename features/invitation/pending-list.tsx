"use client";

import { useState, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { AtSignIcon, TrashIcon } from "@/components/icons";
import {
  cancelInvitation,
  fetchPendingInvitations,
} from "@/lib/api/invitations";
import { getAccessToken } from "@/lib/auth/tokens";

import type { Invitation } from "@/types/invitation";

type PendingInvitationListProps = {
  /** BE 가 식별하는 cuid 형태의 워크스페이스 id */
  workspaceId: string;
};

type LoadState = "loading" | "ready" | "error";

/**
 * 대기 중인 초대 목록.
 *
 * BE: GET /workspaces/:id/invitations
 * TODO(sejun, NX-invite): TanStack Query 도입 후엔 useQuery 로 캐시·재검증 위임.
 */
export function PendingInvitationList({
  workspaceId,
}: PendingInvitationListProps) {
  const [invitations, setInvitations] = useState<ReadonlyArray<Invitation>>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingToken, setCancellingToken] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // 마운트 시 1회 로드. workspaceId 변경 시 재로드.
  // 모든 setState 는 async 콜백 안에서만 — effect body 동기 setState 회피.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (!cancelled) {
          setLoadState("error");
          setLoadError("로그인이 필요합니다.");
        }
        return;
      }

      try {
        const list = await fetchPendingInvitations(accessToken, workspaceId);
        if (cancelled) return;
        setInvitations(list);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "초대 목록을 불러오지 못했습니다.",
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleCancel = useCallback(async (token: string) => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setCancelError("로그인이 필요합니다.");
      return;
    }

    setCancellingToken(token);
    setCancelError(null);

    // 낙관적 업데이트 — 실패 시 롤백.
    const snapshot = invitations;
    setInvitations((prev) => prev.filter((inv) => inv.token !== token));

    try {
      await cancelInvitation(accessToken, token);
    } catch (err) {
      setInvitations(snapshot);
      setCancelError(
        err instanceof Error ? err.message : "취소에 실패했습니다.",
      );
    } finally {
      setCancellingToken(null);
    }
  // invitations 를 deps 에 넣어야 snapshot 이 최신 → 낙관적 업데이트 정확.
  }, [invitations]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          대기 중인 초대
        </h3>
        {loadState === "ready" && invitations.length > 0 ? (
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
            {invitations.length}
          </span>
        ) : null}
      </div>

      {cancelError ? (
        <p
          role="alert"
          className="mb-2 rounded-md border border-priority-p1/30 bg-priority-p1/5 px-3 py-2 text-xs text-priority-p1"
        >
          {cancelError}
        </p>
      ) : null}

      {loadState === "loading" ? (
        <p className="rounded-lg border border-border-subtle bg-surface-base px-4 py-6 text-center text-sm text-fg-tertiary">
          불러오는 중…
        </p>
      ) : loadState === "error" ? (
        <p className="rounded-lg border border-priority-p1/30 bg-priority-p1/5 px-4 py-6 text-center text-sm text-priority-p1">
          {loadError ?? "불러오지 못했습니다."}
        </p>
      ) : invitations.length === 0 ? (
        <p className="rounded-lg border border-border-subtle bg-surface-base px-4 py-6 text-center text-sm text-fg-tertiary">
          대기 중인 초대가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-base px-4 py-3"
            >
              <AtSignIcon
                width={16}
                height={16}
                className="flex-shrink-0 text-fg-tertiary"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg-primary">
                  {inv.email ?? "(이메일 미지정 — 링크 공유)"}
                </p>
                <p className="text-xs text-fg-tertiary">
                  {formatRemainingDays(inv.expiresAt)}
                </p>
              </div>
              <span className="rounded-md bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-fg-tertiary">
                {inv.role}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancel(inv.token)}
                disabled={cancellingToken === inv.token}
                aria-label={`${inv.email ?? "초대"} 취소`}
                className="text-fg-tertiary hover:text-priority-p1"
              >
                <TrashIcon width={16} height={16} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatRemainingDays(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "만료됨";
  if (days === 1) return "내일 만료";
  return `${days}일 후 만료`;
}
