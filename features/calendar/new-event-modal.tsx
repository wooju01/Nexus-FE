"use client";

import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/lib/api/calendar";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  hasErrors,
  toIsoRange,
  validateNewEvent,
  type NewEventInput,
} from "@/features/calendar/validators";
import { ParticipantsSelector } from "@/features/calendar/participants-selector";

import type { ValidationErrors } from "@/features/auth/validators";
import type { CalendarEvent } from "@/types/domain";

type NewEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  /**
   * 편집 대상 이벤트. 있으면 update 모드, 없으면 create 모드.
   * 폼은 isOpen 이 false → true 로 바뀔 때 이 값을 기반으로 재초기화.
   */
  editingEvent?: CalendarEvent;
  /** 생성 또는 수정이 성공하면 호출. 호출 측이 events 리스트를 갱신. */
  onSubmitted: (event: CalendarEvent, mode: "create" | "update") => void;
  /** 생성 모드일 때 기본 시작 시각 (월 그리드 셀 클릭 등). 미지정 시 다음 정시. */
  defaultStartAt?: string;
};

/**
 * 캘린더 이벤트 생성/수정 모달.
 *
 * `editingEvent` 가 있으면 update 모드 — 초기값 prefill + PATCH 호출.
 * 없으면 create 모드 — defaultStartAt 기준 + POST 호출.
 *
 * datetime-local 위젯은 로컬 타임존 기준 문자열을 다룸 → 제출 시 ISO 8601 (UTC) 로 변환.
 * 종일(allDay) 체크 시 date 위젯으로 토글, 종료일 자정 다음날까지 점유하도록 +1일 매핑.
 */
