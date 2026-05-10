const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json();
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
  linkedChannelId?: string;
};

// GET /workspaces/:workspaceId/projects
export async function getProjectsApi(
  accessToken: string,
  workspaceId: string,
): Promise<Project[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/projects`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Project[]>(res);
}

// POST /workspaces/:workspaceId/projects
export async function createProjectApi(
  accessToken: string,
  workspaceId: string,
  data: { name: string; description?: string },
): Promise<Project> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(res);
}

// GET /projects/:id
export async function getProjectApi(
  accessToken: string,
  projectId: string,
): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<Project>(res);
}

// PATCH /projects/:id
export async function updateProjectApi(
  accessToken: string,
  projectId: string,
  data: { name?: string; description?: string },
): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(res);
}

// DELETE /projects/:id
export async function deleteProjectApi(
  accessToken: string,
  projectId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "삭제 실패");
  }
}
