"use client";

import Link from "next/link";

import { MessageSquareIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import type { Task } from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";

type TaskCardProps = {
  task: Task;
  selectHref?: string;
  isSelected?: boolean;
};

export function TaskCard({ task, selectHref, isSelected }: TaskCardProps) {
  const cardClass = cn(
    "group flex flex-col gap-2 rounded-lg border bg-surface-base p-3 shadow-sm transition-colors",
    isSelected
      ? "border-accent ring-1 ring-accent/40"
      : "border-border-subtle hover:border-border-default",
  );

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
    : null;

  const body = (
    <>
      <header className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <PriorityPill priority={task.priority} />
          <span className="font-mono text-fg-tertiary">NX-{task.number}</span>
        </div>
        {dueLabel ? (
          <span className="text-[11px] font-medium text-fg-secondary">{dueLabel}</span>
        ) : null}
      </header>

      <h3 className="text-sm leading-snug text-fg-primary">{task.title}</h3>

      {(task.labels ?? []).length > 0 ? (
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
      ) : null}

      <footer className="mt-1 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {task.assignees.map(({ user }) => (
            <Avatar
              key={user.id}
              initials={user.name.slice(0, 2).toUpperCase()}
              color="blue"
              size="xs"
              name={user.name}
              className="ring-2 ring-surface-base"
            />
          ))}
        </div>

        {(task._count?.comments ?? 0) > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs text-fg-tertiary">
            <MessageSquareIcon className="size-3.5" />
            {task._count!.comments}
          </span>
        ) : null}
      </footer>
    </>
  );

  if (selectHref) {
    return (
      <Link
        href={selectHref}
        aria-current={isSelected ? "true" : undefined}
        aria-label={`NX-${task.number} ${task.title}`}
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
      aria-label={`NX-${task.number} ${task.title}`}
    >
      {body}
    </article>
  );
}
