/**
 * 태스크 코멘트 API 클라이언트.
 *
 * BE 라우트 (TaskCommentController):
 *   - GET    /tasks/:taskId/comments
 *   - POST   /tasks/:taskId/comments
 *   - PATCH  /comments/:id
 *   - DELETE /comments/:id
 *
 * content 는 Tiptap JSON 또는 문자열. BE 는 형식 검증을 하지 않으므로
 * FE 에서 일관되게 직렬화한다.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }
  const err = await res.json().catch(() => ({}));
  throw new Error(
    (err as { message?: string }).message ?? "알 수 없는 오류가 발생했습니다.",
  );
}

export type TaskCommentAuthor = {
  id: string;
  name: string;
  avatar: string | null;
};

export type TaskComment = {
  id: string;
  taskId: string;
  authorId: string;
  /** Tiptap JSON 또는 단순 객체. */
  content: unknown;
  createdAt: string;
  updatedAt: string;
  author: TaskCommentAuthor;
};

/** GET /tasks/:taskId/comments */
export async function getCommentsApi(
  accessToken: string,
  taskId: string,
): Promise<TaskComment[]> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/comments`);
  return handleResponse<TaskComment[]>(res);
}

/** POST /tasks/:taskId/comments */
export async function createCommentApi(
  accessToken: string,
  taskId: string,
  content: unknown,
): Promise<TaskComment> {
  const res = await fetchWithAuth(`${API_URL}/tasks/${taskId}/comments`, { method: "POST", json: true, body: JSON.stringify({ content }) });
  return handleResponse<TaskComment>(res);
}

/** PATCH /comments/:id */
export async function updateCommentApi(
  accessToken: string,
  commentId: string,
  content: unknown,
): Promise<TaskComment> {
  const res = await fetchWithAuth(`${API_URL}/comments/${commentId}`, { method: "PATCH", json: true, body: JSON.stringify({ content }) });
  return handleResponse<TaskComment>(res);
}

/** DELETE /comments/:id */
export async function deleteCommentApi(
  accessToken: string,
  commentId: string,
): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/comments/${commentId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? "삭제 실패",
    );
  }
}
