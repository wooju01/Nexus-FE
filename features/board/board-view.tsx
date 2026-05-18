"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { FilterIcon, PlusIcon } from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import type { Project } from "@/lib/api/project";
import {
  createTaskApi,
  getTaskApi,
  getTasksApi,
  updateTaskApi,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/api/task";

import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";
import { TaskDetailPane } from "./task-detail-pane";

type BoardViewProps = {
  project: Project | null;
  selectedTaskId?: string;
};

type ColumnDef = {
  key: string;
  label: string;
  status: TaskStatus;
  wipLimit?: number;
};

const COLUMNS: ColumnDef[] = [
  { key: "Backlog",     label: "Backlog",     status: "BACKLOG" },
  { key: "To do",      label: "To do",       status: "TODO",        wipLimit: 8 },
  { key: "In progress",label: "In progress", status: "IN_PROGRESS", wipLimit: 4 },
  { key: "In review",  label: "In review",   status: "IN_REVIEW" },
];

export function BoardView({ project, selectedTaskId }: BoardViewProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setDraggingTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const destColumnKey = over.id as string;
    const destCol = COLUMNS.find((c) => c.key === destColumnKey);
    if (!destCol) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === destCol.status) return;

    const prevStatus = task.status;
    // 낙관적 업데이트
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: destCol.status } : t)),
    );

    const token = getAccessToken();
    if (!token) return;
    updateTaskApi(token, taskId, { status: destCol.status }).catch(() => {
      // 실패 시 롤백
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: prevStatus } : t)),
      );
    });
  }

  const boardPath = project ? `/projects/${project.id}` : "";

  // selectedTaskId가 바뀌면 상세 태스크를 API로 가져옴
  useEffect(() => {
    if (!selectedTaskId) {
      setSelectedTask(null);
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    let cancelled = false;
    getTaskApi(token, selectedTaskId)
      .then((t) => { if (!cancelled) setSelectedTask(t); })
      .catch(() => { if (!cancelled) setSelectedTask(null); });
    return () => { cancelled = true; };
  }, [selectedTaskId]);

  // 상세 패널에서 status/priority 변경 → tasks 배열도 동기화
  function handleTaskUpdated(updated: Task) {
    setSelectedTask(updated);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  // 상세 패널에서 삭제 → tasks 배열에서 제거 후 보드로 이동
  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
    if (boardPath) router.push(boardPath);
  }

  const fetchTasks = useCallback(async () => {
    if (!project) return;
    const token = getAccessToken();
    if (!token) return;
    try {
      const data = await getTasksApi(token, project.id);
      setTasks(data);
    } catch {
      // 오류 시 빈 목록 유지
    }
  }, [project]);

  useEffect(() => {
    setTasks([]);
    void fetchTasks();
  }, [fetchTasks]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        프로젝트를 불러오는 중...
      </div>
    );
  }

  function handleTaskCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
    setShowCreate(false);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="flex h-full min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-fg-primary">{project.name}</h1>
            <span aria-hidden="true" className="text-sm text-fg-tertiary">/</span>
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
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
            >
              <PlusIcon className="size-3.5" />
              New task
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.key}
              columnKey={col.key as import("@/types/domain").BoardColumnKey}
              label={col.label}
              tasks={tasks.filter((t) => t.status === col.status)}
              wipLimit={col.wipLimit}
              getSelectHref={(taskId) => `${boardPath}?task=${taskId}`}
              selectedTaskId={selectedTaskId}
            />
          ))}
        </div>
      </section>

      {selectedTask ? (
        <TaskDetailPane
          task={selectedTask}
          closeHref={boardPath}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      ) : null}

      {showCreate ? (
        <CreateTaskModal
          projectId={project.id}
          onCreated={handleTaskCreated}
          onClose={() => setShowCreate(false)}
        />
      ) : null}
    </div>

    <DragOverlay>
      {draggingTask ? <TaskCard task={draggingTask} isDragOverlay /> : null}
    </DragOverlay>
  </DndContext>
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

type CreateTaskModalProps = {
  projectId: string;
  onCreated: (task: Task) => void;
  onClose: () => void;
};

function CreateTaskModal({ projectId, onCreated, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P2");
  const [status, setStatus] = useState<TaskStatus>("BACKLOG");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const token = getAccessToken();
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const task = await createTaskApi(token, projectId, { title: title.trim(), priority, status });
      onCreated(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-base p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-fg-primary">새 태스크</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="태스크 제목"
            className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-fg-secondary">우선순위</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="P1">P1 — 긴급</option>
                <option value="P2">P2 — 보통</option>
                <option value="P3">P3 — 낮음</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-xs text-fg-secondary">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="IN_REVIEW">In review</option>
              </select>
            </div>
          </div>

          {error ? <p className="text-xs text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-fg-secondary hover:text-fg-primary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
