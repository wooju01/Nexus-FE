import Link from "next/link";

import { cn } from "@/lib/utils/cn";

import type { CalendarEvent } from "@/types/domain";
import { getEventPillClass } from "./calendar-color";
import { formatEventTime } from "./calendar-utils";

type CalendarEventPillProps = {
  event: CalendarEvent;
  isActive?: boolean;
};

/**
 * 월 그리드 셀 안에 들어가는 이벤트 pill.
 * - `?event=<id>` 쿼리스트링을 붙여 우측 상세 패널을 연다.
 * - allDay 이벤트는 "All day" 표시.
 */
export function CalendarEventPill({
  event,
  isActive = false,
}: CalendarEventPillProps) {
  return (
    <Link
      href={`/calendar?event=${event.id}`}
      scroll={false}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-90",
        getEventPillClass(event.color),
        isActive && "ring-1 ring-fg-primary/30",
      )}
      title={`${formatEventTime(event)} · ${event.title}`}
    >
      <span className="mr-1 text-[10px] opacity-70">
        {formatEventTime(event)}
      </span>
      <span>{event.title}</span>
    </Link>
  );
}
