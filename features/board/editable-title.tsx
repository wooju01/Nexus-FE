"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils/cn";

type EditableTitleProps = {
  value: string;
  /** 저장 트리거(blur 또는 Enter). 빈 값/미변경이면 호출되지 않음. */
  onSave: (next: string) => void | Promise<void>;
  className?: string;
  /** 편집 input 의 maxLength. */
  maxLength?: number;
};

/**
 * 클릭 → input 전환, blur/Enter 시 저장, Escape 시 취소.
 *
 * - 빈 값은 저장 차단 (이전 값으로 복원)
 * - 값이 안 바뀌었으면 onSave 호출 안 함
 * - Escape 로 취소한 직후의 blur 도 저장으로 처리되지 않도록 플래그로 가드
 */
export function EditableTitle({
  value,
  onSave,
  className,
  maxLength = 200,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  // draft 는 편집 모드 진입 시 startEdit 에서 초기화한다.
  // 비편집 모드에서는 항상 value 가 렌더되므로 draft 와의 불일치는 무관.
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  function startEdit() {
    cancelledRef.current = false;
    setDraft(value);
    setIsEditing(true);
    // 다음 tick 에 포커스 + 전체 선택
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function commit() {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      setIsEditing(false);
      return;
    }
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      // 빈 값이거나 변경 없음 → 저장 안 함, 원래 값으로 복원
      setDraft(value);
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    void onSave(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelledRef.current = true;
      setDraft(value);
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full rounded-md border border-border-default bg-surface-base px-2 py-1 text-lg font-semibold leading-snug text-fg-primary outline-none ring-2 ring-accent/40",
          className,
        )}
        aria-label="제목 편집"
      />
    );
  }

  return (
    <h2
      role="button"
      tabIndex={0}
      onClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startEdit();
        }
      }}
      title="클릭하여 편집"
      className={cn(
        "cursor-text rounded-md px-2 py-1 -mx-2 text-lg font-semibold leading-snug text-fg-primary hover:bg-surface-elevated/60 focus:outline-none focus:ring-2 focus:ring-accent/40",
        className,
      )}
    >
      {value}
    </h2>
  );
}
