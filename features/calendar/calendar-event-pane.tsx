"use client";

import { useState } from "react";
import Link from "next/link";

import { CalendarIcon, EditIcon, TrashIcon, XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils/cn";

import type { CalendarEvent, RsvpStatus } from "@/types/domain";
import { getEventStripeClass } from "./calendar-color";
import { formatEventDateRange } from "./calendar-utils";

type CalendarEventPaneProps = {
  event: CalendarEvent;
  /** 닫기 버튼이 가리킬 URL — 보통 캘린더 루트(`/calendar?date=...`). */
  closeHref: string;
  /** 수정 버튼 클릭 — 상위에서 EditModal 열기. 미지정 시 버튼 숨김. */
  onEdit?: () => void;
  /** 삭제 핸들러 — Promise<void>. 호출 측에서 BE 호출 + events 리스트 갱신. */
  onDelete?: () => Promise<void> | void;
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
 * - `?event=<id>` 쿼리가 있을 때만 마운트
 * - 헤더 우측에 수정 / 삭제 액션 버튼 (props 가 있을 때만 노출)
 *   삭제는 confirm 다이얼로그 통과해야 호출
 */
export function CalendarEventPane({
  event,
  closeHref,
  onEdit,
  onDelete,
}: CalendarEventPaneProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function openConfirm() {
    setDeleteError(null);
    setIsConfirmOpen(true);
  }

  function closeConfirm() {
    if (isDeleting) return;
    setIsConfirmOpen(false);
  }

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete();
      setIsConfirmOpen(false);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
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
        <div className="flex items-center gap-1">
          {onEdit ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={isDeleting}
              aria-label="이벤트 수정"
              className="text-fg-tertiary hover:text-fg-primary"
            >
              <EditIcon className="size-4" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={openConfirm}
              disabled={isDeleting}
              aria-label="이벤트 삭제"
              className="text-fg-tertiary hover:text-priority-p1"
            >
              <TrashIcon className="size-4" />
            </Button>
          ) : null}
          <Link
            href={closeHref}
            aria-label="패널 닫기"
            scroll={false}
            className="flex size-7 items-center justify-center rounded-md text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <XIcon className="size-4" />
          </Link>
        </div>
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

        {deleteError ? (
          <p role="alert" className="mt-4 text-sm text-priority-p1">
            {deleteError}
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

    {onDelete ? (
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="이벤트를 삭제할까요?"
        description={`"${event.title}" 이벤트가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        cancelLabel="취소"
        danger
        isLoading={isDeleting}
        onCancel={closeConfirm}
        onConfirm={handleConfirmDelete}
      />
    ) : null}
    </>
  );
}
