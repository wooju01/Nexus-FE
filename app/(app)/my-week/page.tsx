"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { listCalendarEvents } from "@/lib/api/calendar";
import { getProjectsApi } from "@/lib/api/project";
import { getTasksApi, type Task, STATUS_LABEL, type TaskStatus } from "@/lib/api/task";
import { getAccessToken } from "@/lib/auth/tokens";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { useUser } from "@/features/auth/user-provider";
import type { CalendarEvent } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { FlagIcon } from "@/components/icons";

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  P1: "text-priority-p1",
  P2: "text-priority-p2",
  P3: "text-priority-p3",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "bg-fg-tertiary/30 text-fg-secondary",
  IN_PROGRESS: "bg-accent/20 text-accent",
  IN_REVIEW: "bg-purple-500/20 text-purple-400",
  BACKLOG: "bg-surface-elevated text-fg-tertiary",
  DONE: "bg-green-500/20 text-green-400",
};

const EVENT_COLORS: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  green: "bg-green-500/20 text-green-400 border-green-500/40",
  red: "bg-red-500/20 text-red-400 border-red-500/40",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/40",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
};

const DAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

// ─── 유틸 ──────────────────────────────────────────────────────────────────────

type TaskWithProject = Task & { projectName: string; projectId: string };

/** 이번 주 월요일 00:00 ~ 일요일 23:59:59 반환 */
function getThisWeekRange(): { start: Date; end: Date; days: Date[] } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  const sunday = days[6];
  const end = new Date(sunday);
  end.setHours(23, 59, 59, 999);

  return { start: monday, end, days };
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────────

export default function MyWeekPage() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useUser();

  const [tasks, setTasks] = useState<TaskWithProject[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hideCompleted, setHideCompleted] = useState(true);

  const { start, end, days } = useMemo(() => getThisWeekRange(), []);

  useEffect(() => {
    if (!currentWorkspace || !user) return;
    const token = getAccessToken();
    if (!token) return;

    setIsLoading(true);

    const tasksPromise = getProjectsApi(token, currentWorkspace.id)
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
        return allTasks
          .flat()
          .filter((t) => t.assignees.some((a) => a.userId === user.id));
      });

    const eventsPromise = listCalendarEvents(token, {
      workspaceId: currentWorkspace.id,
      from: start.toISOString(),
      to: end.toISOString(),
    }).catch(() => [] as CalendarEvent[]);

    Promise.all([tasksPromise, eventsPromise])
      .then(([myTasks, calEvents]) => {
        setTasks(myTasks);
        setEvents(calEvents);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentWorkspace, user, start, end]);

  /** 요일별로 태스크·이벤트 분류 */
  const dayData = useMemo(() => {
    return days.map((day) => {
      const dayTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        if (hideCompleted && t.status === "DONE") return false;
        return isSameDay(new Date(t.dueDate), day);
      });

      const dayEvents = events.filter((e) => {
        const eventStart = new Date(e.startAt);
        const eventEnd = new Date(e.endAt);
        // 이 날에 걸쳐있는 이벤트 포함
        return eventStart <= new Date(day.getTime() + 86400000 - 1) && eventEnd >= day;
      });

      return { day, tasks: dayTasks, events: dayEvents };
    });
  }, [days, tasks, events, hideCompleted]);

  // 이번 주 마감 태스크 전체 수 (상단 요약용)
  const totalThisWeekTasks = useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due >= start && due <= end;
      }).length,
    [tasks, start, end],
  );

  // 이번 주 이벤트 수
  const totalEvents = events.length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="shrink-0 border-b border-border-subtle px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-fg-primary">My Week</h1>
            {!isLoading && (
              <p className="mt-0.5 text-sm text-fg-tertiary">
                {totalThisWeekTasks}개 태스크 · {totalEvents}개 일정
              </p>
            )}
          </div>
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
        </div>
      </div>

      {/* 본문 */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-fg-tertiary">
          불러오는 중...
        </div>
      ) : (
        <div className="flex flex-1 overflow-x-auto">
          {dayData.map(({ day, tasks: dayTasks, events: dayEvents }, idx) => {
            const today = isToday(day);
            const isEmpty = dayTasks.length === 0 && dayEvents.length === 0;

            return (
              <div
                key={idx}
                className={cn(
                  "flex min-w-[160px] flex-1 flex-col border-r border-border-subtle last:border-r-0",
                  today && "bg-accent/[0.03]",
                )}
              >
                {/* 요일 헤더 */}
                <div
                  className={cn(
                    "sticky top-0 border-b border-border-subtle px-3 py-2.5 text-center",
                    today ? "bg-accent/[0.06]" : "bg-surface",
                  )}
                >
                  <p className={cn("text-xs font-semibold", today ? "text-accent" : "text-fg-tertiary")}>
                    {DAY_NAMES[idx]}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-lg font-bold leading-none",
                      today ? "text-accent" : "text-fg-primary",
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>

                {/* 이벤트 + 태스크 목록 */}
                <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                  {isEmpty && (
                    <p className="pt-4 text-center text-xs text-fg-tertiary">-</p>
                  )}

                  {/* 캘린더 이벤트 */}
                  {dayEvents.map((event) => {
                    const colorClass =
                      EVENT_COLORS[event.color ?? ""] ??
                      "bg-accent/20 text-accent border-accent/40";
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded-md border px-2 py-1.5 text-xs",
                          colorClass,
                        )}
                      >
                        <p className="font-medium leading-tight line-clamp-2">{event.title}</p>
                        {!event.allDay && (
                          <p className="mt-0.5 opacity-70">
                            {formatTime(event.startAt)} – {formatTime(event.endAt)}
                          </p>
                        )}
                        {event.allDay && (
                          <p className="mt-0.5 opacity-70">종일</p>
                        )}
                      </div>
                    );
                  })}

                  {/* 마감 태스크 */}
                  {dayTasks.map((task) => {
                    const isPast = new Date(task.dueDate!) < new Date() && task.status !== "DONE";
                    return (
                      <Link
                        key={task.id}
                        href={`/projects/${task.projectId}?task=${task.id}`}
                        className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-elevated px-2 py-1.5 text-xs transition-colors hover:bg-surface-elevated/80"
                      >
                        <div className="flex items-start gap-1.5">
                          <FlagIcon
                            className={cn(
                              "mt-0.5 size-3 shrink-0",
                              PRIORITY_COLOR[task.priority] ?? "text-fg-tertiary",
                            )}
                          />
                          <span
                            className={cn(
                              "line-clamp-2 flex-1 font-medium leading-tight",
                              task.status === "DONE"
                                ? "text-fg-tertiary line-through"
                                : isPast
                                  ? "text-priority-p1"
                                  : "text-fg-primary",
                            )}
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-fg-tertiary">{task.projectName}</span>
                          <span
                            className={cn(
                              "shrink-0 rounded px-1 py-0.5 font-medium",
                              STATUS_COLOR[task.status],
                            )}
                          >
                            {STATUS_LABEL[task.status]}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
