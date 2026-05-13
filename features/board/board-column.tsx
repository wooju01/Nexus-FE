import { PlusIcon } from "@/components/icons";
import type { Task } from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";
import type { BoardColumnKey } from "@/types/domain";

import { TaskCard } from "./task-card";

type BoardColumnProps = {
  columnKey: BoardColumnKey;
  label: string;
  tasks: ReadonlyArray<Task>;
  wipLimit?: number;
  getSelectHref?: (taskId: string) => string;
  selectedTaskId?: string;
};

/**
 * 컬럼별 헤더 액센트 색. Linear-style로 상태를 시각 구분.
 */
const COLUMN_DOT_CLASS: Record<BoardColumnKey, string> = {
  Backlog: "bg-status-backlog",
  "To do": "bg-status-todo",
  "In progress": "bg-status-in-progress",
  "In review": "bg-status-in-review",
};

export function BoardColumn({
  columnKey,
  label,
  tasks,
  wipLimit,
  getSelectHref,
  selectedTaskId,
}: BoardColumnProps) {
  const count = tasks.length;
  const isOverLimit = wipLimit !== undefined && count > wipLimit;

  return (
    <section
      aria-label={`${label} 컬럼`}
      className="flex w-72 shrink-0 flex-col rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 rounded-full", COLUMN_DOT_CLASS[columnKey])}
          />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-fg-primary">
            {label}
          </h3>
          <span
            className={cn(
              "text-xs",
              isOverLimit ? "text-priority-p1" : "text-fg-tertiary",
            )}
          >
            {wipLimit === undefined ? count : `${count} / ${wipLimit}`}
          </span>
        </div>
        <button
          type="button"
          aria-label={`${label}에 Task 추가`}
          title={`${label}에 Task 추가 — 준비 중`}
          className="flex size-6 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tasks.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-fg-tertiary">
            비어있어요.
          </p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              selectHref={getSelectHref ? getSelectHref(t.id) : undefined}
              isSelected={t.id === selectedTaskId}
            />

          ))
        )}
      </div>
    </section>
  );
}
