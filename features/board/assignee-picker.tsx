"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PlusIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getMembersApi, type WorkspaceMember } from "@/lib/api/member";
import type { Task } from "@/lib/api/task";
import { getAccessToken } from "@/lib/auth/tokens";
import { cn } from "@/lib/utils/cn";
import { useWorkspace } from "@/features/workspace/workspace-provider";

type AssigneePickerProps = {
  task: Task;
  /** 현재 담당자 → 변경된 user id 배열로 PATCH 처리. */
  onChange: (assigneeIds: string[]) => void | Promise<void>;
};

/**
 * 담당자 추가/제거 팝오버.
 *
 * - `+` 트리거 버튼 클릭 → 팝오버 오픈
 * - 워크스페이스 멤버를 검색 + 체크박스로 토글
 * - 토글 즉시 onChange(현재 선택된 userId 배열) 호출 → 부모가 PATCH 수행
 * - 외부 클릭/Escape 로 닫기
 *
 * 외부 라이브러리 없이 absolute positioned div 로 구현.
 */
export function AssigneePicker({ task, onChange }: AssigneePickerProps) {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // 팝오버 열 때 한 번만 멤버 로드
  useEffect(() => {
    if (!isOpen || loaded || !workspaceId) return;
    const token = getAccessToken();
    if (!token) return;
    getMembersApi(token, workspaceId)
      .then((m) => {
        setMembers(m);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [isOpen, loaded, workspaceId]);

  // 외부 클릭 / Escape 로 닫기
  useEffect(() => {
    if (!isOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // 팝오버 열린 직후 검색 input 포커스
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isOpen]);

  const selectedIds = useMemo(
    () => new Set(task.assignees.map((a) => a.userId)),
    [task.assignees],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.user.name.toLowerCase().includes(q));
  }, [members, query]);

  const toggleMember = useCallback(
    (userId: string) => {
      const next = new Set(selectedIds);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      void onChange(Array.from(next));
    },
    [selectedIds, onChange],
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="담당자 추가"
        title="담당자 추가"
        className="inline-flex size-5 items-center justify-center rounded border border-dashed border-border-default text-fg-tertiary hover:border-border-strong hover:text-fg-primary"
      >
        <PlusIcon className="size-3" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="담당자 선택"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-border-subtle bg-surface-elevated p-1 shadow-lg"
        >
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 검색"
            className="mb-1 w-full rounded-md border-0 bg-surface-base px-2 py-1.5 text-xs text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <ul className="max-h-60 overflow-y-auto py-0.5">
            {!loaded ? (
              <li className="px-2 py-2 text-xs text-fg-tertiary">불러오는 중…</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-2 text-xs text-fg-tertiary">
                {query ? "일치하는 멤버가 없어요." : "워크스페이스 멤버가 없어요."}
              </li>
            ) : (
              filtered.map((m) => {
                const isSelected = selectedIds.has(m.user.id);
                return (
                  <li key={m.user.id}>
                    <button
                      type="button"
                      onClick={() => toggleMember(m.user.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-base",
                        isSelected && "bg-accent/10",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        tabIndex={-1}
                        className="size-3.5 accent-accent"
                      />
                      <Avatar
                        initials={m.user.name.slice(0, 2).toUpperCase()}
                        color="blue"
                        size="xs"
                        name={m.user.name}
                      />
                      <span className="flex-1 truncate text-fg-primary">{m.user.name}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
