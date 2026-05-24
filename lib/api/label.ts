/**
 * 워크스페이스 라벨 API 클라이언트.
 *
 * BE 라우트:
 *   - GET  /workspaces/:workspaceId/labels   목록 조회
 *   - POST /workspaces/:workspaceId/labels   생성
 *   - PATCH /labels/:id                       수정
 *   - DELETE /labels/:id                      삭제
 *
 * 본 클라이언트는 보드 라벨 픽커에서 사용하는 조회만 구현.
 * 라벨 CRUD UI 는 별도 페이즈에서 추가.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) return res.json() as Promise<T>;
  const err = await res.json().catch(() => ({}));
  throw new Error(
    (err as { message?: string }).message ?? "알 수 없는 오류가 발생했습니다.",
  );
}

export type WorkspaceLabel = {
  id: string;
  workspaceId: string;
  name: string;
  color: string; // HEX "#3B82F6"
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /workspaces/:workspaceId/labels */
export async function getLabelsApi(
  accessToken: string,
  workspaceId: string,
): Promise<WorkspaceLabel[]> {
  const res = await fetch(`${API_URL}/workspaces/${workspaceId}/labels`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleResponse<WorkspaceLabel[]>(res);
}
