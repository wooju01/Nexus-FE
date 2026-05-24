import type { CalendarEvent } from "@/types/domain";

/**
 * 캘린더 mock 이벤트 시드.
 *
 * - BE `CalendarEventResponse` 와 동일한 셰이프
 * - 시각은 ISO 8601 UTC (`.toISOString()` 결과)
 * - "오늘" 기준이 아니라 고정 날짜를 써서 스크린샷·테스트에 안정적
 *   (필요해지면 `import { addDays } from "@/lib/utils/date"` 같은 헬퍼로 동적 변환)
 *
 * BE 연결 후 이 파일은 `lib/api/calendar.ts` 의 mock fallback 으로만 사용된다.
 */

const TEMP_WORKSPACE_ID = "ws_temp"; // 인증·워크스페이스 선택 UI 도입 전까지 임시 상수.

export const CALENDAR_EVENTS_MOCK: ReadonlyArray<CalendarEvent> = [
  {
    id: "evt_kickoff",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-sejun",
    title: "Q2 런칭 킥오프",
    description: "Launch · Q2 일정 정렬과 OKR 확정.",
    startAt: "2026-04-27T01:00:00.000Z", // 10:00 KST
    endAt: "2026-04-27T02:00:00.000Z", // 11:00 KST
    allDay: false,
    location: "회의실 4F · Pluto",
    color: "accent",
    createdAt: "2026-04-20T09:00:00.000Z",
    updatedAt: "2026-04-20T09:00:00.000Z",
    participants: [
      {
        userId: "u-sejun",
        status: "ACCEPTED",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
      {
        userId: "u-sora",
        status: "ACCEPTED",
        user: { id: "u-sora", name: "Sora Kim", avatar: null },
      },
      {
        userId: "u-minho",
        status: "PENDING",
        user: { id: "u-minho", name: "Minho Lee", avatar: null },
      },
      {
        userId: "u-hana",
        status: "ACCEPTED",
        user: { id: "u-hana", name: "Hana Jeong", avatar: null },
      },
    ],
  },
  {
    id: "evt_design_review",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-hana",
    title: "Hero 섹션 디자인 리뷰",
    description: "v3 시안 기반. 카피 톤 + CTA 위치 의사결정.",
    startAt: "2026-04-28T05:00:00.000Z",
    endAt: "2026-04-28T06:00:00.000Z",
    allDay: false,
    location: "Zoom",
    color: "priority-p2",
    createdAt: "2026-04-22T03:00:00.000Z",
    updatedAt: "2026-04-22T03:00:00.000Z",
    participants: [
      {
        userId: "u-hana",
        status: "ACCEPTED",
        user: { id: "u-hana", name: "Hana Jeong", avatar: null },
      },
      {
        userId: "u-sejun",
        status: "ACCEPTED",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
      {
        userId: "u-ethan",
        status: "MAYBE",
        user: { id: "u-ethan", name: "Ethan Park", avatar: null },
      },
    ],
  },
  {
    id: "evt_eng_sync",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-ethan",
    title: "Engineering weekly sync",
    description: null,
    startAt: "2026-04-29T01:30:00.000Z",
    endAt: "2026-04-29T02:30:00.000Z",
    allDay: false,
    location: null,
    color: null,
    createdAt: "2026-04-15T05:00:00.000Z",
    updatedAt: "2026-04-15T05:00:00.000Z",
    participants: [
      {
        userId: "u-ethan",
        status: "ACCEPTED",
        user: { id: "u-ethan", name: "Ethan Park", avatar: null },
      },
      {
        userId: "u-yuna",
        status: "ACCEPTED",
        user: { id: "u-yuna", name: "Yuna Choi", avatar: null },
      },
      {
        userId: "u-sejun",
        status: "PENDING",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
    ],
  },
  {
    id: "evt_customer_interview",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-minho",
    title: "고객 인터뷰 — 콘텐츠 운영팀",
    description:
      "협업 도구 통합 만족도 + 현재 페인 포인트 청취. 노트는 Notion 에 정리.",
    startAt: "2026-04-30T07:00:00.000Z",
    endAt: "2026-04-30T08:00:00.000Z",
    allDay: false,
    location: "고객사 사무실",
    color: "priority-p3",
    createdAt: "2026-04-23T02:00:00.000Z",
    updatedAt: "2026-04-23T02:00:00.000Z",
    participants: [
      {
        userId: "u-minho",
        status: "ACCEPTED",
        user: { id: "u-minho", name: "Minho Lee", avatar: null },
      },
      {
        userId: "u-sora",
        status: "ACCEPTED",
        user: { id: "u-sora", name: "Sora Kim", avatar: null },
      },
    ],
  },
  {
    id: "evt_release_window",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-yuna",
    title: "Release window — Stripe 인테그레이션",
    description: "스테이징 검증 후 prod 배포. 롤백 플랜 사전 확인.",
    startAt: "2026-05-04T06:00:00.000Z",
    endAt: "2026-05-04T08:00:00.000Z",
    allDay: false,
    location: null,
    color: "priority-p1",
    createdAt: "2026-04-24T01:00:00.000Z",
    updatedAt: "2026-04-24T01:00:00.000Z",
    participants: [
      {
        userId: "u-yuna",
        status: "ACCEPTED",
        user: { id: "u-yuna", name: "Yuna Choi", avatar: null },
      },
      {
        userId: "u-ethan",
        status: "ACCEPTED",
        user: { id: "u-ethan", name: "Ethan Park", avatar: null },
      },
    ],
  },
  {
    id: "evt_holiday",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-sejun",
    title: "공휴일 — 어린이날",
    description: null,
    startAt: "2026-05-05T00:00:00.000Z",
    endAt: "2026-05-06T00:00:00.000Z",
    allDay: true,
    location: null,
    color: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    participants: [
      {
        userId: "u-sejun",
        status: "ACCEPTED",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
    ],
  },
  {
    id: "evt_retro",
    workspaceId: TEMP_WORKSPACE_ID,
    createdById: "u-sora",
    title: "스프린트 회고",
    description: "지난 2주 회고. Keep / Problem / Try.",
    startAt: "2026-05-08T07:00:00.000Z",
    endAt: "2026-05-08T08:30:00.000Z",
    allDay: false,
    location: "회의실 4F · Mars",
    color: "accent",
    createdAt: "2026-04-26T02:00:00.000Z",
    updatedAt: "2026-04-26T02:00:00.000Z",
    participants: [
      {
        userId: "u-sora",
        status: "ACCEPTED",
        user: { id: "u-sora", name: "Sora Kim", avatar: null },
      },
      {
        userId: "u-sejun",
        status: "ACCEPTED",
        user: { id: "u-sejun", name: "Sejun Yun", avatar: null },
      },
      {
        userId: "u-minho",
        status: "ACCEPTED",
        user: { id: "u-minho", name: "Minho Lee", avatar: null },
      },
      {
        userId: "u-hana",
        status: "ACCEPTED",
        user: { id: "u-hana", name: "Hana Jeong", avatar: null },
      },
      {
        userId: "u-ethan",
        status: "ACCEPTED",
        user: { id: "u-ethan", name: "Ethan Park", avatar: null },
      },
      {
        userId: "u-yuna",
        status: "DECLINED",
        user: { id: "u-yuna", name: "Yuna Choi", avatar: null },
      },
    ],
  },
];

export function getCalendarEvent(
  id: string,
): CalendarEvent | undefined {
  return CALENDAR_EVENTS_MOCK.find((e) => e.id === id);
}

/**
 * 시간 범위와 겹치는 이벤트만 반환 (BE 의 `where: { startAt: { lt: to }, endAt: { gt: from } }` 와 동일).
 */
export function listCalendarEventsInRange(
  fromIso: string,
  toIso: string,
): CalendarEvent[] {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return CALENDAR_EVENTS_MOCK.filter((e) => {
    const start = new Date(e.startAt).getTime();
    const end = new Date(e.endAt).getTime();
    return start < to && end > from;
  }).sort(
    (a, b) =>
      new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}
