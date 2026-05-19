"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ChevronDownIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

export type FilterOption = {
  id: string;
  label: string;
};

type BoardFilterBarProps = {
  assigneeOptions: ReadonlyArray<FilterOption>;
  labelOptions: ReadonlyArray<FilterOption>;
  selectedAssigneeIds: ReadonlyArray<string>;
  selectedLabelIds: ReadonlyArray<string>;
  selectedPriorities: ReadonlyArray<"P1" | "P2" | "P3">;
  onAssigneesChange: (ids: string[]) => void;
  onLabelsChange: (ids: string[]) => void;
  onPrioritiesChange: (ps: Array<"P1" | "P2" | "P3">) => void;
  onClearAll: () => void;
};

const PRIORITY_OPTIONS: ReadonlyArray<FilterOption> = [
  { id: "P1", label: "P1 — 긴급" },
  { id: "P2", label: "P2 — 보통" },
  { id: "P3", label: "P3 — 낮음" },
];

/**
 * 보드 필터 바.
 *
 * - 헤더의 Filter 버튼이 토글하는 가로 막대. 헤더 아래에 표시.
 * - 담당자/라벨/우선순위 세 가지 멀티 셀렉트 + 전체 지우기.
 * - 옵션은 부모(board-view)가 현재 tasks 에서 추출해 내려보냄.
 * - 선택 상태/변경도 모두 부모가 URL query 와 동기화.
 */
export function BoardFilterBar({
  assigneeOptions,
  labelOptions,
  selectedAssigneeIds,
  selectedLabelIds,
  selectedPriorities,
  onAssigneesChange,
  onLabelsChange,
  onPrioritiesChange,
  onClearAll,
}: BoardFilterBarProps) {
  const hasAny =
    selectedAssigneeIds.length > 0 ||
    selectedLabelIds.length > 0 ||
    selectedPriorities.length > 0;

  return (
    <div
      role="toolbar"
      aria-label="보드 필터"
      className="flex items-center gap-2 border-b border-border-subtle bg-surface-subtle/60 px-6 py-2"
    >
      <FilterDropdown
        label="담당자"
        options={assigneeOptions}
        selectedIds={selectedAssigneeIds}
        onChange={onAssigneesChange}
        emptyHint="이 보드에 담당자가 없어요"
      />
      <FilterDropdown
        label="라벨"
        options={labelOptions}
        selectedIds={selectedLabelIds}
        onChange={onLabelsChange}
        emptyHint="이 보드에 라벨이 없어요"
      />
      <FilterDropdown
        label="우선순위"
        options={PRIORITY_OPTIONS}
        selectedIds={selectedPriorities}
        onChange={(ids) =>
          onPrioritiesChange(ids as Array<"P1" | "P2" | "P3">)
        }
      />

      {hasAny ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <XIcon className="size-3" />
          필터 모두 지우기
        </button>
      ) : null}
    </div>
  );
}

// ── 내부: 드롭다운 한 칸 ─────────────────────────────────────────────────

type FilterDropdownProps = {
  label: string;
  options: ReadonlyArray<FilterOption>;
  selectedIds: ReadonlyArray<string>;
  onChange: (ids: string[]) => void;
  emptyHint?: string;
};

function FilterDropdown({
  label,
  options,
  selectedIds,
  onChange,
  emptyHint,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 / Escape 닫기
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

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange(Array.from(next));
    },
    [selectedSet, onChange],
  );

  const summary: ReactNode =
    selectedIds.length === 0
      ? label
      : (
        <>
          <span>{label}</span>
          <span className="ml-1 rounded-full bg-accent/15 px-1.5 text-[10px] font-semibold text-accent">
            {selectedIds.length}
          </span>
        </>
      );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-elevated px-2 py-1 text-xs text-fg-secondary hover:text-fg-primary",
          selectedIds.length > 0 && "border-accent/40 text-fg-primary",
        )}
      >
        {summary}
        <ChevronDownIcon className="size-3 text-fg-tertiary" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={`${label} 선택`}
          className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border-subtle bg-surface-elevated p-1 shadow-lg"
        >
          <ul className="max-h-60 overflow-y-auto py-0.5">
            {options.length === 0 ? (
              <li className="px-2 py-2 text-xs text-fg-tertiary">
                {emptyHint ?? "옵션 없음"}
              </li>
            ) : (
              options.map((opt) => {
                const isSel = selectedSet.has(opt.id);
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => toggle(opt.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-surface-base",
                        isSel && "bg-accent/10",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        readOnly
                        tabIndex={-1}
                        className="size-3.5 accent-accent"
                      />
                      <span className="flex-1 truncate text-fg-primary">{opt.label}</span>
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
