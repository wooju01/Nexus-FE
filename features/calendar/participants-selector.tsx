"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { CheckIcon } from "@/components/icons";
import { getMembersApi, type WorkspaceMember } from "@/lib/api/member";
import { getAccessToken } from "@/lib/auth/tokens";
import { cn } from "@/lib/utils/cn";

type ParticipantsSelectorProps = {
  workspaceId: string;
  /** 현재 선택된 참가자 userId 배열. 작성자 본인은 제외 (BE 가 자동 포함). */
  value: ReadonlyArray<string>;
  onChange: (nextIds: string[]) => void;
  disabled?: boolean;
  /**
   * 본인 userId — 선택 옵션에서 숨김 (작성자는 자동 ACCEPTED 라 따로 고를 의미 없음).
   * 모르면 생략 가능. 그 경우 옵션에 본인도 표시됨.
   */
  currentUserId?: string;
};

type LoadState = "loading" | "ready" | "error";

/**
 * 워크스페이스 멤버 중 이벤트 참가자를 선택하는 셀렉터.
 *
 * - 마운트 시 `GET /workspaces/:id/members` 로 멤버 목록 fetch
 * - 체크박스 리스트로 다중 선택 (소규모 워크스페이스 가정 — 향후 가상화·검색 도입 여지)
 * - 작성자 본인은 BE 가 자동으로 ACCEPTED 포함하므로 옵션에서 숨김
 */
export function ParticipantsSelector({
  workspaceId,
  value,
  onChange,
  disabled = false,
  currentUserId,
}: ParticipantsSelectorProps) {
  const [members, setMembers] = useState<ReadonlyArray<WorkspaceMember>>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

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
        const list = await getMembersApi(accessToken, workspaceId);
        if (cancelled) return;
        setMembers(list);
        setLoadState("ready");
      } catch (err: unknown) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "멤버 목록을 불러오지 못했습니다.",
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  function toggle(userId: string) {
    const selected = new Set(value);
    if (selected.has(userId)) selected.delete(userId);
    else selected.add(userId);
    onChange([...selected]);
  }

  // 본인 제외한 옵션 — 작성자는 어차피 BE 가 자동 포함.
  const options = members.filter(
    (m) => !currentUserId || m.userId !== currentUserId,
  );

  if (loadState === "loading") {
    return (
      <p className="rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-xs text-fg-tertiary">
        멤버 불러오는 중…
      </p>
    );
  }

  if (loadState === "error") {
    return (
      <p
        role="alert"
        className="rounded-lg border border-priority-p1/30 bg-priority-p1/5 px-3 py-2 text-xs text-priority-p1"
      >
        {loadError ?? "멤버 목록을 불러오지 못했습니다."}
      </p>
    );
  }

  if (options.length === 0) {
    return (
      <p className="rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-xs text-fg-tertiary">
        초대할 수 있는 다른 멤버가 없습니다.
      </p>
    );
  }

  const selectedCount = value.length;

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-base">
      {/* 헤더: 선택 카운트 + 전체 해제 (선택 있을 때만) */}
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <span className="text-[11px] font-medium text-fg-tertiary">
          {selectedCount > 0
            ? `${selectedCount}명 선택됨`
            : `${options.length}명 중 선택`}
        </span>
        {selectedCount > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            className="text-[11px] font-medium text-fg-tertiary hover:text-fg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            전체 해제
          </button>
        ) : null}
      </div>

      {/* 멤버 리스트 */}
      <ul className="max-h-48 overflow-y-auto p-1">
        {options.map((m) => {
          const checked = value.includes(m.userId);
          return (
            <li key={m.userId}>
              <button
                type="button"
                onClick={() => toggle(m.userId)}
                disabled={disabled}
                aria-pressed={checked}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                  "hover:bg-surface-elevated focus-visible:bg-surface-elevated",
                  "outline-none focus-visible:ring-1 focus-visible:ring-accent/40",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  checked && "bg-accent/10 hover:bg-accent/15",
                )}
              >
                <Avatar
                  initials={m.user.name
                    .split(" ")
                    .map((s) => s[0] ?? "")
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                  color="blue"
                  size="sm"
                  name={m.user.name}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-fg-primary">
                  {m.user.name}
                </span>
                {/* 체크 상태 표시 — 체크 시 강조, 미체크는 hover 시 옅은 indicator */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    checked
                      ? "border-accent bg-accent text-white"
                      : "border-border-default text-transparent group-hover:border-border-strong",
                  )}
                >
                  <CheckIcon className="size-3" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
