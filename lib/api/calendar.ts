import {
  CALENDAR_EVENTS_MOCK,
  getCalendarEvent,
  listCalendarEventsInRange,
} from "@/lib/mocks/calendar-events";

import type { CalendarEvent, WorkspaceId } from "@/types/domain";

/**
 * 캘린더 BE API 호출 래퍼.
 *
 * 현재는 mock 으로 동작하지만 함수 시그니처는 실 BE 호출과 동일하게 맞춰뒀다.
 * 인증 연동 + 워크스페이스 선택 UI 가 들어오면 내부 구현만 `fetch()` 로 교체하면 됨.
 *
 * 실제 호출 시 매핑되는 BE 엔드포인트 (`v1` prefix 포함):
 *   list   → GET    /v1/workspaces/:workspaceId/calendar/events?from=&to=
 *   getOne → GET    /v1/workspaces/:workspaceId/calendar/events/:eventId
 *   create → POST   /v1/workspaces/:workspaceId/calendar/events
 *   update → PATCH  /v1/workspaces/:workspaceId/calendar/events/:eventId
 *   delete → DELETE /v1/workspaces/:workspaceId/calendar/events/:eventId
 */

// TODO(NX-calendar-api): 인증 토큰 도입 후 process.env.NEXT_PUBLIC_API_BASE_URL 사용.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/v1";

export type ListEventsParams = {
  workspaceId: WorkspaceId;
  /** ISO 8601. 양쪽 모두 필수. 60일 초과 범위는 BE 가 400 으로 거절. */
  from: string;
  to: string;
};

export async function listCalendarEvents(
  params: ListEventsParams,
): Promise<CalendarEvent[]> {
  // TODO(NX-calendar-api): 실 호출로 교체.
  //   const res = await authedFetch(
  //     `${API_BASE_URL}/workspaces/${params.workspaceId}/calendar/events?from=${params.from}&to=${params.to}`,
  //   );
  //   return res.json();
  void params.workspaceId;
  return Promise.resolve(listCalendarEventsInRange(params.from, params.to));
}

export async function getCalendarEventById(
  workspaceId: WorkspaceId,
  eventId: string,
): Promise<CalendarEvent | null> {
  void workspaceId;
  // TODO(NX-calendar-api): 실 호출로 교체.
  return Promise.resolve(getCalendarEvent(eventId) ?? null);
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

export async function createCalendarEvent(
  workspaceId: WorkspaceId,
  input: CreateEventInput,
): Promise<CalendarEvent> {
  // TODO(NX-calendar-api): 실 호출로 교체.
  //   const res = await authedFetch(
  //     `${API_BASE_URL}/workspaces/${workspaceId}/calendar/events`,
  //     { method: "POST", body: JSON.stringify(input) },
  //   );
  //   return res.json();
  return Promise.resolve({
    id: `evt_${Math.random().toString(36).slice(2, 10)}`,
    workspaceId,
    createdById: "u-sejun",
    title: input.title,
    description: input.description ?? null,
    startAt: input.startAt,
    endAt: input.endAt,
    allDay: input.allDay ?? false,
    location: input.location ?? null,
    color: input.color ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [
      {
        userId: "u-sejun",
        status: "ACCEPTED",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
    ],
  });
}

export type UpdateEventInput = Partial<CreateEventInput>;

export async function updateCalendarEvent(
  workspaceId: WorkspaceId,
  eventId: string,
  input: UpdateEventInput,
): Promise<CalendarEvent | null> {
  void workspaceId;
  void input;
  // TODO(NX-calendar-api): 실 호출로 교체.
  return Promise.resolve(getCalendarEvent(eventId) ?? null);
}

export async function deleteCalendarEvent(
  workspaceId: WorkspaceId,
  eventId: string,
): Promise<void> {
  void workspaceId;
  void eventId;
  // TODO(NX-calendar-api): 실 호출로 교체.
  return Promise.resolve();
}

/**
 * 인증·워크스페이스 선택 UI 도입 전까지 캘린더가 임시로 사용하는 상수.
 * BE 연결 시 `useCurrentWorkspace()` 같은 훅으로 교체.
 */
export const TEMP_WORKSPACE_ID = "ws_temp";

/**
 * 페이지 단에서 mock 시드 직접 노출 (SSR 에서 fetch 없이 첫 렌더 가능).
 * 실 BE 도입 후엔 page.tsx 가 `listCalendarEvents` 를 await 하는 형태로 교체.
 */
export const ALL_MOCK_EVENTS = CALENDAR_EVENTS_MOCK;
