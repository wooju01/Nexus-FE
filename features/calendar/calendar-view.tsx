import type { CalendarEvent } from "@/types/domain";
import { CalendarEventPane } from "./calendar-event-pane";
import { CalendarHeader } from "./calendar-header";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { toDateKey } from "./calendar-utils";

type CalendarViewProps = {
  viewMonth: Date;
  events: ReadonlyArray<CalendarEvent>;
  selectedEvent: CalendarEvent | undefined;
};

/**
 * 캘린더 화면 셸.
 *
 * 좌측: 헤더 + 월 그리드
 * 우측: 선택된 이벤트가 있으면 상세 패널
 *
 * 데이터 fetch / searchParams 파싱은 page.tsx 가 책임.
 * 이 컴포넌트는 props 만 받아 layout 구성.
 */
export function CalendarView({
  viewMonth,
  events,
  selectedEvent,
}: CalendarViewProps) {
  const closeHref = `/calendar?date=${toDateKey(viewMonth)}`;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <CalendarHeader viewMonth={viewMonth} />
        <CalendarMonthGrid
          viewMonth={viewMonth}
          events={events}
          selectedEventId={selectedEvent?.id}
        />
      </div>

      {selectedEvent ? (
        <CalendarEventPane event={selectedEvent} closeHref={closeHref} />
      ) : null}
    </div>
  );
}
