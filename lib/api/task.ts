const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
  createdAt: string;
  updatedAt: string;
  creator: TaskUser;
  assignees: Array<{ userId: string; user: TaskUser }>;
  labels: Array<{ labelId: string; label: { id: string; name: string; color: string } }>;
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
  dueDate?: string;
  columnId?: string;
  order?: number;
  assigneeIds?: string[];
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export async function getTasksApi(accessToken: string, projectId: string): Promise<Task[]> {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Task[]>(res);
}

export async function createTaskApi(
  accessToken: string,
  projectId: string,
  data: CreateTaskPayload,
): Promise<Task> {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function getTaskApi(accessToken: string, taskId: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Task>(res);
}

export async function updateTaskApi(
  accessToken: string,
  taskId: string,
  data: UpdateTaskPayload,
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function deleteTaskApi(accessToken: string, taskId: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "삭제 실패");
  }
}
