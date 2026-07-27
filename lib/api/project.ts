const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  throw new Error(body.error?.message ?? "알 수 없는 오류가 발생했습니다.");
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
  workspaceId: string,
): Promise<Project[]> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/projects`);
  return handleResponse<Project[]>(res);
}

// POST /workspaces/:workspaceId/projects
export async function createProjectApi(
  workspaceId: string,
  data: { name: string; description?: string },
): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/projects`, { method: "POST", json: true, body: JSON.stringify(data) });
  return handleResponse<Project>(res);
}

// GET /projects/:id
export async function getProjectApi(
  projectId: string,
): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}`);
  return handleResponse<Project>(res);
}

// PATCH /projects/:id
export async function updateProjectApi(
  projectId: string,
  data: { name?: string; description?: string },
): Promise<Project> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}`, { method: "PATCH", json: true, body: JSON.stringify(data) });
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
  projectId: string,
): Promise<ProjectMember[]> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members`);
  return handleResponse<ProjectMember[]>(res);
}

// POST /projects/:id/members — 워크스페이스 멤버를 프로젝트에 초대
export async function addProjectMemberApi(
  projectId: string,
  data: { userId: string; role?: ProjectRole },
): Promise<ProjectMember> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members`, { method: "POST", json: true, body: JSON.stringify(data) });
  return handleResponse<ProjectMember>(res);
}

// PATCH /projects/:id/members/:targetUserId — 역할 변경
export async function updateProjectMemberApi(
  projectId: string,
  targetUserId: string,
  role: ProjectRole,
): Promise<ProjectMember> {
  const res = await fetchWithAuth(
    `${API_URL}/projects/${projectId}/members/${targetUserId}`,
    { method: "PATCH", json: true, body: JSON.stringify({ role }) },
  );
  return handleResponse<ProjectMember>(res);
}

// DELETE /projects/:id/members/:targetUserId
export async function removeProjectMemberApi(
  projectId: string,
  targetUserId: string,
): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}/members/${targetUserId}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "멤버 제거 실패");
  }
}

// DELETE /projects/:id
export async function deleteProjectApi(
  projectId: string,
): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/projects/${projectId}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "삭제 실패");
  }
}
