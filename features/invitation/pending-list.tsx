"use client";

import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { AtSignIcon, TrashIcon } from "@/components/icons";
import { getPendingInvitations } from "@/lib/mocks/invitations";
import { cancelInvitation } from "@/lib/api/invitations";

import type { Invitation } from "@/types/invitation";

/**
 * 대기 중인 초대 목록.
 * TODO(sejun, NX-invite): TanStack Query 도입 시 목 데이터 초기화를 useQuery로 교체.
 */
export function PendingInvitationList() {
  const [invitations, setInvitations] = useState<ReadonlyArray<Invitation>>(
    getPendingInvitations,
  );
  const [cancellingToken, setCancellingToken] = useState<string | null>(null);

  const handleCancel = useCallback(async (token: string) => {
    setCancellingToken(token);
    try {
      await cancelInvitation(token);
      setInvitations((prev) => prev.filter((inv) => inv.token !== token));
    } finally {
      setCancellingToken(null);
    }
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-fg-primary">
          대기 중인 초대
        </h3>
        {invitations.length > 0 ? (
          <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-[10px] font-medium text-accent">
            {invitations.length}
          </span>
        ) : null}
      </div>

      {invitations.length === 0 ? (
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
                  {inv.email}
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
                aria-label={`${inv.email} 초대 취소`}
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
