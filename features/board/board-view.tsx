"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { FilterIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
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

import { getSocket } from "@/lib/ws/socket";

import { BoardColumn } from "./board-column";
import { BoardFilterBar, type FilterOption } from "./board-filter-bar";
import { BoardSearch } from "./board-search";
import { calculateOrder, orderForInsert, sortedColumnTasks } from "./dnd-utils";
import { TableView } from "./table-view";
import { TaskCard } from "./task-card";
import { TaskDetailPane } from "./task-detail-pane";
import { TimelineView } from "./timeline-view";

type ViewKey = "board" | "table" | "timeline" | "calendar";

function parseView(v: string | null): ViewKey {
  if (v === "table" || v === "timeline" || v === "calendar") return v;
  return "board";
}

/** URL ?key= 의 콤마 구분 값 읽기. */
function readMulti(params: URLSearchParams, key: string): string[] {
  const v = params.get(key);
  return v ? v.split(",").filter(Boolean) : [];
}

/** 검색 매칭: 제목 부분 일치 또는 "3" / "NX-3" 같은 번호 매칭. */
function matchSearch(task: Task, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase().trim();
  if (task.title.toLowerCase().includes(lower)) return true;
  const numPart = lower.replace(/^nx-?/, "");
  if (numPart && /^\d+$/.test(numPart) && String(task.number) === numPart) return true;
  return false;
}

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
  { key: "Done",       label: "Done",        status: "DONE" },
];

