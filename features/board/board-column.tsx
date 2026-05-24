import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  /**
   * + 버튼 클릭 알림. 부모에서 CreateTaskModal 을 열고 status 를 자동 적용한다.
   * 미지정이면 + 버튼이 disabled.
   */
  onAdd?: () => void;
};

const COLUMN_DOT_CLASS: Record<BoardColumnKey, string> = {
  Backlog: "bg-status-backlog",
  "To do": "bg-status-todo",
  "In progress": "bg-status-in-progress",
  "In review": "bg-status-in-review",
  Done: "bg-status-done",
};

export function BoardColumn({
  columnKey,
  label,
  tasks,
  wipLimit,
  getSelectHref,
  selectedTaskId,
  onAdd,
}: BoardColumnProps) {
  const count = tasks.length;
  const isOverLimit = wipLimit !== undefined && count > wipLimit;

  // droppable 의 data.type 으로 컬럼/카드 드롭을 구분 (handleDragEnd 에서 분기).
  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
    data: { type: "column", columnKey },
  });

  const taskIds = tasks.map((t) => t.id);

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
          onClick={onAdd}
          disabled={!onAdd}
          aria-label={`${label}에 Task 추가`}
          title={onAdd ? `${label}에 Task 추가` : "준비 중"}
          className="flex size-6 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors",
          isOver && "bg-surface-elevated/50 ring-1 ring-inset ring-accent/30",
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className={cn(
              "px-2 py-6 text-center text-xs transition-opacity",
              isOver ? "text-fg-tertiary opacity-0" : "text-fg-tertiary",
            )}>
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
        </SortableContext>
      </div>
    </section>
  );
}
