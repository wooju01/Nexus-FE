/**
 * 초대 API 클라이언트.
 * TODO(sejun, NX-invite): BE 연동 시 실제 fetch로 교체.
 * 현재는 목 데이터를 비동기로 반환하여 UI 로딩 상태를 검증할 수 있도록 한다.
 */

import type { Invitation, WorkspaceRole } from "@/types/invitation";
import { getPendingInvitations, getInvitationByToken } from "@/lib/mocks/invitations";

export type CreateInvitationInput = {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** POST /workspaces/:id/invitations */
export async function createInvitation(
  input: CreateInvitationInput,
): Promise<Invitation> {
  // TODO(sejun, NX-invite): POST /workspaces/:id/invitations
  await delay(500);
  return {
    id: `inv-${Date.now()}`,
    token: `tok-${Date.now()}`,
    workspaceId: input.workspaceId,
    workspaceName: "Aether Labs",
    email: input.email,
    role: input.role,
    createdBy: "u-sejun",
    creatorName: "Sejun Yun",
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    acceptedAt: null,
    createdAt: new Date().toISOString(),
  };
}

/** GET /workspaces/:id/invitations */
export async function fetchPendingInvitations(
  _workspaceId: string,
): Promise<ReadonlyArray<Invitation>> {
  // TODO(sejun, NX-invite): GET /workspaces/:id/invitations
  await delay(300);
  return getPendingInvitations();
}

/** GET /invitations/:token */
export async function fetchInvitationByToken(
  token: string,
): Promise<Invitation | null> {
  // TODO(sejun, NX-invite): GET /invitations/:token
  await delay(300);
  return getInvitationByToken(token) ?? null;
}

/** POST /invitations/:token/accept */
export async function acceptInvitation(_token: string): Promise<void> {
  // TODO(sejun, NX-invite): POST /invitations/:token/accept
  await delay(400);
}

/** DELETE /invitations/:token */
export async function cancelInvitation(_token: string): Promise<void> {
  // TODO(sejun, NX-invite): DELETE /invitations/:token
  await delay(300);
}
