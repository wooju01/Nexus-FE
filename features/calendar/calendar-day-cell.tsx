import { cn } from "@/lib/utils/cn";

import type { CalendarEvent } from "@/types/domain";
import { CalendarEventPill } from "./calendar-event-pill";

type CalendarDayCellProps = {
  date: Date;
  isOtherMonth: boolean;
  isToday: boolean;
  events: ReadonlyArray<CalendarEvent>;
  selectedEventId: string | undefined;
};

const MAX_VISIBLE_EVENTS = 3;

/**
 * 월 그리드 한 칸.
 * - 다른 달 날짜는 흐리게
 * - 오늘은 숫자에 강조 도트
 * - 이벤트 3개까지 표시, 초과분은 "+N more"
 */
export function CalendarDayCell({
  date,
  isOtherMonth,
  isToday,
  events,
  selectedEventId,
}: CalendarDayCellProps) {
  const visible = events.slice(0, MAX_VISIBLE_EVENTS);
  const hidden = events.length - visible.length;

  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-col gap-1 border-b border-r border-border-subtle p-1.5",
        isOtherMonth && "bg-surface-subtle/50",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums",
            isToday && "bg-accent text-white",
            !isToday && isOtherMonth && "text-fg-tertiary",
            !isToday && !isOtherMonth && "text-fg-secondary",
          )}
        >
          {date.getDate()}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {visible.map((event) => (
          <CalendarEventPill
            key={event.id}
            event={event}
            isActive={event.id === selectedEventId}
          />
        ))}
        {hidden > 0 ? (
          <span className="px-1.5 text-[10px] font-medium text-fg-tertiary">
            +{hidden} more
          </span>
        ) : null}
      </div>
    </div>
  );
}
