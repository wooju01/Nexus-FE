import Link from "next/link";

import {
  EditIcon,
  MoreHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "@/components/icons";
import { MessageComposer } from "@/features/channel/message-composer";

import type { Task } from "@/types/domain";

import { PaneIconButton } from "./task-detail-atoms";
import { TaskConversation } from "./task-conversation";
import { TaskProperties } from "./task-properties";

type TaskDetailPaneProps = {
  task: Task;
  /** 닫기 시 돌아갈 URL — 보통 보드 루트. */
  closeHref: string;
};

/**
 * Task 상세 우측 패인 셸.
 * 헤더(툴바) + 제목 + 속성 그리드 + 탭 + 대화 + 컴포저 + 하단 액션.
 * 내부 구성요소는 `task-properties` / `task-conversation` / `task-detail-atoms`로 분리.
 */
export function TaskDetailPane({ task, closeHref }: TaskDetailPaneProps) {
  return (
    <aside
      aria-label={`Task ${task.id} 상세`}
      className="flex w-[26rem] shrink-0 flex-col border-l border-border-subtle bg-surface-base"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <span className="font-mono text-xs text-fg-tertiary">{task.id}</span>
        <div className="flex items-center gap-0.5">
          <PaneIconButton title="편집">
            <EditIcon className="size-4" />
          </PaneIconButton>
          <PaneIconButton title="더 보기">
            <MoreHorizontalIcon className="size-4" />
          </PaneIconButton>
          <Link
            href={closeHref}
            aria-label="상세 닫기"
            title="상세 닫기"
            className="flex size-7 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <XIcon className="size-4" />
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-5 pb-4 pt-4">
          <h2 className="text-lg font-semibold leading-snug text-fg-primary">
            {task.title}
          </h2>
        </section>

        <TaskProperties task={task} />
        <TaskConversation taskId={task.id} />
      </div>

      <MessageComposer placeholderTarget="this task" variant="thread" />

      <div className="flex items-center gap-2 border-t border-border-subtle px-5 py-3">
        <button
          type="button"
          className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-fg-secondary hover:text-fg-primary"
        >
          Mark in review
        </button>
        <button
          type="button"
          className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-fg-secondary hover:text-fg-primary"
        >
          Reassign
        </button>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent-subtle px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/30"
        >
          <SparklesIcon className="size-3.5" />
          Summarize thread
        </button>
      </div>
    </aside>
  );
}
