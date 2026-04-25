import type { Invitation, InvitationToken } from "@/types/invitation";

/**
 * 초대 목 데이터.
 * pending 2건, accepted 1건, expired 1건.
 */
export const INVITATIONS: ReadonlyArray<Invitation> = [
  {
    id: "inv-1",
    token: "abc123def456",
    workspaceId: "ws-1",
    workspaceName: "Aether Labs",
    email: "newmember@example.com",
    role: "MEMBER",
    createdBy: "u-sejun",
    creatorName: "Sejun Yun",
    status: "pending",
    expiresAt: "2026-05-02T00:00:00Z",
    acceptedAt: null,
    createdAt: "2026-04-25T09:00:00Z",
  },
  {
    id: "inv-2",
    token: "xyz789uvw012",
    workspaceId: "ws-1",
    workspaceName: "Aether Labs",
    email: "designer@example.com",
    role: "ADMIN",
    createdBy: "u-sejun",
    creatorName: "Sejun Yun",
    status: "pending",
    expiresAt: "2026-05-01T00:00:00Z",
    acceptedAt: null,
    createdAt: "2026-04-24T14:00:00Z",
  },
  {
    id: "inv-3",
    token: "accepted001",
    workspaceId: "ws-1",
    workspaceName: "Aether Labs",
    email: "minho@example.com",
    role: "MEMBER",
    createdBy: "u-sejun",
    creatorName: "Sejun Yun",
    status: "accepted",
    expiresAt: "2026-05-01T00:00:00Z",
    acceptedAt: "2026-04-23T10:00:00Z",
    createdAt: "2026-04-22T09:00:00Z",
  },
  {
    id: "inv-4",
    token: "expired001",
    workspaceId: "ws-1",
    workspaceName: "Aether Labs",
    email: "old@example.com",
    role: "MEMBER",
    createdBy: "u-sejun",
    creatorName: "Sejun Yun",
    status: "expired",
    expiresAt: "2026-04-20T00:00:00Z",
    acceptedAt: null,
    createdAt: "2026-04-13T09:00:00Z",
  },
];

export function getInvitationByToken(
  token: InvitationToken,
): Invitation | undefined {
  return INVITATIONS.find((inv) => inv.token === token);
}

export function getPendingInvitations(): ReadonlyArray<Invitation> {
  return INVITATIONS.filter((inv) => inv.status === "pending");
}
