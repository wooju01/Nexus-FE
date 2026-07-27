const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type WorkspaceMember = {
  userId: string;
  user: {
    id: string;
    name: string;
    jobTitle: string | null;
    avatar: string | null;
    status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
  };
};

// GET /workspaces/:workspaceId/members
export async function getMembersApi(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/members`);
  return handleResponse<WorkspaceMember[]>(res);
}
