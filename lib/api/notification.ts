const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type NotificationType =
  | "MESSAGE_MENTION"
  | "DM_RECEIVED"
  | "CHANNEL_INVITED"
  | "WORKSPACE_INVITED"
  | "TASK_ASSIGNED"
  | "TASK_DUE_SOON"
  | "TASK_COMMENTED"
  | "EVENT_UPCOMING"
  | "EVENT_INVITED";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkUrl: string | null;
  metadata: unknown;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

// GET /notifications
export async function getNotificationsApi(
  unread?: boolean,
): Promise<{ items: Notification[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (unread !== undefined) params.set("unread", String(unread));
  const res = await fetchWithAuth(`${API_URL}/notifications?${params}`);
  return handleResponse(res);
}

// GET /notifications/count
export async function countUnreadApi(): Promise<{ count: number }> {
  const res = await fetchWithAuth(`${API_URL}/notifications/count`);
  return handleResponse(res);
}

// PATCH /notifications/:id/read
export async function markAsReadApi(
  notificationId: string,
): Promise<void> {
  await fetchWithAuth(`${API_URL}/notifications/${notificationId}/read`, { method: "PATCH" });
}

// PATCH /notifications/read-all
export async function markAllAsReadApi(): Promise<void> {
  await fetchWithAuth(`${API_URL}/notifications/read-all`, { method: "PATCH" });
}
