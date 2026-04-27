import type { CalendarEvent } from "@/types/domain";
import { CalendarDayCell } from "./calendar-day-cell";
import {
  buildMonthMatrix,
  indexEventsByDay,
  isSameDay,
  toDateKey,
} from "./calendar-utils";

type CalendarMonthGridProps = {
  viewMonth: Date;
  events: ReadonlyArray<CalendarEvent>;
  selectedEventId: string | undefined;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 6주 × 7일 매트릭스 그리드.
 *
 * 매트릭스 빌드와 이벤트 인덱싱은 순수 함수(`calendar-utils`)가 책임.
 * 이 컴포넌트는 레이아웃과 셀 props 분배만 담당.
 */
export function CalendarMonthGrid({
  viewMonth,
  events,
  selectedEventId,
}: CalendarMonthGridProps) {
  const matrix = buildMonthMatrix(viewMonth);
  const indexed = indexEventsByDay(events, matrix);
  const today = new Date();
  const currentMonthIdx = viewMonth.getMonth();

  return (
    <div className="flex flex-1 flex-col">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-subtle">
        {WEEKDAYS.map((d, idx) => (
          <div
            key={d}
            className="border-r border-border-subtle px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-fg-tertiary last:border-r-0"
          >
            <span
              className={
                idx === 0
                  ? "text-priority-p1"
                  : idx === 6
                    ? "text-accent"
                    : ""
              }
            >
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* 6주 그리드 */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 border-l border-t border-border-subtle">
        {matrix.map((date) => {
          const key = toDateKey(date);
          const dayEvents = indexed.get(key) ?? [];
          return (
            <CalendarDayCell
              key={key}
              date={date}
              isOtherMonth={date.getMonth() !== currentMonthIdx}
              isToday={isSameDay(date, today)}
              events={dayEvents}
              selectedEventId={selectedEventId}
            />
          );
        })}
      </div>
    </div>
  );
}
