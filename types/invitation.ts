/**
 * 초대 관련 FE 도메인 타입.
 * Prisma Invitation 모델을 기반으로 FE 표시에 적합한 형태로 정의.
 * BE 계약 확정 시 lib/api/mappers에서 변환 레이어를 둔다.
 */

import type { UserId } from "@/types/domain";

export type InvitationId = string;
export type InvitationToken = string;
export type WorkspaceRole = "ADMIN" | "MEMBER";
export type InvitationStatus = "pending" | "accepted" | "expired";

export type Invitation = {
  id: InvitationId;
  token: InvitationToken;
  workspaceId: string;
  workspaceName: string;
  email: string | null;
  role: WorkspaceRole;
  createdBy: UserId;
  creatorName: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};