export function NewEventModal({
  isOpen,
  onClose,
  workspaceId,
  editingEvent,
  onSubmitted,
  defaultStartAt,
}: NewEventModalProps) {
  const mode: "create" | "update" = editingEvent ? "update" : "create";

  // 호출 측(Loader) 이 모달을 mount/unmount 로 토글하므로
  // useState lazy initializer 만으로 매번 새 초기값으로 시작 — useEffect 불필요.
  const [values, setValues] = useState<NewEventInput>(() =>
    buildValues(editingEvent, defaultStartAt),
  );
  const [errors, setErrors] = useState<ValidationErrors<NewEventInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleChange<K extends keyof NewEventInput>(
    key: K,
    value: NewEventInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (serverError) setServerError(null);
  }

  /**
   * 종일 토글 시 시작/종료 값을 위젯 포맷에 맞게 자동 변환.
   * - false → true: datetime "YYYY-MM-DDTHH:mm" 에서 시간 부분 잘라 "YYYY-MM-DD"
   * - true → false: "YYYY-MM-DD" 에 기본 시간 (09:00 시작, 10:00 종료) 부여
   * 빈 값이거나 잘못된 형식이면 오늘 날짜로 폴백.
   */
  function handleAllDayChange(nextAllDay: boolean) {
    setValues((prev) => {
      const today = todayDateString();
      const startDate = pickDatePart(prev.startAt) || today;
      const endDateRaw = pickDatePart(prev.endAt) || startDate;
      // 종료가 시작보다 이전이면 시작과 동일하게 보정.
      const endDate = endDateRaw >= startDate ? endDateRaw : startDate;

      if (nextAllDay) {
        return {
          ...prev,
          allDay: true,
          startAt: startDate,
          endAt: endDate,
        };
      }
      return {
        ...prev,
        allDay: false,
        startAt: `${startDate}T09:00`,
        endAt: `${endDate}T10:00`,
      };
    });
    // 시간/날짜 에러는 새 포맷에서 다시 검증되므로 미리 비움.
    if (errors.startAt || errors.endAt) {
      setErrors((prev) => ({
        ...prev,
        startAt: undefined,
        endAt: undefined,
      }));
    }
    if (serverError) setServerError(null);
  }

  function handleClose() {
    setErrors({});
    setServerError(null);
    setIsSubmitting(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validateNewEvent(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      setServerError("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      const { startAt, endAt } = toIsoRange(values);
      const payload = {
        title: values.title.trim(),
        startAt,
        endAt,
        allDay: values.allDay,
        description: values.description.trim() || undefined,
        location: values.location.trim() || undefined,
        participantIds:
          values.participantIds.length > 0 ? values.participantIds : undefined,
      };

      const saved =
        mode === "update" && editingEvent
          ? await updateCalendarEvent(
              accessToken,
              workspaceId,
              editingEvent.id,
              payload,
            )
          : await createCalendarEvent(accessToken, workspaceId, payload);

      onSubmitted(saved, mode);
      handleClose();
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : mode === "update"
            ? "이벤트 수정 중 오류가 발생했습니다."
            : "이벤트 생성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = mode === "update" ? "이벤트 수정" : "새 이벤트";
  const submitLabel = mode === "update" ? "저장" : "만들기";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 제목 */}
        <div>
          <Label htmlFor="event-title">제목</Label>
          <Input
            id="event-title"
            type="text"
            placeholder="예: 디자인 리뷰"
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
            hasError={Boolean(errors.title)}
            disabled={isSubmitting}
            autoFocus
          />
          <FieldError message={errors.title} />
        </div>

        {/* 종일 토글 */}
        <Checkbox
          id="event-all-day"
          checked={values.allDay}
          onChange={(e) => handleAllDayChange(e.target.checked)}
          disabled={isSubmitting}
          label="종일 이벤트"
        />

        {/* 시작 / 종료 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="event-start">시작</Label>
            <Input
              id="event-start"
              type={values.allDay ? "date" : "datetime-local"}
              value={values.startAt}
              onChange={(e) => handleChange("startAt", e.target.value)}
              hasError={Boolean(errors.startAt)}
              disabled={isSubmitting}
            />
            <FieldError message={errors.startAt} />
          </div>
          <div>
            <Label htmlFor="event-end">종료</Label>
            <Input
              id="event-end"
              type={values.allDay ? "date" : "datetime-local"}
              value={values.endAt}
              onChange={(e) => handleChange("endAt", e.target.value)}
              hasError={Boolean(errors.endAt)}
              disabled={isSubmitting}
            />
            <FieldError message={errors.endAt} />
          </div>
        </div>

        {/* 위치 */}
        <div>
          <Label htmlFor="event-location">위치 (선택)</Label>
          <Input
            id="event-location"
            type="text"
            placeholder="예: 회의실 A · Zoom · 카페"
            value={values.location}
            onChange={(e) => handleChange("location", e.target.value)}
            hasError={Boolean(errors.location)}
            disabled={isSubmitting}
          />
          <FieldError message={errors.location} />
        </div>

        {/* 참가자 */}
        <div>
          <Label htmlFor="event-participants">참가자 (선택)</Label>
          <ParticipantsSelector
            workspaceId={workspaceId}
            value={values.participantIds}
            onChange={(ids) => handleChange("participantIds", ids)}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-[11px] text-fg-tertiary">
            본인은 자동으로 참석으로 추가됩니다.
          </p>
        </div>

        {/* 설명 */}
        <div>
          <Label htmlFor="event-description">설명 (선택)</Label>
          <textarea
            id="event-description"
            rows={3}
            placeholder="이벤트 메모, 안건, 참고 링크 등"
            value={values.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isSubmitting}
            className={
              "w-full rounded-lg border bg-surface-elevated px-3 py-2 text-sm " +
              "text-fg-primary placeholder:text-fg-tertiary outline-none transition-colors " +
              "disabled:cursor-not-allowed disabled:opacity-50 " +
              (errors.description
                ? "border-priority-p1 focus:border-priority-p1"
                : "border-border-default focus:border-accent")
            }
          />
          <FieldError message={errors.description} />
        </div>

        {serverError ? (
          <p role="alert" className="text-sm text-priority-p1">
            {serverError}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- helpers ----------

/**
 * 모달 초기값 빌더.
 * - editingEvent 있으면: 그 이벤트의 값으로 prefill
 * - 없으면 defaultStartAt 또는 다음 정시 기준 1시간 짜리
 */
function buildValues(
  editingEvent: CalendarEvent | undefined,
  defaultStartAt: string | undefined,
): NewEventInput {
  if (editingEvent) {
    return {
      title: editingEvent.title,
      startAt: toInputValue(new Date(editingEvent.startAt), editingEvent.allDay),
      endAt: toInputValue(
        // 종일 이벤트는 BE 에 [자정, 다음날 자정) 으로 저장되므로 위젯엔 -1일 보정.
        editingEvent.allDay
          ? new Date(new Date(editingEvent.endAt).getTime() - 24 * 60 * 60 * 1000)
          : new Date(editingEvent.endAt),
        editingEvent.allDay,
      ),
      allDay: editingEvent.allDay,
      description: editingEvent.description ?? "",
      location: editingEvent.location ?? "",
      // 기존 참가자는 작성자 포함 — 본인은 BE 가 어차피 자동 포함하지만,
      // 셀렉터에서 currentUserId 모르는 상태라 그대로 전달 (BE dedupe 신뢰).
      participantIds: editingEvent.participants.map((p) => p.userId),
    };
  }

  const start = defaultStartAt ? new Date(defaultStartAt) : roundUpHour(new Date());
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    title: "",
    startAt: toInputValue(start, false),
    endAt: toInputValue(end, false),
    allDay: false,
    description: "",
    location: "",
    participantIds: [],
  };
}

/**
 * datetime-local ("YYYY-MM-DDTHH:mm") 또는 date ("YYYY-MM-DD") 문자열에서
 * 날짜 부분(앞 10자) 만 추출. 빈 값이거나 길이 부족하면 "" 반환.
 */
function pickDatePart(s: string): string {
  if (typeof s !== "string") return "";
  return s.length >= 10 ? s.slice(0, 10) : "";
}

/** 오늘 로컬 날짜 "YYYY-MM-DD". */
function todayDateString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function roundUpHour(d: Date): Date {
  const r = new Date(d);
  r.setMinutes(0, 0, 0);
  if (d.getMinutes() > 0 || d.getSeconds() > 0) {
    r.setHours(r.getHours() + 1);
  }
  return r;
}

/**
 * Date → datetime-local/date 위젯 입력 문자열 (로컬 타임존 기준).
 * - allDay false: "YYYY-MM-DDTHH:mm"
 * - allDay true:  "YYYY-MM-DD"
 */
function toInputValue(d: Date, allDay: boolean): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (allDay) return date;
  return `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
