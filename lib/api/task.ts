const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json().catch(() => ({}));
  throw new Error((err as { message?: string }).message ?? "알 수 없는 오류가 발생했습니다.");
}

export type TaskPriority = "P1" | "P2" | "P3";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskUser = {
  id: string;
  name: string;
  avatar: string | null;
};

export type Task = {
  id: string;
  number: number;
  projectId: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  columnId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  creator: TaskUser;
  assignees: Array<{ userId: string; user: TaskUser }>;
  labels: Array<{ labelId: string; label: { id: string; name: string; color: string } }>;
  description?: string | null;
  _count?: { comments: number; subTasks: number };
};

export type CreateTaskPayload = {
  title: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  columnId?: string;
  assigneeIds?: string[];
};

export type UpdateTaskPayload = {
  title?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  /** ISO 문자열로 설정, null 이면 마감일 제거. */
  dueDate?: string | null;
  columnId?: string;
  order?: number;
  assigneeIds?: string[];
  /** 빈 배열이면 모든 라벨 제거. */
  labelIds?: string[];
  /** Tiptap JSON 직접 저장. */
  description?: unknown;
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export async function getTasksApi(accessToken: string, projectId: string): Promise<Task[]> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/tasks`);
  return handleResponse<Task[]>(res);
}

export async function createTaskApi(
  accessToken: string,
  projectId: string,
  data: CreateTaskPayload,
): Promise<Task> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/tasks`, { method: "POST", json: true, body: JSON.stringify(data) });
  return handleResponse<Task>(res);
}

export async function getTaskApi(accessToken: string, taskId: string): Promise<Task> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}`);
  return handleResponse<Task>(res);
}

export async function updateTaskApi(
  accessToken: string,
  taskId: string,
  data: UpdateTaskPayload,
): Promise<Task> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}`, { method: "PATCH", json: true, body: JSON.stringify(data) });
  return handleResponse<Task>(res);
}

export async function deleteTaskApi(accessToken: string, taskId: string): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "삭제 실패");
  }
}
