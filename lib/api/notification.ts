const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
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
  accessToken: string,
  unread?: boolean,
): Promise<{ items: Notification[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (unread !== undefined) params.set("unread", String(unread));
  const res = await fetch(`${API_URL}/notifications?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

// GET /notifications/count
export async function countUnreadApi(
  accessToken: string,
): Promise<{ count: number }> {
  const res = await fetch(`${API_URL}/notifications/count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse(res);
}

// PATCH /notifications/:id/read
export async function markAsReadApi(
  accessToken: string,
  notificationId: string,
): Promise<void> {
  await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// PATCH /notifications/read-all
export async function markAllAsReadApi(accessToken: string): Promise<void> {
  await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
