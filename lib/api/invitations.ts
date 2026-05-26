/**
 * 초대 API 클라이언트.
 *
 * 팀 컨벤션 (lib/api/auth.ts, workspace.ts) 그대로 따른다:
 *   - process.env.NEXT_PUBLIC_API_URL 베이스 사용
 *   - 토큰은 호출 시점에 인자로 전달 (자동 주입 X)
 *   - 응답 비-OK 시 BE 에러 메시지 그대로 throw
 *
 * 매핑되는 BE 라우트:
 *   create        → POST   /workspaces/:id/invitations
 *   listPending   → GET    /workspaces/:id/invitations
 *   getByToken    → GET    /invitations/:token         (Public)
 *   accept        → POST   /invitations/:token/accept
 *   cancel        → DELETE /invitations/:token
 */

import type { Invitation, WorkspaceRole } from "@/types/invitation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

// NestJS 글로벌 ExceptionFilter 가 반환하는 형태와 호환.
type ApiError = {
  message: string;
  statusCode?: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    // 204 No Content (DELETE 응답) 케이스 — 본문 비었음
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }
  const err = (await res.json().catch(() => ({}))) as ApiError;
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type CreateInvitationInput = {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
};

/** POST /workspaces/:id/invitations */
export async function createInvitation(
  accessToken: string,
  input: CreateInvitationInput,
): Promise<Invitation> {
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${input.workspaceId}/invitations`,
    { method: "POST", json: true, body: JSON.stringify({ email: input.email, role: input.role }) },
  );
  return handleResponse<Invitation>(res);
}

/** GET /workspaces/:id/invitations */
export async function fetchPendingInvitations(
  accessToken: string,
  workspaceId: string,
): Promise<ReadonlyArray<Invitation>> {
  const res = await fetchWithAuth(`${API_URL}/workspaces/${workspaceId}/invitations`);
  return handleResponse<Invitation[]>(res);
}

/**
 * GET /invitations/:token  (Public — 비로그인도 호출 가능)
 *
 * 토큰이 없거나 만료되어도 페이지는 렌더링해야 하므로,
 * 404 일 때만 null 을 반환하고 그 외 에러는 throw.
 */
export async function fetchInvitationByToken(
  token: string,
): Promise<Invitation | null> {
  const res = await fetch(`${API_URL}/invitations/${token}`);
  if (res.status === 404) return null;
  return handleResponse<Invitation>(res);
}

/** POST /invitations/:token/accept */
export async function acceptInvitation(
  accessToken: string,
  token: string,
): Promise<{ workspaceId: string }> {
  const res = await fetchWithAuth(`${API_URL}/invitations/${token}/accept`, { method: "POST" });
  return handleResponse<{ workspaceId: string }>(res);
}

/** DELETE /invitations/:token */
export async function cancelInvitation(
  accessToken: string,
  token: string,
): Promise<void> {
  const res = await fetchWithAuth(`${API_URL}/invitations/${token}`, { method: "DELETE" });
  await handleResponse<void>(res);
}
