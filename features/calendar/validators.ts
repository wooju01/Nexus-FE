/**
 * 캘린더 New Event 폼 검증.
 * features/auth/validators.ts 패턴.
 *
 * BE 의 `CreateEventDto` 검증과 정합성을 맞춤:
 *   - title          1~200자
 *   - startAt, endAt 필수, endAt > startAt
 *   - description    최대 2000자
 *   - location       최대 200자
 *   - color          최대 40자
 *
 * 시각은 form 에서 `datetime-local` 위젯이 주는 "YYYY-MM-DDTHH:mm" 문자열 기준.
 * BE 에는 ISO 8601 로 변환해서 보낸다 (`toISOString()`).
 */

import type { ValidationErrors } from "@/features/auth/validators";
import { hasErrors } from "@/features/auth/validators";

export { hasErrors };

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 2000;
const LOCATION_MAX = 200;

export type NewEventInput = {
  title: string;
  /** datetime-local 위젯의 raw 값 ("YYYY-MM-DDTHH:mm") 또는 "YYYY-MM-DD" (allDay 일 때) */
  startAt: string;
  endAt: string;
  allDay: boolean;
  description: string;
  location: string;
  /**
   * 참가자로 추가할 사용자 id 배열 (작성자 본인 제외).
   * BE 가 dedupe + ACCEPTED 로 작성자 자동 포함하므로 본인 id 는 굳이 넣지 않아도 됨.
   */
  participantIds: string[];
};

export function validateNewEvent(
  input: NewEventInput,
): ValidationErrors<NewEventInput> {
  const errors: ValidationErrors<NewEventInput> = {};

  // ─ title ─
  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    errors.title = "제목을 입력해주세요.";
  } else if (trimmedTitle.length > TITLE_MAX) {
    errors.title = `제목은 ${TITLE_MAX}자 이내로 입력해주세요.`;
  }

  // ─ startAt / endAt ─
  if (!input.startAt) {
    errors.startAt = "시작 시간을 입력해주세요.";
  }
  if (!input.endAt) {
    errors.endAt = "종료 시간을 입력해주세요.";
  }

  if (input.startAt && input.endAt) {
    const start = new Date(input.startAt);
    const end = new Date(input.endAt);
    if (Number.isNaN(start.getTime())) {
      errors.startAt = "올바른 시작 시간이 아닙니다.";
    } else if (Number.isNaN(end.getTime())) {
      errors.endAt = "올바른 종료 시간이 아닙니다.";
    } else if (input.allDay) {
      // 종일 이벤트는 위젯 값이 "YYYY-MM-DD" (자정 == 자정 가능) — 같은 날짜 허용.
      // 단 종료가 시작보다 이전이면 거부. 자정 보정은 toIsoRange 가 +1일로 처리.
      if (end.getTime() < start.getTime()) {
        errors.endAt = "종료 날짜는 시작 날짜보다 빠를 수 없습니다.";
      }
    } else if (end.getTime() <= start.getTime()) {
      errors.endAt = "종료 시간은 시작 시간보다 늦어야 합니다.";
    }
  }

  // ─ description ─
  if (input.description.length > DESCRIPTION_MAX) {
    errors.description = `설명은 ${DESCRIPTION_MAX}자 이내로 입력해주세요.`;
  }

  // ─ location ─
  if (input.location.length > LOCATION_MAX) {
    errors.location = `위치는 ${LOCATION_MAX}자 이내로 입력해주세요.`;
  }

  return errors;
}

/**
 * datetime-local / date 위젯 값을 ISO 8601 (UTC) 로 변환.
 * - allDay=false: "YYYY-MM-DDTHH:mm" → Date → toISOString()
 * - allDay=true:  "YYYY-MM-DD"        → 그 날의 자정~다음날 자정으로 매핑
 *
 * datetime-local 은 로컬 타임존 기준 문자열을 주므로 `new Date(...)` 가 자동으로
 * 로컬 → UTC 변환을 해준다.
 */
export function toIsoRange(input: NewEventInput): {
  startAt: string;
  endAt: string;
} {
  if (input.allDay) {
    // "YYYY-MM-DD" 값이라 가정. 로컬 자정 기준.
    const startLocal = new Date(`${input.startAt}T00:00:00`);
    const endLocal = new Date(`${input.endAt}T00:00:00`);
    // 종일 이벤트: 종료일 자정 다음날(=다음날 자정)까지 점유하도록 +1일.
    endLocal.setDate(endLocal.getDate() + 1);
    return {
      startAt: startLocal.toISOString(),
      endAt: endLocal.toISOString(),
    };
  }

  return {
    startAt: new Date(input.startAt).toISOString(),
    endAt: new Date(input.endAt).toISOString(),
  };
}
