const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type DmChannel = {
  id: string;
  workspaceId: string;
  type: "DM";
  members: {
    user: {
      id: string;
      name: string;
      avatar: string | null;
      status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
    };
  }[];
};

// GET /workspaces/:workspaceId/dms
export async function getDmsApi(
  accessToken: string,
  workspaceId: string,
): Promise<DmChannel[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/dms`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<DmChannel[]>(res);
}

// POST /workspaces/:workspaceId/dms
export async function createDmApi(
  accessToken: string,
  workspaceId: string,
  targetUserId: string,
): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/dms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ targetUserId }),
  });
  return handleResponse<{ id: string }>(res);
}
