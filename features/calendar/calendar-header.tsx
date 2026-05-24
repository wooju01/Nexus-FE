"use client";

import Link from "next/link";

import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { addMonths, formatMonthHeader, toDateKey } from "./calendar-utils";

type CalendarHeaderProps = {
  viewMonth: Date;
  /**
   * + New event 버튼 활성화 여부.
   * 워크스페이스 로딩 전이면 false 로 두고 disabled 처리.
   */
  canCreate?: boolean;
  /** + New event 클릭 시 호출 — 상위에서 모달 토글. */
  onNewEvent?: () => void;
};

/**
 * 캘린더 상단 컨트롤바.
 *
 * - 좌측: ◀ ▶ + 월 이름 + Today
 * - 우측: + New event (활성화 시 클릭하면 onNewEvent 호출)
 *
 * 월 이동은 `?date=YYYY-MM-DD` 쿼리스트링 변경으로 처리.
 * 페이지가 `searchParams.date` 를 받아 viewMonth 를 결정하므로 별도 client state 불필요.
 */
export function CalendarHeader({
  viewMonth,
  canCreate = false,
  onNewEvent,
}: CalendarHeaderProps) {
  const prev = toDateKey(addMonths(viewMonth, -1));
  const next = toDateKey(addMonths(viewMonth, 1));
  const today = toDateKey(new Date());

  return (
    <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-fg-primary tabular-nums">
          {formatMonthHeader(viewMonth)}
        </h1>

        <div className="flex items-center gap-1">
          <Link
            href={`/calendar?date=${prev}`}
            aria-label="이전 달"
            className="flex size-8 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <ChevronRightIcon className="size-4 rotate-180" />
          </Link>
          <Link
            href={`/calendar?date=${next}`}
            aria-label="다음 달"
            className="flex size-8 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <ChevronRightIcon className="size-4" />
          </Link>
        </div>

        <Link
          href={`/calendar?date=${today}`}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-fg-secondary hover:border-border-strong hover:text-fg-primary"
        >
          Today
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onNewEvent}
          disabled={!canCreate}
          title={canCreate ? "이벤트 만들기" : "워크스페이스 로딩 중"}
        >
          <PlusIcon className="mr-1 size-4" />
          New event
        </Button>
      </div>
    </header>
  );
}
