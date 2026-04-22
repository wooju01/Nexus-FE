import Link from "next/link";

import { MessageSquareIcon, PaperclipIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { LabelPill } from "@/components/ui/label-pill";
import { PriorityPill } from "@/components/ui/priority-pill";
import { getUser } from "@/lib/mocks/users";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/types/domain";

type TaskCardProps = {
  task: Task;
  /** 클릭 시 이동할 URL — 보통 `?task=<id>`로 상세 페인을 열기 위함. */
  selectHref?: string;
  /** 현재 선택된 태스크인지 — 카드 테두리 강조. */
  isSelected?: boolean;
};

/**
 * 보드 컬럼에 들어가는 단일 Task 카드.
 * 드래그/드롭은 후속 작업.
 */
export function TaskCard({ task, selectHref, isSelected }: TaskCardProps) {
  const assignees = task.assigneeIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const cardClass = cn(
    "group flex flex-col gap-2 rounded-lg border bg-surface-base p-3 shadow-sm transition-colors",
    isSelected
      ? "border-accent ring-1 ring-accent/40"
      : "border-border-subtle hover:border-border-default",
  );

  const body = (
    <>
      <header className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <PriorityPill priority={task.priority} />
          <span className="font-mono text-fg-tertiary">{task.id}</span>
        </div>
        {task.dueLabel ? (
          <span className="text-[11px] font-medium text-fg-secondary">
            {task.dueLabel}
          </span>
        ) : null}
      </header>

      <h3 className="text-sm leading-snug text-fg-primary">{task.title}</h3>

      {task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <LabelPill key={l.name} label={l.name} color={l.color} />
          ))}
        </div>
      ) : null}

      <footer className="mt-1 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {assignees.map((u) => (
            <Avatar
              key={u.id}
              initials={u.initials}
              color={u.avatarColor}
              size="xs"
              name={u.name}
              className="ring-2 ring-surface-base"
            />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-fg-tertiary">
          {(task.commentCount ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1">
              <MessageSquareIcon className="size-3.5" />
              {task.commentCount}
            </span>
          ) : null}
          {(task.attachmentCount ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1">
              <PaperclipIcon className="size-3.5" />
              {task.attachmentCount}
            </span>
          ) : null}
        </div>
      </footer>
    </>
  );

  if (selectHref) {
    return (
      <Link
        href={selectHref}
        aria-current={isSelected ? "true" : undefined}
        aria-label={`${task.id} ${task.title}`}
        className={cardClass}
      >
        {body}
      </Link>
    );
  }

  return (
    <article
      className={cardClass}
      role="button"
      tabIndex={0}
      aria-label={`${task.id} ${task.title}`}
    >
      {body}
    </article>
  );
}
