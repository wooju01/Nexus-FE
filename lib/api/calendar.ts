/**
 * 캘린더 API 클라이언트.
 *
 * 팀 컨벤션 (lib/api/auth.ts·workspace.ts·invitations.ts) 그대로 따른다:
 *   - process.env.NEXT_PUBLIC_API_URL 베이스 사용
 *   - 토큰은 호출 시점에 인자로 명시 전달 (자동 주입 X)
 *   - 응답 비-OK 시 BE 에러 메시지 그대로 throw
 *
 * BE 라우트:
 *   list   → GET    /workspaces/:workspaceId/calendar/events?from=&to=
 *   getOne → GET    /workspaces/:workspaceId/calendar/events/:eventId
 *   create → POST   /workspaces/:workspaceId/calendar/events
 *   update → PATCH  /workspaces/:workspaceId/calendar/events/:eventId
 *   delete → DELETE /workspaces/:workspaceId/calendar/events/:eventId
 *
 * 응답 셰이프는 BE 의 `CalendarEventResponse` 와 FE 의 `CalendarEvent` 가 동일하게
 * 맞춰져 있어 별도 mapper 없이 그대로 사용한다.
 */

import type { CalendarEvent, WorkspaceId } from "@/types/domain";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
import { fetchWithAuth } from "@/lib/auth/fetch-with-auth";

type ApiError = {
  message: string;
  statusCode?: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }
  const err = (await res.json().catch(() => ({}))) as ApiError;
  throw new Error(err.message ?? "알 수 없는 오류가 발생했습니다.");
}

export type ListEventsParams = {
  workspaceId: WorkspaceId;
  /** ISO 8601. 양쪽 모두 필수. 60일 초과 범위는 BE 가 400 으로 거절. */
  from: string;
  to: string;
};

/** GET /workspaces/:id/calendar/events?from=&to= */
export async function listCalendarEvents(
  accessToken: string,
  params: ListEventsParams,
): Promise<CalendarEvent[]> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${params.workspaceId}/calendar/events?${qs.toString()}`,
  );
  return handleResponse<CalendarEvent[]>(res);
}

/**
 * GET /workspaces/:id/calendar/events/:eventId
 *
 * 404 시 null 반환 — 잘못된 eventId 쿼리에 빈 우측 패널 표시 가능.
 * 그 외 에러는 throw.
 */
export async function getCalendarEventById(
  accessToken: string,
  workspaceId: WorkspaceId,
  eventId: string,
): Promise<CalendarEvent | null> {
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${workspaceId}/calendar/events/${eventId}`,
  );
  if (res.status === 404) return null;
  return handleResponse<CalendarEvent>(res);
}

export type CreateEventInput = {
  title: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
  participantIds?: string[];
};

/** POST /workspaces/:id/calendar/events */
export async function createCalendarEvent(
  accessToken: string,
  workspaceId: WorkspaceId,
  input: CreateEventInput,
): Promise<CalendarEvent> {
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${workspaceId}/calendar/events`,
    { method: "POST", json: true, body: JSON.stringify(input) },
  );
  return handleResponse<CalendarEvent>(res);
}

export type UpdateEventInput = Partial<CreateEventInput>;

/** PATCH /workspaces/:id/calendar/events/:eventId */
export async function updateCalendarEvent(
  accessToken: string,
  workspaceId: WorkspaceId,
  eventId: string,
  input: UpdateEventInput,
): Promise<CalendarEvent> {
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${workspaceId}/calendar/events/${eventId}`,
    { method: "PATCH", json: true, body: JSON.stringify(input) },
  );
  return handleResponse<CalendarEvent>(res);
}

/** DELETE /workspaces/:id/calendar/events/:eventId */
export async function deleteCalendarEvent(
  accessToken: string,
  workspaceId: WorkspaceId,
  eventId: string,
): Promise<void> {
  const res = await fetchWithAuth(
    `${API_URL}/workspaces/${workspaceId}/calendar/events/${eventId}`,
    { method: "DELETE" },
  );
  await handleResponse<void>(res);
}
