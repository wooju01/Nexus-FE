"use client";

import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import type { Task, TaskPriority, TaskStatus } from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";

import { Row } from "./task-detail-atoms";

// BE enum → 화면 표시 문자열
const STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  BACKLOG: "bg-status-backlog",
  TODO: "bg-status-todo",
  IN_PROGRESS: "bg-status-in-progress",
  IN_REVIEW: "bg-status-in-review",
  DONE: "bg-status-done",
};

const STATUS_OPTIONS: TaskStatus[] = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITY_OPTIONS: TaskPriority[] = ["P1", "P2", "P3"];

type TaskPropertiesProps = {
  task: Task;
  // 부모(TaskDetailPane)에서 PATCH 요청을 처리하고 task 상태를 갱신
  onUpdate: (patch: { status?: TaskStatus; priority?: TaskPriority }) => void;
};

export function TaskProperties({ task, onUpdate }: TaskPropertiesProps) {
  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : null;

  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-y-2.5 border-y border-border-subtle bg-surface-subtle/40 px-5 py-4 text-sm">

      {/* Status — 드롭다운으로 바로 변경 가능 */}
      <Row label="Status">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-2 shrink-0 rounded-sm", STATUS_DOT_CLASS[task.status])}
          />
          <select
            value={task.status}
            onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
            className="bg-transparent text-sm text-fg-primary focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
      </Row>

      {/* Priority — 드롭다운으로 바로 변경 가능 */}
      <Row label="Priority">
        <div className="flex items-center gap-2">
          <PriorityPill priority={task.priority} />
          <select
            value={task.priority}
            onChange={(e) => onUpdate({ priority: e.target.value as TaskPriority })}
            className="bg-transparent text-sm text-fg-primary focus:outline-none"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </Row>

      {/* Assignees — API 응답의 assignees 배열 직접 사용 (목 제거) */}
      <Row label="Assignees">
        {task.assignees.length === 0 ? (
          <span className="text-fg-tertiary">미지정</span>
        ) : (
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {task.assignees.map(({ user }) => (
              <li key={user.id} className="flex items-center gap-1.5">
                <Avatar
                  initials={user.name.slice(0, 2).toUpperCase()}
                  color="blue"
                  size="xs"
                  name={user.name}
                />
                <span className="text-fg-primary">{user.name}</span>
              </li>
            ))}
          </ul>
        )}
      </Row>

      <Row label="Due date">
        <span className={dueLabel ? "text-fg-primary" : "text-fg-tertiary"}>
          {dueLabel ?? "No due date"}
        </span>
      </Row>

      {task.labels.length > 0 ? (
        <Row label="Labels">
          <div className="flex flex-wrap gap-1">
            {task.labels.map((l) => (
              <span
                key={l.labelId}
                className="rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] text-fg-secondary"
              >
                {l.label.name}
              </span>
            ))}
          </div>
        </Row>
      ) : null}

    </dl>
  );
}
