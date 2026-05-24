"use client";

import Link from "next/link";
import { useState } from "react";

import { MoreHorizontalIcon, TrashIcon, XIcon } from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  deleteTaskApi,
  updateTaskApi,
  type Task,
  type UpdateTaskPayload,
} from "@/lib/api/task";

import { TiptapEditor } from "@/components/editor/tiptap-editor";

import { EditableTitle } from "./editable-title";
import { PaneIconButton } from "./task-detail-atoms";
import { TaskConversation } from "./task-conversation";
import { TaskProperties } from "./task-properties";

type TaskDetailPaneProps = {
  task: Task;
  closeHref: string;                   // 닫기 버튼 → 보드로 돌아가는 URL
  onTaskUpdated: (task: Task) => void; // 수정 후 보드 카드도 즉시 갱신
  onTaskDeleted: (taskId: string) => void;
};

export function TaskDetailPane({ task, closeHref, onTaskUpdated, onTaskDeleted }: TaskDetailPaneProps) {
  const [localTask, setLocalTask] = useState<Task>(task);
  const [deleting, setDeleting] = useState(false);

  // 임의 필드 변경 → PATCH 요청 후 로컬 상태 + 보드 동기화
  async function handleUpdate(patch: UpdateTaskPayload) {
    const token = getAccessToken();
    if (!token) return;
    try {
      const updated = await updateTaskApi(token, localTask.id, patch);
      setLocalTask(updated);
      onTaskUpdated(updated);
    } catch {
      // 실패 시 이전 상태 유지 (낙관적 업데이트 없이 단순 처리)
    }
  }

  async function handleDelete() {
    if (!confirm(`NX-${localTask.number} 태스크를 삭제할까요?`)) return;
    const token = getAccessToken();
    if (!token) return;
    setDeleting(true);
    try {
      await deleteTaskApi(token, localTask.id);
      onTaskDeleted(localTask.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <aside
      aria-label={`NX-${localTask.number} 상세`}
      className="flex w-104 shrink-0 flex-col border-l border-border-subtle bg-surface-base"
    >
      {/* 헤더: 태스크 번호 + 도구 버튼들 */}
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <span className="font-mono text-xs text-fg-tertiary">NX-{localTask.number}</span>
        <div className="flex items-center gap-0.5">
          <PaneIconButton title="삭제" onClick={handleDelete} disabled={deleting}>
            <TrashIcon className="size-4 text-red-400" />
          </PaneIconButton>
          <PaneIconButton title="더 보기">
            <MoreHorizontalIcon className="size-4" />
          </PaneIconButton>
          {/* 닫기 → boardPath로 이동 (?task 쿼리 제거) */}
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
        {/* 제목 — 인라인 편집 */}
        <section className="px-5 pb-4 pt-4">
          <EditableTitle
            value={localTask.title}
            onSave={(next) => handleUpdate({ title: next })}
          />
          <p className="mt-1 px-2 text-xs text-fg-tertiary">
            {localTask.creator.name} 생성 ·{" "}
            {new Date(localTask.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </section>

        {/* 속성 그리드 (Status / Priority / Assignees / Due) */}
        <TaskProperties task={localTask} onUpdate={handleUpdate} />

        {/* 설명 — Tiptap 인라인 편집 (blur 시 저장) */}
        <section className="px-5 py-4">
          <TiptapEditor
            // task.id 가 바뀌면 에디터를 새로 마운트해 새 task 의 description 으로 초기화
            key={localTask.id}
            value={(localTask.description ?? null) as never}
            placeholder="설명을 작성해 주세요…"
            onBlur={(json) => handleUpdate({ description: json })}
          />
        </section>

        {/* 코멘트 (탭 바 + 작성 입력) */}
        <TaskConversation taskId={localTask.id} />
      </div>
    </aside>
  );
}
