const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
  role?: WorkspaceRole;
};


// GET 내가 속한 워크스페이스 목록
export async function getWorkspacesApi(accessToken: string): Promise<Workspace[]> {
  const res = await fetchWithAuth(`${API_URL}/workspaces`);
  return handleResponse<Workspace[]>(res);
}

export type UnreadSummaryItem = {
  channelId: string;
  channelType: string;
  unreadCount: number;
};

export async function getUnreadSummaryApi(
  accessToken: string,
  workspaceId: string,
): Promise<UnreadSummaryItem[]> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/unread-summary`);
  return handleResponse<UnreadSummaryItem[]>(res);
}

// POST 워크스페이스 생성
export async function createWorkspaceApi(
  accessToken: string,
  name: string,
  description?: string,
): Promise<Workspace> {
  const res = await fetchWithAuth(`${API_URL}/workspaces`, { method: "POST", json: true, body: JSON.stringify({ name, description }) });
  return handleResponse<Workspace>(res);
}