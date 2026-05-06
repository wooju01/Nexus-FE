const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type WorkspaceMember = {
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
  };
};

// GET /workspaces/:workspaceId/members
export async function getMembersApi(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/members`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<WorkspaceMember[]>(res);
}
