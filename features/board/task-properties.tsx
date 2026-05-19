"use client";

import { XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";

import { AssigneePicker } from "./assignee-picker";
import { LabelPicker } from "./label-picker";
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
  onUpdate: (patch: UpdateTaskPayload) => void;
};

/** Date 객체 → "YYYY-MM-DD" (input[type=date] 호환). */
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TaskProperties({ task, onUpdate }: TaskPropertiesProps) {
  const dateInputValue = toDateInputValue(task.dueDate);

  function handleDueChange(value: string) {
    if (!value) {
      // 빈 값 → 마감일 제거. BE 가 dueDate: null 을 unset 으로 처리.
      onUpdate({ dueDate: null });
      return;
    }
    // input[type=date] 의 값(YYYY-MM-DD)을 ISO 형식으로 보냄.
    onUpdate({ dueDate: new Date(value).toISOString() });
  }

  function handleAssigneesChange(assigneeIds: string[]) {
    onUpdate({ assigneeIds });
  }

  function handleLabelsChange(labelIds: string[]) {
    onUpdate({ labelIds });
  }

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

      {/* Assignees — 멤버 추가/제거 (인라인 편집) */}
      <Row label="Assignees">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
          <AssigneePicker task={task} onChange={handleAssigneesChange} />
        </div>
      </Row>

      {/* Due date — 인라인 편집 + 지우기 */}
      <Row label="Due date">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateInputValue}
            onChange={(e) => handleDueChange(e.target.value)}
            className="bg-transparent text-sm text-fg-primary focus:outline-none"
            aria-label="마감일"
          />
          {dateInputValue ? (
            <button
              type="button"
              onClick={() => handleDueChange("")}
              title="마감일 지우기"
              aria-label="마감일 지우기"
              className="flex size-5 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}
        </div>
      </Row>

      {/* Labels — 라벨 추가/제거 (인라인 편집) */}
      <Row label="Labels">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {(task.labels ?? []).length === 0 ? (
            <span className="text-fg-tertiary">없음</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {(task.labels ?? []).map((l) => (
                <span
                  key={l.labelId}
                  className="rounded-full px-2 py-0.5 text-[11px] text-fg-primary"
                  style={{
                    backgroundColor: `${l.label.color}22`,
                    color: l.label.color,
                  }}
                >
                  {l.label.name}
                </span>
              ))}
            </div>
          )}
          <LabelPicker task={task} onChange={handleLabelsChange} />
        </div>
      </Row>

    </dl>
  );
}