export function BoardView({ project, selectedTaskId }: BoardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  /**
   * 생성 모달 상태. null = 닫힘, 아니면 초기 status 가 들어있음.
   * 헤더 New task → "BACKLOG", 컬럼 + → 해당 컬럼의 status.
   */
  const [createInitial, setCreateInitial] = useState<TaskStatus | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 현재 뷰 (board | table | timeline | calendar)
  const view: ViewKey = parseView(searchParams.get("view"));

  // URL ?q= / ?assignee= / ?label= / ?priority= 읽기
  const query = searchParams.get("q") ?? "";
  const selectedAssigneeIds = useMemo(
    () => readMulti(searchParams, "assignee"),
    [searchParams],
  );
  const selectedLabelIds = useMemo(
    () => readMulti(searchParams, "label"),
    [searchParams],
  );
  const selectedPriorities = useMemo(
    () => readMulti(searchParams, "priority") as Array<"P1" | "P2" | "P3">,
    [searchParams],
  );

  const hasActiveFilter =
    selectedAssigneeIds.length > 0 ||
    selectedLabelIds.length > 0 ||
    selectedPriorities.length > 0;

  /** URL 의 특정 키를 콤마 배열로 갱신. 다른 query 는 보존. */
  const setUrlList = useCallback(
    (key: string, ids: ReadonlyArray<string>) => {
      const next = new URLSearchParams(window.location.search);
      if (ids.length === 0) next.delete(key);
      else next.set(key, ids.join(","));
      const s = next.toString();
      router.replace(s ? `?${s}` : "?", { scroll: false });
    },
    [router],
  );

  const clearAllFilters = useCallback(() => {
    const next = new URLSearchParams(window.location.search);
    next.delete("assignee");
    next.delete("label");
    next.delete("priority");
    const s = next.toString();
    router.replace(s ? `?${s}` : "?", { scroll: false });
  }, [router]);

  // 현재 보드 tasks 에서 필터 옵션 추출 (담당자/라벨)
  const assigneeOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      for (const a of t.assignees ?? []) {
        if (!map.has(a.user.id)) map.set(a.user.id, a.user.name);
      }
    }
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label, "ko"),
    );
  }, [tasks]);

  const labelOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();
    for (const t of tasks) {
      for (const l of t.labels ?? []) {
        if (!map.has(l.labelId)) map.set(l.labelId, l.label.name);
      }
    }
    return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label, "ko"),
    );
  }, [tasks]);

  // 필터 + 검색 적용된 tasks
  const filteredTasks = useMemo(() => {
    const assigneeSet = new Set(selectedAssigneeIds);
    const labelSet = new Set(selectedLabelIds);
    const prioritySet = new Set(selectedPriorities);
    return tasks.filter((t) => {
      if (assigneeSet.size > 0) {
        const ids = (t.assignees ?? []).map((a) => a.user.id);
        if (!ids.some((id) => assigneeSet.has(id))) return false;
      }
      if (labelSet.size > 0) {
        const ids = (t.labels ?? []).map((l) => l.labelId);
        if (!ids.some((id) => labelSet.has(id))) return false;
      }
      if (prioritySet.size > 0 && !prioritySet.has(t.priority)) return false;
      if (!matchSearch(t, query)) return false;
      return true;
    });
  }, [tasks, selectedAssigneeIds, selectedLabelIds, selectedPriorities, query]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // 키보드 접근성: 스페이스로 잡기 → 화살표 이동 → 스페이스로 놓기
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setDraggingTask(task ?? null);
  }

  /**
   * 드롭 처리.
   * - over 가 컬럼이면 → 해당 컬럼 맨 뒤로 이동 (status 변경 + order 재계산)
   * - over 가 카드이면 → 그 카드와 같은 컬럼으로, 드래그 방향에 따라 앞/뒤 삽입
   * 낙관적 업데이트 + 실패 시 status/order 모두 롤백.
   */
  function handleDragEnd(event: DragEndEvent) {
    setDraggingTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overData = over.data.current as
      | { type?: "column" | "task"; columnKey?: string; task?: Task }
      | undefined;

    let destStatus: TaskStatus;
    let newOrder: number;

    if (overData?.type === "column") {
      // 빈 영역 / 컬럼 자체로 드롭 → 해당 컬럼 맨 뒤로
      const destCol = COLUMNS.find((c) => c.key === overData.columnKey);
      if (!destCol) return;
      destStatus = destCol.status;

      const colTasks = sortedColumnTasks(tasks, destStatus).filter(
        (t) => t.id !== activeId,
      );
      const lastOrder = colTasks[colTasks.length - 1]?.order ?? null;

      // 같은 컬럼인데 이미 맨 뒤면 no-op
      if (activeTask.status === destStatus && lastOrder === activeTask.order) return;

      newOrder = calculateOrder(lastOrder, null);
    } else if (overData?.type === "task" && overData.task) {
      // 다른 카드 위로 드롭 → 그 카드와 같은 컬럼으로
      const overTask = overData.task;
      if (overTask.id === activeId) return;
      destStatus = overTask.status;

      if (activeTask.status === destStatus) {
        // 같은 컬럼 내 정렬: 드래그 방향에 따라 앞/뒤 삽입
        const sameCol = sortedColumnTasks(tasks, destStatus);
        const activeIndex = sameCol.findIndex((t) => t.id === activeId);
        const overIndex = sameCol.findIndex((t) => t.id === overTask.id);
        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;
        const position = activeIndex < overIndex ? "after" : "before";
        newOrder = orderForInsert(sameCol, overTask.id, position, activeId);
      } else {
        // 컬럼 간 이동: 기본적으로 over 카드 앞에 삽입
        const destCol = sortedColumnTasks(tasks, destStatus);
        newOrder = orderForInsert(destCol, overTask.id, "before");
      }
    } else {
      return;
    }

    if (activeTask.status === destStatus && activeTask.order === newOrder) return;

    // 낙관적 업데이트 (status + order 동시 반영)
    const prevStatus = activeTask.status;
    const prevOrder = activeTask.order;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: destStatus, order: newOrder } : t,
      ),
    );

    const token = getAccessToken();
    if (!token) return;

    const payload: { status?: TaskStatus; order?: number } = { order: newOrder };
    if (destStatus !== prevStatus) payload.status = destStatus;

    updateTaskApi(token, activeId, payload).catch(() => {
      // 실패 시 status + order 둘 다 롤백
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: prevStatus, order: prevOrder } : t,
        ),
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

  // 실시간 동기화: 같은 프로젝트 보드를 보는 다른 사용자의 변경을 즉시 반영.
  // 자기 자신의 변경은 PATCH 응답 또는 낙관적 업데이트로 이미 적용되어 있고,
  // BE echo 가 동일 id 로 와도 dedup/덮어쓰기로 안전.
  useEffect(() => {
    if (!project) return;
    const token = getAccessToken();
    if (!token) return;
    const socket = getSocket(token);

    socket.emit("project.join", project.id);

    function onCreated({ task }: { task: Task }) {
      setTasks((prev) =>
        prev.some((t) => t.id === task.id) ? prev : [...prev, task],
      );
    }
    function onUpdated({ task }: { task: Task }) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setSelectedTask((curr) => (curr?.id === task.id ? task : curr));
    }
    function onDeleted({ taskId }: { taskId: string }) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask((curr) => (curr?.id === taskId ? null : curr));
    }

    socket.on("task.created", onCreated);
    socket.on("task.updated", onUpdated);
    socket.on("task.deleted", onDeleted);

    return () => {
      socket.emit("project.leave", project.id);
      socket.off("task.created", onCreated);
      socket.off("task.updated", onUpdated);
      socket.off("task.deleted", onDeleted);
    };
  }, [project]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
        프로젝트를 불러오는 중...
      </div>
    );
  }

  function handleTaskCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
    setCreateInitial(null);
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
            <BoardSearch initialValue={query} />
            <button
              type="button"
              onClick={() => setIsFilterOpen((v) => !v)}
              aria-expanded={isFilterOpen}
              aria-pressed={isFilterOpen || hasActiveFilter}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-fg-secondary hover:text-fg-primary",
                (isFilterOpen || hasActiveFilter) && "border-accent/40 text-fg-primary",
              )}
            >
              <FilterIcon className="size-3.5" />
              Filter
              {hasActiveFilter ? (
                <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 text-[10px] font-semibold text-accent">
                  {selectedAssigneeIds.length + selectedLabelIds.length + selectedPriorities.length}
                </span>
              ) : null}
            </button>
            <ViewTabs active={view} boardPath={boardPath} searchParams={searchParams} />
            <button
              type="button"
              onClick={() => setCreateInitial("BACKLOG")}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover"
            >
              <PlusIcon className="size-3.5" />
              New task
            </button>
          </div>
        </header>

        {isFilterOpen ? (
          <BoardFilterBar
            assigneeOptions={assigneeOptions}
            labelOptions={labelOptions}
            selectedAssigneeIds={selectedAssigneeIds}
            selectedLabelIds={selectedLabelIds}
            selectedPriorities={selectedPriorities}
            onAssigneesChange={(ids) => setUrlList("assignee", ids)}
            onLabelsChange={(ids) => setUrlList("label", ids)}
            onPrioritiesChange={(ps) => setUrlList("priority", ps)}
            onClearAll={clearAllFilters}
          />
        ) : null}

        {view === "board" ? (
          <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
            {COLUMNS.map((col) => (
              <BoardColumn
                key={col.key}
                columnKey={col.key as import("@/types/domain").BoardColumnKey}
                label={col.label}
                tasks={sortedColumnTasks(filteredTasks, col.status)}
                wipLimit={col.wipLimit}
                getSelectHref={(taskId) => buildHref(boardPath, searchParams, taskId)}
                selectedTaskId={selectedTaskId}
                onAdd={() => setCreateInitial(col.status)}
              />
            ))}
          </div>
        ) : view === "table" ? (
          <TableView
            tasks={filteredTasks}
            getSelectHref={(taskId) => buildHref(boardPath, searchParams, taskId)}
            selectedTaskId={selectedTaskId}
          />
        ) : view === "timeline" ? (
          <TimelineView
            tasks={filteredTasks}
            getSelectHref={(taskId) => buildHref(boardPath, searchParams, taskId)}
            selectedTaskId={selectedTaskId}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-fg-tertiary">
            Calendar 뷰는 준비 중입니다.
          </div>
        )}
      </section>

      {selectedTask ? (
        <TaskDetailPane
          task={selectedTask}
          closeHref={boardPath}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      ) : null}

      {createInitial ? (
        <CreateTaskModal
          projectId={project.id}
          initialStatus={createInitial}
          onCreated={handleTaskCreated}
          onClose={() => setCreateInitial(null)}
        />
      ) : null}
    </div>

    <DragOverlay>
      {draggingTask ? <TaskCard task={draggingTask} isDragOverlay /> : null}
    </DragOverlay>
  </DndContext>
  );
}

