"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { getAccessToken } from "@/lib/auth/tokens";
import { useUser } from "@/features/auth/user-provider";
import {
  getProjectMembersApi,
  addProjectMemberApi,
  removeProjectMemberApi,
  updateProjectMemberApi,
  type ProjectMember,
} from "@/lib/api/project";
import { getMembersApi, type WorkspaceMember } from "@/lib/api/member";

type Props = {
  projectId: string;
  workspaceId: string;
  onClose: () => void;
};

/** 역할 뱃지 */
function RoleBadge({ role }: { role: "MANAGER" | "MEMBER" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        role === "MANAGER"
          ? "bg-accent/15 text-accent"
          : "bg-surface-overlay text-fg-tertiary",
      )}
    >
      {role === "MANAGER" ? "Manager" : "Member"}
    </span>
  );
}

/** 유저 아바타 */
function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="size-7 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-7 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function ProjectMemberPanel({ projectId, workspaceId, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useUser();

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [wsMembers, setWsMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 현재 유저의 프로젝트 역할 (목록에 없으면 null — WS OWNER/ADMIN은 별도 권한)
  const myRole = members.find((m) => m.user.id === currentUser?.id)?.role ?? null;
  const canManage = myRole === "MANAGER";

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // ESC 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fetchData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [pm, wm] = await Promise.all([
        getProjectMembersApi(token, projectId),
        getMembersApi(token, workspaceId),
      ]);
      setMembers(pm);
      setWsMembers(wm);
    } catch {
      setError("멤버 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, workspaceId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // 이미 프로젝트에 추가된 userId Set
  const memberIds = new Set(members.map((m) => m.user.id));

  // 초대 가능한 워크스페이스 멤버 (아직 프로젝트에 없는 사람)
  const invitableMembers = wsMembers.filter((wm) => !memberIds.has(wm.user.id));

  async function handleAdd(userId: string) {
    const token = getAccessToken();
    if (!token) return;
    setIsAdding(true);
    setError(null);
    try {
      const newMember = await addProjectMemberApi(token, projectId, { userId });
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "초대에 실패했습니다.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemove(targetUserId: string) {
    const token = getAccessToken();
    if (!token) return;
    setRemovingId(targetUserId);
    setError(null);
    try {
      await removeProjectMemberApi(token, projectId, targetUserId);
      setMembers((prev) => prev.filter((m) => m.user.id !== targetUserId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "멤버 제거에 실패했습니다.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleRoleChange(targetUserId: string, newRole: "MANAGER" | "MEMBER") {
    const token = getAccessToken();
    if (!token) return;
    setUpdatingId(targetUserId);
    setError(null);
    try {
      const updated = await updateProjectMemberApi(token, projectId, targetUserId, newRole);
      setMembers((prev) => prev.map((m) => (m.user.id === targetUserId ? updated : m)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "역할 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-border-subtle bg-surface-elevated shadow-xl"
      role="dialog"
      aria-label="프로젝트 멤버 관리"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">프로젝트 멤버</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded-md p-1 text-fg-tertiary hover:bg-surface-overlay hover:text-fg-primary"
        >
          ✕
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto p-3">
        {error ? (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="py-6 text-center text-xs text-fg-tertiary">불러오는 중...</p>
        ) : (
          <>
            {/* 현재 프로젝트 멤버 */}
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">
              현재 멤버 ({members.length})
            </p>
            <ul className="mb-4 space-y-1">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-overlay"
                >
                  <Avatar name={m.user.name} avatar={m.user.avatar} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm text-fg-primary">
                      {m.user.name}
                    </span>
                    <span className="truncate text-[11px] text-fg-tertiary">
                      {m.user.email}
                    </span>
                  </div>

                  {/* 역할 표시 / Manager일 때만 변경 가능 */}
                  {canManage && m.user.id !== currentUser?.id ? (
                    <button
                      type="button"
                      disabled={updatingId === m.user.id}
                      onClick={() =>
                        handleRoleChange(
                          m.user.id,
                          m.role === "MANAGER" ? "MEMBER" : "MANAGER",
                        )
                      }
                      title={m.role === "MANAGER" ? "Member로 변경" : "Manager로 승격"}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity",
                        m.role === "MANAGER"
                          ? "bg-accent/15 text-accent hover:bg-accent/30"
                          : "bg-surface-overlay text-fg-tertiary hover:bg-surface-overlay/80 hover:text-fg-secondary",
                        updatingId === m.user.id && "opacity-50",
                      )}
                    >
                      {updatingId === m.user.id
                        ? "..."
                        : m.role === "MANAGER"
                          ? "Manager"
                          : "Member"}
                    </button>
                  ) : (
                    <RoleBadge role={m.role} />
                  )}

                  {/* 제거 버튼 — Manager만 표시, 자기 자신은 제외 */}
                  {canManage && m.user.id !== currentUser?.id ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.user.id)}
                      disabled={removingId === m.user.id}
                      aria-label={`${m.user.name} 제거`}
                      className="ml-1 rounded p-0.5 text-fg-tertiary opacity-0 hover:text-red-400 group-hover:opacity-100"
                    >
                      {removingId === m.user.id ? "..." : "✕"}
                    </button>
                  ) : null}
                </li>
              ))}
              {members.length === 0 ? (
                <li className="py-2 text-center text-xs text-fg-tertiary">
                  멤버가 없습니다.
                </li>
              ) : null}
            </ul>

            {/* 초대하기 — Manager만 표시 */}
            {canManage && invitableMembers.length > 0 ? (
              <>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">
                  초대하기
                </p>
                <ul className="space-y-1">
                  {invitableMembers.map((wm) => (
                    <li
                      key={wm.user.id}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-overlay"
                    >
                      <Avatar name={wm.user.name} avatar={wm.user.avatar} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm text-fg-primary">
                          {wm.user.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdd(wm.user.id)}
                        disabled={isAdding}
                        className="rounded-md border border-border-subtle px-2 py-0.5 text-xs text-fg-secondary hover:border-accent/40 hover:text-accent disabled:opacity-50"
                      >
                        추가
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
