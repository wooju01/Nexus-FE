"use client";

import type { CalendarEvent } from "@/types/domain";
import { CalendarEventPane } from "./calendar-event-pane";
import { CalendarHeader } from "./calendar-header";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { toDateKey } from "./calendar-utils";

type CalendarViewProps = {
  viewMonth: Date;
  events: ReadonlyArray<CalendarEvent>;
  selectedEvent: CalendarEvent | undefined;
  /** + New event 활성화 (워크스페이스 잡힌 뒤 true). */
  canCreate?: boolean;
  /** + New event 클릭 콜백. */
  onNewEvent?: () => void;
  /** 우측 패널의 수정 버튼 클릭 콜백. */
  onEditEvent?: (event: CalendarEvent) => void;
  /** 우측 패널의 삭제 버튼 클릭 콜백 (확인 후 호출). */
  onDeleteEvent?: (event: CalendarEvent) => Promise<void> | void;
};

/**
 * 캘린더 화면 셸.
 *
 * 좌측: 헤더 + 월 그리드
 * 우측: 선택된 이벤트가 있으면 상세 패널 (수정/삭제 액션 포함)
 *
 * 데이터 fetch · 모달 state · 액션 핸들러는 상위(`CalendarLoader`) 책임.
 */
export function CalendarView({
  viewMonth,
  events,
  selectedEvent,
  canCreate,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const closeHref = `/calendar?date=${toDateKey(viewMonth)}`;

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <CalendarHeader
          viewMonth={viewMonth}
          canCreate={canCreate}
          onNewEvent={onNewEvent}
        />
        <CalendarMonthGrid
          viewMonth={viewMonth}
          events={events}
          selectedEventId={selectedEvent?.id}
        />
      </div>

      {selectedEvent ? (
        <CalendarEventPane
          event={selectedEvent}
          closeHref={closeHref}
          onEdit={onEditEvent ? () => onEditEvent(selectedEvent) : undefined}
          onDelete={
            onDeleteEvent ? () => onDeleteEvent(selectedEvent) : undefined
          }
        />
      ) : null}
    </div>
  );
}
