"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { PlusIcon } from "@/components/icons";
import { getLabelsApi, type WorkspaceLabel } from "@/lib/api/label";
import type { Task } from "@/lib/api/task";
import { getAccessToken } from "@/lib/auth/tokens";
import { cn } from "@/lib/utils/cn";
import { useWorkspace } from "@/features/workspace/workspace-provider";

type LabelPickerProps = {
  task: Task;
  /** 변경된 라벨 id 배열로 PATCH 처리. */
  onChange: (labelIds: string[]) => void | Promise<void>;
};

/**
 * 라벨 추가/제거 팝오버.
 *
 * - `+` 트리거 → 팝오버 오픈
 * - 워크스페이스 라벨을 검색 + 체크박스로 토글
 * - 토글 즉시 onChange(현재 선택된 labelId 배열) 호출 → 부모가 PATCH 수행
 *
 * AssigneePicker 와 동일 패턴.
 */
export function LabelPicker({ task, onChange }: LabelPickerProps) {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [labels, setLabels] = useState<WorkspaceLabel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || loaded || !workspaceId) return;
    const token = getAccessToken();
    if (!token) return;
    getLabelsApi(token, workspaceId)
      .then((l) => {
        setLabels(l);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [isOpen, loaded, workspaceId]);

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

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isOpen]);

  const selectedIds = useMemo(
    () => new Set((task.labels ?? []).map((l) => l.labelId)),
    [task.labels],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((l) => l.name.toLowerCase().includes(q));
  }, [labels, query]);

  const toggleLabel = useCallback(
    (labelId: string) => {
      const next = new Set(selectedIds);
      if (next.has(labelId)) next.delete(labelId);
      else next.add(labelId);
      void onChange(Array.from(next));
    },
    [selectedIds, onChange],
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="라벨 추가"
        title="라벨 추가"
        className="inline-flex size-5 items-center justify-center rounded border border-dashed border-border-default text-fg-tertiary hover:border-border-strong hover:text-fg-primary"
      >
        <PlusIcon className="size-3" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="라벨 선택"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-border-subtle bg-surface-elevated p-1 shadow-lg"
        >
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="라벨 검색"
            className="mb-1 w-full rounded-md border-0 bg-surface-base px-2 py-1.5 text-xs text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <ul className="max-h-60 overflow-y-auto py-0.5">
            {!loaded ? (
              <li className="px-2 py-2 text-xs text-fg-tertiary">불러오는 중…</li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-2 text-xs text-fg-tertiary">
                {query ? "일치하는 라벨이 없어요." : "워크스페이스 라벨이 없어요."}
              </li>
            ) : (
              filtered.map((l) => {
                const isSelected = selectedIds.has(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => toggleLabel(l.id)}
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
                      <span
                        aria-hidden="true"
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      <span className="flex-1 truncate text-fg-primary">{l.name}</span>
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
