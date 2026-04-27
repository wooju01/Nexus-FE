import Link from "next/link";

import { CalendarIcon, XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

import type { CalendarEvent, RsvpStatus } from "@/types/domain";
import { getEventStripeClass } from "./calendar-color";
import { formatEventDateRange } from "./calendar-utils";

type CalendarEventPaneProps = {
  event: CalendarEvent;
  /** 닫기 버튼이 가리킬 URL — 보통 캘린더 루트(`/calendar?date=...`). */
  closeHref: string;
};

const RSVP_LABEL: Record<RsvpStatus, string> = {
  ACCEPTED: "참석",
  PENDING: "대기",
  DECLINED: "거절",
  MAYBE: "미정",
};

const RSVP_CLASS: Record<RsvpStatus, string> = {
  ACCEPTED: "bg-status-done/15 text-status-done",
  PENDING: "bg-fg-secondary/10 text-fg-secondary",
  DECLINED: "bg-priority-p1/15 text-priority-p1",
  MAYBE: "bg-priority-p3/15 text-priority-p3",
};

/**
 * 캘린더 이벤트 우측 상세 패널.
 *
 * 보드 `TaskDetailPane` 와 동일한 패턴 — `?event=<id>` 쿼리스트링이 있을 때만 마운트.
 */
export function CalendarEventPane({ event, closeHref }: CalendarEventPaneProps) {
  return (
    <aside
      aria-label={`이벤트 ${event.title} 상세`}
      className="flex w-[24rem] shrink-0 flex-col border-l border-border-subtle bg-surface-base"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "h-3 w-1 shrink-0 rounded-full",
              getEventStripeClass(event.color),
            )}
          />
          <span className="text-xs font-medium text-fg-tertiary">이벤트</span>
        </div>
        <Link
          href={closeHref}
          aria-label="패널 닫기"
          scroll={false}
          className="flex size-7 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <XIcon className="size-4" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-lg font-semibold leading-snug text-fg-primary">
          {event.title}
        </h2>

        <p className="mt-2 flex items-center gap-2 text-sm text-fg-secondary">
          <CalendarIcon className="size-4 text-fg-tertiary" aria-hidden="true" />
          {formatEventDateRange(event)}
        </p>

        {event.location ? (
          <p className="mt-1 text-sm text-fg-secondary">📍 {event.location}</p>
        ) : null}

        {event.description ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-fg-secondary">
            {event.description}
          </p>
        ) : null}

        <section className="mt-6">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-tertiary">
            참가자 ({event.participants.length})
          </h3>
          <ul className="space-y-2">
            {event.participants.map((p) => (
              <li
                key={p.userId}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar
                    initials={p.user.name
                      .split(" ")
                      .map((s) => s[0] ?? "")
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                    color="blue"
                    size="sm"
                    name={p.user.name}
                  />
                  <span className="truncate text-sm text-fg-primary">
                    {p.user.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    RSVP_CLASS[p.status],
                  )}
                >
                  {RSVP_LABEL[p.status]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
