import { Avatar } from "@/components/ui/avatar";
import { PriorityPill } from "@/components/ui/priority-pill";
import { LabelPill } from "@/components/ui/label-pill";
import { CheckCircleIcon } from "@/components/icons";

/**
 * 쇼케이스 — 칸반 보드 & 태스크 관리 CSS 목업.
 */
export function ShowcaseBoard() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-elevated shadow-xl overflow-hidden">
      {/* 프로젝트 상단 바 */}
      <div className="flex items-center gap-4 border-b border-border-subtle px-4 py-3">
        <span className="text-sm font-medium text-fg-primary">
          Launch Q2
        </span>
        <div className="flex gap-1 text-xs">
          <span className="rounded-md bg-accent-subtle px-2 py-0.5 font-medium text-accent">
            Board
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary hover:text-fg-secondary transition-colors">
            Table
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary hover:text-fg-secondary transition-colors">
            Timeline
          </span>
          <span className="rounded-md px-2 py-0.5 text-fg-tertiary hover:text-fg-secondary transition-colors">
            Calendar
          </span>
        </div>
      </div>

      {/* 칸반 컬럼 */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {/* Todo */}
        <KanbanColumn status="Todo" color="bg-status-todo" count={2}>
          <TaskCard
            title="랜딩 페이지 리디자인"
            priority="P1"
            avatar={{ initials: "HJ", color: "blue" }}
          />
          <TaskCard
            title="API 문서 업데이트"
            priority="P3"
            label={{ text: "docs", color: "green" }}
          />
        </KanbanColumn>

        {/* In Progress */}
        <KanbanColumn
          status="In Progress"
          color="bg-status-in-progress"
          count={1}
          wip="1/3"
        >
          <TaskCard
            title="결제 시스템 연동"
            priority="P2"
            avatar={{ initials: "EP", color: "purple" }}
          />
        </KanbanColumn>

        {/* Done */}
        <KanbanColumn status="Done" color="bg-status-done" count={1}>
          <div className="rounded-lg border border-border-subtle bg-surface-overlay p-3 opacity-60">
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon
                width={14}
                height={14}
                className="text-status-done"
              />
              <span className="text-xs text-fg-secondary line-through">
                인증 플로우 구현
              </span>
            </div>
          </div>
        </KanbanColumn>
      </div>
    </div>
  );
}

type KanbanColumnProps = {
  status: string;
  color: string;
  count: number;
  wip?: string;
  children: React.ReactNode;
};

function KanbanColumn({
  status,
  color,
  count,
  wip,
  children,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`size-2 rounded-full ${color}`} />
        <span className="text-xs font-medium text-fg-secondary">{status}</span>
        <span className="text-xs text-fg-tertiary">{count}</span>
        {wip ? (
          <span className="ml-auto text-[10px] text-fg-tertiary">{wip}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

type TaskCardProps = {
  title: string;
  priority: "P1" | "P2" | "P3";
  avatar?: { initials: string; color: "blue" | "purple" | "green" | "pink" | "orange" | "yellow" | "teal" };
  label?: { text: string; color: "purple" | "blue" | "green" | "red" | "yellow" };
};

function TaskCard({ title, priority, avatar, label }: TaskCardProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-overlay p-3 transition-colors hover:border-border-default">
      <p className="mb-2 text-xs font-medium text-fg-primary">{title}</p>
      <div className="flex items-center gap-1.5">
        <PriorityPill priority={priority} />
        {label ? <LabelPill label={label.text} color={label.color} /> : null}
        {avatar ? (
          <span className="ml-auto">
            <Avatar
              initials={avatar.initials}
              color={avatar.color}
              size="xs"
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}
