import { FilterIcon, PlusIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getTask } from "@/lib/mocks/tasks";
import { getUser } from "@/lib/mocks/users";
import type {
  BoardColumn as BoardColumnType,
  Project,
  Task,
  TaskId,
} from "@/types/domain";

import { BoardColumn } from "./board-column";
import { TaskDetailPane } from "./task-detail-pane";

type BoardViewProps = {
  project: Project;
  tasks: ReadonlyArray<Task>;
  /** 현재 선택된 task id — 있으면 우측 상세 페인 렌더. */
  selectedTaskId?: TaskId;
};

const COLUMNS: ReadonlyArray<BoardColumnType> = [
  { key: "Backlog", label: "Backlog" },
  { key: "To do", label: "To do", wipLimit: 8 },
  { key: "In progress", label: "In progress", wipLimit: 4 },
  { key: "In review", label: "In review" },
];

/**
 * 프로젝트 보드 전체 뷰.
 * 헤더 + 컬럼 리스트 (+ 선택된 태스크의 상세 페인).
 */
export function BoardView({ project, tasks, selectedTaskId }: BoardViewProps) {
  const members = project.memberIds
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const boardPath = `/projects/${project.slug}`;
  const getSelectHref = (taskId: TaskId) => `${boardPath}?task=${taskId}`;

  const selectedTask = selectedTaskId ? getTask(selectedTaskId) : undefined;
  // 선택된 태스크가 이 프로젝트 것이 아니면 무시.
  const safeSelectedTask =
    selectedTask && selectedTask.projectId === project.id
      ? selectedTask
      : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col">
        {/* 프로젝트 헤더 */}
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-fg-primary">
              {project.name}
            </h1>
            <span
              aria-hidden="true"
              className="text-sm text-fg-tertiary"
            >
              /
            </span>
            <span className="text-sm text-fg-secondary">Board</span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-300">
              {project.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {members.slice(0, 5).map((u) => (
                <Avatar
                  key={u.id}
                  initials={u.initials}
                  color={u.avatarColor}
                  size="sm"
                  presence={u.presence}
                  name={u.name}
                  className="ring-2 ring-surface-base"
                />
              ))}
              {members.length > 5 ? (
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-overlay text-[10px] font-semibold text-fg-secondary ring-2 ring-surface-base">
                  +{members.length - 5}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-fg-secondary hover:text-fg-primary"
            >
              <FilterIcon className="size-3.5" />
              Filter
            </button>
            <ViewTabs active="Board" />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
            >
              <PlusIcon className="size-3.5" />
              New task
            </button>
          </div>
        </header>

        {/* 컬럼들 — 가로 스크롤 */}
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);
            return (
              <BoardColumn
                key={col.key}
                columnKey={col.key}
                label={col.label}
                tasks={columnTasks}
                wipLimit={col.wipLimit}
                getSelectHref={getSelectHref}
                selectedTaskId={safeSelectedTask?.id}
              />
            );
          })}
        </div>
      </section>

      {safeSelectedTask ? (
        <TaskDetailPane task={safeSelectedTask} closeHref={boardPath} />
      ) : null}
    </div>
  );
}

function ViewTabs({ active }: { active: "Board" | "Table" | "Timeline" | "Calendar" }) {
  const tabs = ["Board", "Table", "Timeline", "Calendar"] as const;
  return (
    <div
      role="tablist"
      aria-label="보드 뷰 모드"
      className="inline-flex items-center rounded-md border border-border-subtle bg-surface-elevated p-0.5"
    >
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={t === active}
          title={t === active ? t : `${t} — 준비 중`}
          className={
            t === active
              ? "rounded px-2.5 py-1 text-xs font-semibold text-fg-primary bg-surface-overlay"
              : "rounded px-2.5 py-1 text-xs text-fg-secondary hover:text-fg-primary"
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}
