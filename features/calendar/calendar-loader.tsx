"use client";

import { useEffect, useState } from "react";

import { CalendarView } from "./calendar-view";
import {
  listCalendarEvents,
  getCalendarEventById,
} from "@/lib/api/calendar";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { getAccessToken } from "@/lib/auth/tokens";
import { addMonths } from "./calendar-utils";

import type { CalendarEvent } from "@/types/domain";

type CalendarLoaderProps = {
  /** server 에서 파싱한 현재 보고 있는 달 (ISO 문자열). */
  viewMonthISO: string;
  /** 선택된 이벤트 id (있으면). */
  selectedEventId?: string;
};

type LoadState = "loading" | "ready" | "error" | "unauthenticated";

/**
 * 캘린더 데이터 fetcher.
 *
 * - server component 인 page.tsx 는 searchParams 파싱만 책임.
 * - 이 client 컴포넌트가 mount 후 인증 토큰 + workspaceId 잡고 events fetch.
 * - listCalendarEvents 는 60 일 cap 이 있어 viewMonth 기준 ±일주일로 범위 잡음.
 */
export function CalendarLoader({
  viewMonthISO,
  selectedEventId,
}: CalendarLoaderProps) {
  // 렌더에 쓸 viewMonth — viewMonthISO 가 바뀌면 자연스럽게 재생성.
  const viewMonth = new Date(viewMonthISO);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<ReadonlyArray<CalendarEvent>>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    // viewMonth 는 viewMonthISO 로부터 effect 안에서 파생 — deps 누락 경고 회피.
    const viewMonth = new Date(viewMonthISO);

    async function load() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (!cancelled) setLoadState("unauthenticated");
        return;
      }

      try {
        // 1) 현재 사용자의 첫 워크스페이스 id 잡기.
        //    TODO(workspace-context): 다중 워크스페이스 전환 UI 도입 시 컨텍스트로 교체.
        const workspaces = await getWorkspacesApi(accessToken);
        if (cancelled) return;
        if (workspaces.length === 0) {
          setLoadState("error");
          setLoadError("속한 워크스페이스가 없습니다.");
          return;
        }
        const workspaceId = workspaces[0].id;

        // 2) viewMonth 기준 6주(±1주) 범위 events fetch.
        const { from, to } = computeRange(viewMonth);

        // 3) 선택된 이벤트는 별도 endpoint 로 (만료/삭제된 id 시 null).
        const [list, picked] = await Promise.all([
          listCalendarEvents(accessToken, { workspaceId, from, to }),
          selectedEventId
            ? getCalendarEventById(accessToken, workspaceId, selectedEventId)
            : Promise.resolve(null),
        ]);

        if (cancelled) return;
        setEvents(list);
        setSelectedEvent(picked ?? undefined);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "캘린더를 불러오지 못했습니다.",
        );
        setLoadState("error");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // viewMonthISO·selectedEventId 가 바뀌면 재요청.
  }, [viewMonthISO, selectedEventId]);

  if (loadState === "unauthenticated") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-fg-tertiary">
          로그인이 필요합니다. 로그인 페이지로 이동해주세요.
        </p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-priority-p1">
          {loadError ?? "캘린더를 불러오지 못했습니다."}
        </p>
      </div>
    );
  }

  // loading 상태에서도 빈 그리드를 보여줌 → 깜빡임 최소화, 헤더는 즉시 노출.
  return (
    <CalendarView
      viewMonth={viewMonth}
      events={events}
      selectedEvent={selectedEvent}
    />
  );
}

/**
 * 월 그리드는 6주 표시이므로 ±일주일 여유로 시간 범위를 잡는다.
 * BE 의 60일 cap 안에 들어와야 함 — 한 달 + 양쪽 여유 = 약 6주.
 */
function computeRange(viewMonth: Date): { from: string; to: string } {
  const from = addMonths(viewMonth, 0);
  from.setDate(1);
  from.setDate(from.getDate() - 7); // 첫 주 일요일이 이전 달일 수 있음

  const to = addMonths(viewMonth, 1);
  to.setDate(7); // 다음 달 첫 주까지 포함

  return { from: from.toISOString(), to: to.toISOString() };
}
