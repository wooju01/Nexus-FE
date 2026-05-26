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

export type ProjectRole = "MANAGER" | "MEMBER";

export type ProjectMember = {
  id: string;
  role: ProjectRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

// GET /projects/:id/members
export async function getProjectMembersApi(
  accessToken: string,
  projectId: string,
): Promise<ProjectMember[]> {
  const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<ProjectMember[]>(res);
}

// POST /projects/:id/members — 워크스페이스 멤버를 프로젝트에 초대
export async function addProjectMemberApi(
  accessToken: string,
  projectId: string,
  data: { userId: string; role?: ProjectRole },
): Promise<ProjectMember> {
  const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ProjectMember>(res);
}

// DELETE /projects/:id/members/:targetUserId
export async function removeProjectMemberApi(
  accessToken: string,
  projectId: string,
  targetUserId: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/projects/${projectId}/members/${targetUserId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "멤버 제거 실패");
  }
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
