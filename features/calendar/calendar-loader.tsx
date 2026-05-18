"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CalendarView } from "./calendar-view";
import { NewEventModal } from "./new-event-modal";
import {
  deleteCalendarEvent,
  listCalendarEvents,
  getCalendarEventById,
} from "@/lib/api/calendar";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { getAccessToken } from "@/lib/auth/tokens";
import { addMonths, toDateKey } from "./calendar-utils";

import type { CalendarEvent } from "@/types/domain";

type CalendarLoaderProps = {
  /** server 에서 파싱한 현재 보고 있는 달 (ISO 문자열). */
  viewMonthISO: string;
  /** 선택된 이벤트 id (있으면). */
  selectedEventId?: string;
};

type LoadState = "loading" | "ready" | "error" | "unauthenticated";

/**
 * 캘린더 데이터 fetcher + 생성/수정 모달 컨테이너 + 삭제 핸들러.
 *
 * - server component 인 page.tsx 는 searchParams 파싱만 책임.
 * - 이 client 컴포넌트가 mount 후 인증 토큰 + workspaceId 잡고 events fetch.
 * - 모달은 두 모드:
 *     editingEvent === undefined → 생성 모드 ("새 이벤트")
 *     editingEvent === <event>   → 수정 모드 ("이벤트 수정")
 * - 삭제는 confirm 후 BE 호출 + events 리스트에서 제거 + URL 의 ?event= 정리.
 */
export function CalendarLoader({
  viewMonthISO,
  selectedEventId,
}: CalendarLoaderProps) {
  const router = useRouter();

  // 렌더에 쓸 viewMonth.
  const viewMonth = new Date(viewMonthISO);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [events, setEvents] = useState<ReadonlyArray<CalendarEvent>>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // 모달 state.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 편집 대상 이벤트. 있으면 modal 이 update 모드.
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    const month = new Date(viewMonthISO);

    async function load() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (!cancelled) setLoadState("unauthenticated");
        return;
      }

      try {
        // 1) 현재 사용자의 첫 워크스페이스 id 잡기.
        const workspaces = await getWorkspacesApi(accessToken);
        if (cancelled) return;
        if (workspaces.length === 0) {
          setLoadState("error");
          setLoadError("속한 워크스페이스가 없습니다.");
          return;
        }
        const wsId = workspaces[0].id;
        setWorkspaceId(wsId);

        // 2) viewMonth 기준 6주(±1주) 범위 events fetch.
        const { from, to } = computeRange(month);

        // 3) 선택된 이벤트는 별도 endpoint 로 (만료/삭제된 id 시 null).
        const [list, picked] = await Promise.all([
          listCalendarEvents(accessToken, { workspaceId: wsId, from, to }),
          selectedEventId
            ? getCalendarEventById(accessToken, wsId, selectedEventId)
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
  }, [viewMonthISO, selectedEventId]);

  /**
   * 생성/수정 모달 submit 성공 콜백.
   * - create: events 에 끼워 넣음
   * - update: 같은 id 의 row 를 교체. 우측 패널도 갱신.
   */
  function handleSubmitted(event: CalendarEvent, mode: "create" | "update") {
    if (mode === "create") {
      setEvents((prev) => [...prev, event]);
      return;
    }
    setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)));
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(event);
    }
  }

  /**
   * 이벤트 삭제. confirm 은 패널 컴포넌트에서.
   * 성공 시 events 에서 제거 + URL ?event= 쿼리 정리.
   */
  async function handleDeleteEvent(event: CalendarEvent) {
    const accessToken = getAccessToken();
    if (!accessToken || !workspaceId) {
      throw new Error("인증 정보가 없습니다.");
    }
    await deleteCalendarEvent(accessToken, workspaceId, event.id);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    if (selectedEvent?.id === event.id) {
      setSelectedEvent(undefined);
      // ?event=<삭제된id> 가 URL 에 남아있으면 다음 로드 시 또 잡혀버리므로 정리.
      router.replace(`/calendar?date=${toDateKey(viewMonth)}`, { scroll: false });
    }
  }

  function openCreateModal() {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  }

  function openEditModal(event: CalendarEvent) {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    // 모달 닫힐 때 editingEvent 즉시 비우면 닫히는 애니메이션 중에 form 이 깜빡일 수 있어 유지.
    // 다음 열림 때 useEffect 가 editingEvent 기반으로 재초기화.
  }

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

  const canCreate = loadState === "ready" && workspaceId !== null;

  return (
    <>
      <CalendarView
        viewMonth={viewMonth}
        events={events}
        selectedEvent={selectedEvent}
        canCreate={canCreate}
        onNewEvent={openCreateModal}
        onEditEvent={openEditModal}
        onDeleteEvent={handleDeleteEvent}
      />
      {/*
        모달은 열릴 때만 mount → useState initializer 가 매번 초기값을 다시 만들어
        editingEvent 변경 시 폼이 깔끔하게 reset 됨 (useEffect 안에서 setState 회피).
      */}
      {workspaceId && isModalOpen ? (
        <NewEventModal
          isOpen
          onClose={closeModal}
          workspaceId={workspaceId}
          editingEvent={editingEvent}
          onSubmitted={handleSubmitted}
        />
      ) : null}
    </>
  );
}

/**
 * 월 그리드는 6주 표시이므로 ±일주일 여유로 시간 범위를 잡는다.
 * BE 의 60일 cap 안에 들어와야 함 — 한 달 + 양쪽 여유 = 약 6주.
 */
function computeRange(viewMonth: Date): { from: string; to: string } {
  const from = addMonths(viewMonth, 0);
  from.setDate(1);
  from.setDate(from.getDate() - 7);

  const to = addMonths(viewMonth, 1);
  to.setDate(7);

  return { from: from.toISOString(), to: to.toISOString() };
}
