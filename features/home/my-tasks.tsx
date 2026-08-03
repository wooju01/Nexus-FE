"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { PriorityPill } from "@/components/ui/priority-pill";
import { getAccessToken } from "@/lib/auth/tokens";
import { getMyTasksApi, type MyTask } from "@/lib/api/task";

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}일 초과`;
  if (diff === 0) return "오늘 마감";
  if (diff === 1) return "내일 마감";
  return `${diff}일 남음`;
}

function isDueSoon(iso: string | null): boolean {
  if (!iso) return false;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}

export function MyTasks() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    getMyTasksApi(token)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      aria-label="내 할 일"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">My tasks</h2>
        <span className="text-xs text-fg-tertiary">
          {loading ? "..." : tasks.length}
        </span>
      </header>

      {loading ? (
        <div className="px-4 py-6 text-center text-sm text-fg-tertiary">
          불러오는 중...
        </div>
      ) : tasks.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-fg-tertiary">
          할당된 태스크가 없어요.
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {tasks.map((task) => {
            const dueLabel = formatDueDate(task.dueDate);
            const overdue = isDueSoon(task.dueDate);
            return (
              <li key={task.id}>
                <Link
                  href={`/projects/${task.projectId}?task=${task.id}`}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <PriorityPill priority={task.priority} />
                      <span className="font-mono text-fg-tertiary">
                        NX-{task.number}
                      </span>
                      <span className="truncate text-fg-tertiary">
                        {task.project.name}
                      </span>
                      {dueLabel ? (
                        <>
                          <span aria-hidden="true" className="text-fg-tertiary">·</span>
                          <span className={overdue ? "font-medium text-priority-p1" : "text-fg-secondary"}>
                            {dueLabel}
                          </span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-fg-primary">
                      {task.title}
                    </p>
                    {task.labels.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.labels.map((l) => (
                          <span
                            key={l.labelId}
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: `${l.label.color}25`, color: l.label.color }}
                          >
                            {l.label.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <ChevronRightIcon className="mt-1 size-4 shrink-0 text-fg-tertiary" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
