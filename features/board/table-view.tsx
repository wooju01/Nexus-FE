"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import { STATUS_LABEL, type Task } from "@/lib/api/task";
import { cn } from "@/lib/utils/cn";

type TableViewProps = {
  tasks: ReadonlyArray<Task>;
  /** 행 클릭 시 이동할 ?task= URL 생성. */
  getSelectHref: (taskId: string) => string;
  selectedTaskId?: string;
};

const HEADER_CLASS =
  "sticky top-0 z-[1] border-b border-border-subtle bg-surface-base px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary";
const CELL_CLASS = "px-3 py-2 align-middle";

/**
 * 보드 데이터를 단순 표로 표시.
 * 행 클릭 → ?task= 쿼리로 상세 패널.
 */
export function TableView({ tasks, getSelectHref, selectedTaskId }: TableViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        표시할 태스크가 없어요.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className={HEADER_CLASS}>#</th>
            <th className={HEADER_CLASS}>제목</th>
            <th className={HEADER_CLASS}>상태</th>
            <th className={HEADER_CLASS}>우선순위</th>
            <th className={HEADER_CLASS}>담당자</th>
            <th className={HEADER_CLASS}>마감일</th>
            <th className={HEADER_CLASS}>라벨</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const isSelected = t.id === selectedTaskId;
            const due = t.dueDate
              ? new Date(t.dueDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
              : "—";
            return (
              <tr
                key={t.id}
                className={cn(
                  "border-b border-border-subtle hover:bg-surface-elevated/50",
                  isSelected && "bg-accent/5",
                )}
              >
                <td className={cn(CELL_CLASS, "font-mono text-fg-tertiary")}>
                  NX-{t.number}
                </td>
                <td className={CELL_CLASS}>
                  <Link
                    href={getSelectHref(t.id)}
                    className="text-fg-primary hover:underline"
                  >
                    {t.title}
                  </Link>
                </td>
                <td className={CELL_CLASS}>
                  <span className="text-fg-secondary">{STATUS_LABEL[t.status]}</span>
                </td>
                <td className={CELL_CLASS}>
                  <PriorityPill priority={t.priority} />
                </td>
                <td className={CELL_CLASS}>
                  {(t.assignees ?? []).length === 0 ? (
                    <span className="text-fg-tertiary">—</span>
                  ) : (
                    <div className="flex -space-x-1.5">
                      {t.assignees.map(({ user }) => (
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
                  )}
                </td>
                <td className={cn(CELL_CLASS, "text-fg-secondary")}>{due}</td>
                <td className={CELL_CLASS}>
                  {(t.labels ?? []).length === 0 ? (
                    <span className="text-fg-tertiary">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {t.labels.map((l) => (
                        <span
                          key={l.labelId}
                          className="rounded-full px-2 py-0.5 text-[11px]"
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
