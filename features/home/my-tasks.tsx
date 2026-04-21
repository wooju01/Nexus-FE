import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";
import { LabelPill } from "@/components/ui/label-pill";
import { PriorityPill } from "@/components/ui/priority-pill";
import { getProject } from "@/lib/mocks/projects";
import { getTasksAssignedTo } from "@/lib/mocks/tasks";
import { CURRENT_USER_ID } from "@/lib/mocks/users";

/**
 * 현재 사용자에게 할당된 Task 목록 (Home 우측 컬럼).
 * 실제로는 오늘/이번 주 단위로 필터링하겠지만, 지금은 모두 표시.
 */
export function MyTasks() {
  const tasks = getTasksAssignedTo(CURRENT_USER_ID);

  return (
    <section
      aria-label="내 할 일"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">My tasks</h2>
        <span className="text-xs text-fg-tertiary">{tasks.length}</span>
      </header>

      <ul className="divide-y divide-border-subtle">
        {tasks.map((task) => {
          const project = getProject(task.projectId);
          return (
            <li key={task.id}>
              <Link
                // 실제 라우트는 /projects/[slug]/tasks/[id] — 후속 단계.
                href={project ? `/projects/${project.slug}` : "#"}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <PriorityPill priority={task.priority} />
                    <span className="font-mono text-fg-tertiary">
                      {task.id}
                    </span>
                    {task.dueLabel ? (
                      <>
                        <span aria-hidden="true" className="text-fg-tertiary">
                          ·
                        </span>
                        <span className="text-fg-secondary">
                          {task.dueLabel}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-fg-primary">
                    {task.title}
                  </p>
                  {task.labels.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {task.labels.map((l) => (
                        <LabelPill
                          key={l.name}
                          label={l.name}
                          color={l.color}
                        />
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
    </section>
  );
}
