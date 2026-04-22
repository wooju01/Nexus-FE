import { cn } from "@/lib/utils/cn";

type FieldErrorProps = {
  message?: string;
  className?: string;
};

/**
 * 폼 필드 하단에 에러 메시지를 표시.
 * message가 없으면 아무것도 렌더링하지 않는다 (0 falsy 렌더링 버그 방지를 위해 삼항 사용).
 */
export function FieldError({ message, className }: FieldErrorProps) {
  return message ? (
    <p
      role="alert"
      className={cn("mt-1.5 text-xs text-priority-p1", className)}
    >
      {message}
    </p>
  ) : null;
}
