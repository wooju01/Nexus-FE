/**
 * `cn` — 조건부 className 결합 헬퍼.
 *
 * 의도적으로 얇은 구현: clsx + tailwind-merge 도입 전까지의 임시 구현이며,
 * 의존성 설치 후에는 해당 라이브러리로 교체 예정.
 *
 *   import clsx from "clsx";
 *   import { twMerge } from "tailwind-merge";
 *   export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
 *
 * 현재 구현은 falsy 값과 중첩 배열만 정리해 공백 구분 문자열로 반환한다.
 * 동일 속성의 Tailwind 클래스 충돌(예: `p-2 p-4`)은 병합하지 않으므로
 * 호출부에서 중복이 생기지 않도록 주의한다.
 */
export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value) {
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        walk(item);
      }
      return;
    }
    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
    }
  };

  for (const input of inputs) {
    walk(input);
  }

  return classes.join(" ");
}