/** 다른 query 는 보존하면서 ?view 와 선택적으로 ?task 만 설정한 URL 빌더. */
function buildHref(
  boardPath: string,
  current: URLSearchParams,
  taskId?: string,
  view?: ViewKey,
): string {
  const next = new URLSearchParams(current);
  if (taskId !== undefined) next.set("task", taskId);
  if (view !== undefined) {
    if (view === "board") next.delete("view");
    else next.set("view", view);
  }
  const s = next.toString();
  return s ? `${boardPath}?${s}` : boardPath;
}

const VIEW_TABS: ReadonlyArray<{ key: ViewKey; label: string }> = [
  { key: "board", label: "Board" },
  { key: "table", label: "Table" },
  { key: "timeline", label: "Timeline" },
  { key: "calendar", label: "Calendar" },
];

function ViewTabs({
  active,
  boardPath,
  searchParams,
}: {
  active: ViewKey;
  boardPath: string;
  searchParams: URLSearchParams;
}) {
  return (
    <div
      role="tablist"
      aria-label="보드 뷰 모드"
      className="inline-flex items-center rounded-md border border-border-subtle bg-surface-elevated p-0.5"
    >
      {VIEW_TABS.map((t) => (
        <Link
          key={t.key}
          href={buildHref(boardPath, searchParams, undefined, t.key)}
          role="tab"
          aria-selected={t.key === active}
          className={
            t.key === active
              ? "rounded px-2.5 py-1 text-xs font-semibold text-fg-primary bg-surface-overlay"
              : "rounded px-2.5 py-1 text-xs text-fg-secondary hover:text-fg-primary"
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

type CreateTaskModalProps = {
  projectId: string;
  /** 초기 선택될 상태. 컬럼 + 버튼에서 열 때 해당 컬럼의 status 가 들어옴. */
  initialStatus?: TaskStatus;
  onCreated: (task: Task) => void;
  onClose: () => void;
};

function CreateTaskModal({
  projectId,
  initialStatus,
  onCreated,
  onClose,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P2");
  const [status, setStatus] = useState<TaskStatus>(initialStatus ?? "BACKLOG");
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
