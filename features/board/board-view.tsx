"use client";

import { FilterIcon, PlusIcon } from "@/components/icons";
import type { Project } from "@/lib/api/project";
import type { BoardColumn as BoardColumnType } from "@/types/domain";

import { BoardColumn } from "./board-column";

type BoardViewProps = {
  project: Project | null;
  selectedTaskId?: string;
};

const COLUMNS: ReadonlyArray<BoardColumnType> = [
  { key: "Backlog", label: "Backlog" },
  { key: "To do", label: "To do", wipLimit: 8 },
  { key: "In progress", label: "In progress", wipLimit: 4 },
  { key: "In review", label: "In review" },
];

export function BoardView({ project, selectedTaskId: _selectedTaskId }: BoardViewProps) {
  const boardPath = project ? `/projects/${project.id}` : "";

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        프로젝트를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col">
        {/* 프로젝트 헤더 */}
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-fg-primary">
              {project.name}
            </h1>
            <span aria-hidden="true" className="text-sm text-fg-tertiary">
              /
            </span>
            <span className="text-sm text-fg-secondary">Board</span>
          </div>

          <div className="flex items-center gap-3">
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

        {/* 컬럼들 — 가로 스크롤 (태스크는 다음 단계에서 연결) */}
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.key}
              columnKey={col.key}
              label={col.label}
              tasks={[]}
              wipLimit={col.wipLimit}
              getSelectHref={(taskId) => `${boardPath}?task=${taskId}`}
              selectedTaskId={undefined}
            />
          ))}
        </div>
      </section>
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
