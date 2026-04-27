import type { CalendarEvent } from "@/types/domain";

/**
 * 캘린더 화면 계산용 순수 함수 모음.
 *
 * - 모든 입력은 ISO 8601 문자열 또는 `Date`
 * - 표시는 "사용자 로컬 타임존" 기준 — 라이브러리 없이 `Date` 만으로 처리
 *   (라이브러리 도입 시 `date-fns-tz` 권장, 다만 v0 에선 의존성 추가 보류)
 *
 * 월 그리드는 항상 6주(42칸) 매트릭스로 그린다 — 달이 바뀌어도 높이가 흔들리지 않게.
 */

/** YYYY-MM-DD 키 — 같은 날 이벤트를 매핑할 때 키로 사용. */
export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/**
 * 월 그리드를 위한 6주 × 7일 = 42칸 날짜 배열 반환.
 * 첫 칸은 그 달 1일이 속한 주의 일요일.
 *
 * 예) 2026-04-01(수) → 2026-03-29(일) 부터 시작.
 */
export function buildMonthMatrix(viewMonth: Date): Date[] {
  const firstOfMonth = startOfMonth(viewMonth);
  const dayOfWeek = firstOfMonth.getDay(); // 0=Sun .. 6=Sat
  const start = addDays(firstOfMonth, -dayOfWeek);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/**
 * 이벤트가 특정 날짜에 "걸쳐"있는지 — 다일 이벤트 표시용.
 * 시작일과 종료일 사이의 모든 날짜에 true.
 */
export function eventOccursOnDate(
  event: CalendarEvent,
  date: Date,
): boolean {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);
  return start.getTime() < dayEnd.getTime() && end.getTime() > dayStart.getTime();
}

/**
 * 날짜별 이벤트 인덱스. 월 그리드 셀 채울 때 한 번 만들어두고 재사용.
 */
export function indexEventsByDay(
  events: ReadonlyArray<CalendarEvent>,
  matrix: Date[],
): Map<DateKey, CalendarEvent[]> {
  const index = new Map<DateKey, CalendarEvent[]>();
  for (const day of matrix) {
    const key = toDateKey(day);
    const dayEvents = events.filter((e) => eventOccursOnDate(e, day));
    if (dayEvents.length > 0) {
      index.set(key, dayEvents);
    }
  }
  return index;
}

/** "Apr 27" 같은 헤더 라벨. */
export function formatMonthHeader(date: Date): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

/** "10:00 AM" 형식 시각 라벨. allDay 이벤트는 "All day". */
export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) {
    return "All day";
  }
  const start = new Date(event.startAt);
  return start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEventDateRange(event: CalendarEvent): string {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);

  const dateStr = start.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  if (event.allDay) {
    return `${dateStr} · 종일`;
  }

  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${dateStr} · ${fmt(start)} – ${fmt(end)}`;
}
