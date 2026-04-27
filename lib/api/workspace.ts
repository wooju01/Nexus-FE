import { getAccessToken } from "@/lib/auth/tokens";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiError = {
  message: string;
  statusCode: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err: ApiError = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
};


// GET 내가 속한 워크스페이스 목록
export async function getWorkspacesApi(accessToken: string): Promise<Workspace[]> {
  const res = await fetch(`${API_URL}/workspaces`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Workspace[]>(res);
}

// POST 워크스페이스 생성
export async function createWorkspaceApi(
  accessToken: string,
  name: string,
  description?: string,
): Promise<Workspace> {
  const res = await fetch(`${API_URL}/workspaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name, description }),
  });
  return handleResponse<Workspace>(res);
}