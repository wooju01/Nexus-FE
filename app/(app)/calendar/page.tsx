import { CalendarView } from "@/features/calendar/calendar-view";
import { addMonths, startOfMonth } from "@/features/calendar/calendar-utils";
import {
  TEMP_WORKSPACE_ID,
  getCalendarEventById,
  listCalendarEvents,
} from "@/lib/api/calendar";

type CalendarPageProps = {
  // Next.js 16: searchParams 는 Promise.
  searchParams: Promise<{ date?: string; event?: string }>;
};

/**
 * 워크스페이스 캘린더 — 월 뷰.
 *
 * URL 파라미터:
 *   ?date=YYYY-MM-DD  현재 보고 있는 달의 임의 날짜 (없으면 오늘)
 *   ?event=<id>       선택된 이벤트 — 우측 상세 패널 마운트
 *
 * 인증·워크스페이스 선택 UI 도입 전까지 `TEMP_WORKSPACE_ID` 사용.
 */
export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const { date, event: eventId } = await searchParams;

  const viewMonth = resolveViewMonth(date);
  const { from, to } = computeRange(viewMonth);

  const [events, selectedEvent] = await Promise.all([
    listCalendarEvents({ workspaceId: TEMP_WORKSPACE_ID, from, to }),
    eventId
      ? getCalendarEventById(TEMP_WORKSPACE_ID, eventId)
      : Promise.resolve(null),
  ]);

  return (
    <CalendarView
      viewMonth={viewMonth}
      events={events}
      selectedEvent={selectedEvent ?? undefined}
    />
  );
}

/**
 * `?date=` 파싱 — 잘못된 값은 오늘로 fallback (404 던지지 않음).
 */
function resolveViewMonth(dateParam: string | undefined): Date {
  if (dateParam) {
    const parsed = new Date(dateParam);
    if (!Number.isNaN(parsed.getTime())) {
      return startOfMonth(parsed);
    }
  }
  return startOfMonth(new Date());
}

/**
 * 월 그리드는 6주 표시이므로 ±일주일 여유로 시간 범위를 잡는다.
 * BE 의 60일 cap 안에 들어와야 함 — 한 달 + 양쪽 여유 = 약 6주.
 */
function computeRange(viewMonth: Date): { from: string; to: string } {
  const from = addMonths(viewMonth, 0);
  from.setDate(1);
  from.setDate(from.getDate() - 7); // 첫 주 일요일이 이전 달일 수 있음

  const to = addMonths(viewMonth, 1);
  to.setDate(7); // 다음 달 첫 주까지 포함

  return { from: from.toISOString(), to: to.toISOString() };
}
