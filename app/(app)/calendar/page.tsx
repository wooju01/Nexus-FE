import { CalendarLoader } from "@/features/calendar/calendar-loader";
import { startOfMonth } from "@/features/calendar/calendar-utils";

type CalendarPageProps = {
  // Next.js 16: searchParams 는 Promise.
  searchParams: Promise<{ date?: string; event?: string }>;
};

/**
 * 워크스페이스 캘린더 — 월 뷰 (server component).
 *
 * URL 파라미터:
 *   ?date=YYYY-MM-DD  현재 보고 있는 달의 임의 날짜 (없으면 오늘)
 *   ?event=<id>       선택된 이벤트 — 우측 상세 패널 마운트
 *
 * 이 컴포넌트는 searchParams 파싱만 책임지고, 실제 데이터 fetch 는
 * client component `CalendarLoader` 가 인증 토큰을 사용해 수행한다.
 */
export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const { date, event: eventId } = await searchParams;
  const viewMonth = resolveViewMonth(date);

  return (
    <CalendarLoader
      viewMonthISO={viewMonth.toISOString()}
      selectedEventId={eventId}
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
