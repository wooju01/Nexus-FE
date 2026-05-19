"use client";

import Link from "next/link";

import { PriorityPill } from "@/components/ui/priority-pill";
import { STATUS_LABEL, type Task } from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";

type TimelineViewProps = {
  tasks: ReadonlyArray<Task>;
  getSelectHref: (taskId: string) => string;
  selectedTaskId?: string;
};

/**
 * 마감일 기준 타임라인.
 *
 * 본격적인 Gantt/시간축 시각화는 추후. 우선 마감일이 가까운 순으로 정렬한
 * 단순 리스트 + 그룹(지남 / 오늘 / 이번주 / 이후 / 마감일 없음) 으로 표시.
 */
export function TimelineView({ tasks, getSelectHref, selectedTaskId }: TimelineViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        표시할 태스크가 없어요.
      </div>
    );
  }

  const groups = groupByDueBucket(tasks);

  return (
    <div className="flex-1 overflow-auto px-6 py-4">
      <div className="space-y-6">
        {GROUP_ORDER.map((key) => {
          const items = groups[key];
          if (items.length === 0) return null;
          return (
            <section key={key}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
                {GROUP_LABEL[key]} <span className="ml-1 text-fg-tertiary/70">{items.length}</span>
              </h3>
              <ul className="space-y-2">
                {items.map((t) => {
                  const due = t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—";
                  return (
                    <li
                      key={t.id}
                      className={cn(
                        "rounded-lg border border-border-subtle bg-surface-base px-3 py-2",
                        t.id === selectedTaskId && "border-accent ring-1 ring-accent/40",
                      )}
                    >
                      <Link
                        href={getSelectHref(t.id)}
                        className="flex items-center gap-3"
                      >
                        <PriorityPill priority={t.priority} />
                        <span className="font-mono text-xs text-fg-tertiary">
                          NX-{t.number}
                        </span>
                        <span className="flex-1 truncate text-sm text-fg-primary">
                          {t.title}
                        </span>
                        <span className="text-xs text-fg-secondary">
                          {STATUS_LABEL[t.status]}
                        </span>
                        <span className="w-16 shrink-0 text-right text-xs text-fg-secondary">
                          {due}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ── 그룹 ─────────────────────────────────────────────────────────────

type BucketKey = "overdue" | "today" | "thisWeek" | "later" | "none";
const GROUP_ORDER: BucketKey[] = ["overdue", "today", "thisWeek", "later", "none"];
const GROUP_LABEL: Record<BucketKey, string> = {
  overdue: "지남",
  today: "오늘",
  thisWeek: "이번 주",
  later: "이후",
  none: "마감일 없음",
};

function groupByDueBucket(tasks: ReadonlyArray<Task>): Record<BucketKey, Task[]> {
  const buckets: Record<BucketKey, Task[]> = {
    overdue: [],
    today: [],
    thisWeek: [],
    later: [],
    none: [],
  };

  const now = startOfDay(new Date());
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const sorted = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  for (const t of sorted) {
    if (!t.dueDate) {
      buckets.none.push(t);
      continue;
    }
    const d = startOfDay(new Date(t.dueDate));
    if (d.getTime() < now.getTime()) buckets.overdue.push(t);
    else if (d.getTime() === now.getTime()) buckets.today.push(t);
    else if (d.getTime() <= weekEnd.getTime()) buckets.thisWeek.push(t);
    else buckets.later.push(t);
  }

  return buckets;
}

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}
