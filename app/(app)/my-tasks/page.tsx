"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { getProjectsApi } from "@/lib/api/project";
import { getTasksApi, type Task, type TaskStatus, STATUS_LABEL } from "@/lib/api/task";
import { getAccessToken } from "@/lib/auth/tokens";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { useUser } from "@/features/auth/user-provider";
import { cn } from "@/lib/utils/cn";
import { FlagIcon } from "@/components/icons";

const PRIORITY_COLOR: Record<string, string> = {
  P1: "text-priority-p1",
  P2: "text-priority-p2",
  P3: "text-priority-p3",
};

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BACKLOG", "DONE"];

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "bg-fg-tertiary/30 text-fg-secondary",
  IN_PROGRESS: "bg-accent/20 text-accent",
  IN_REVIEW: "bg-purple-500/20 text-purple-400",
  BACKLOG: "bg-surface-elevated text-fg-tertiary",
  DONE: "bg-green-500/20 text-green-400",
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const isOverdue = d < now;
  const str = d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  return { str, isOverdue };
}

type TaskWithProject = Task & { projectName: string; projectId: string };

export default function MyTasksPage() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useUser();

  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"status" | "project">("status");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    if (!currentWorkspace || !user) return;
    const token = getAccessToken();
    if (!token) return;

    setIsLoading(true);

    getProjectsApi(token, currentWorkspace.id)
      .then(async (projects) => {
        const allTasks = await Promise.all(
          projects.map((p) =>
            getTasksApi(token, p.id)
              .then((tasks) =>
                tasks.map((t) => ({ ...t, projectName: p.name, projectId: p.id })),
              )
              .catch(() => [] as TaskWithProject[]),
          ),
        );
        // 내 assignee 필터링
        const myTasks = allTasks
          .flat()
          .filter((t) => t.assignees.some((a) => a.userId === user.id));
        setTasks(myTasks);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentWorkspace, user]);

  const filtered = useMemo(
    () => (hideCompleted ? tasks.filter((t) => t.status !== "DONE") : tasks),
    [tasks, hideCompleted],
  );

  // 그룹화
  const groups = useMemo(() => {
    if (groupBy === "status") {
      return STATUS_ORDER.map((status) => ({
        key: status,
        label: STATUS_LABEL[status],
        items: filtered.filter((t) => t.status === status),
      })).filter((g) => g.items.length > 0);
    } else {
      const map = new Map<string, { label: string; items: TaskWithProject[] }>();
      filtered.forEach((t) => {
        if (!map.has(t.projectId)) map.set(t.projectId, { label: t.projectName, items: [] });
        map.get(t.projectId)!.items.push(t);
      });
      return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }));
    }
  }, [filtered, groupBy]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg-primary">My Tasks</h1>
          <p className="mt-0.5 text-sm text-fg-tertiary">
            {isLoading ? "불러오는 중..." : `총 ${filtered.length}개의 태스크`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideCompleted((v) => !v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              hideCompleted
                ? "bg-accent/10 text-accent"
                : "text-fg-secondary hover:bg-surface-elevated",
            )}
          >
            완료 숨기기
          </button>
          <div className="flex rounded-lg border border-border-subtle overflow-hidden">
            {(["status", "project"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupBy(g)}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  groupBy === g
                    ? "bg-surface-elevated text-fg-primary"
                    : "text-fg-tertiary hover:text-fg-primary",
                )}
              >
                {g === "status" ? "상태별" : "프로젝트별"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 태스크 목록 */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-fg-tertiary">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-fg-tertiary">
          배정된 태스크가 없어요.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
                  {group.label}
                </h2>
                <span className="text-xs text-fg-tertiary">{group.items.length}</span>
              </div>
              <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle overflow-hidden">
                {group.items.map((task) => {
                  const due = formatDate(task.dueDate);
                  return (
                    <li key={task.id}>
                      <Link
                        href={`/projects/${task.projectId}?task=${task.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors"
                      >
                        {/* 우선순위 */}
                        <FlagIcon className={cn("size-3.5 shrink-0", PRIORITY_COLOR[task.priority] ?? "text-fg-tertiary")} />

                        {/* 제목 */}
                        <span className="flex-1 truncate text-sm text-fg-primary">{task.title}</span>

                        {/* 프로젝트명 (상태별 그룹일 때) */}
                        {groupBy === "status" && (
                          <span className="shrink-0 text-xs text-fg-tertiary">{task.projectName}</span>
                        )}

                        {/* 상태 뱃지 (프로젝트별 그룹일 때) */}
                        {groupBy === "project" && (
                          <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-medium", STATUS_COLOR[task.status])}>
                            {STATUS_LABEL[task.status]}
                          </span>
                        )}

                        {/* 마감일 */}
                        {due && (
                          <span className={cn("shrink-0 text-xs", due.isOverdue ? "text-priority-p1 font-medium" : "text-fg-tertiary")}>
                            {due.isOverdue ? "⚠ " : ""}{due.str}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
