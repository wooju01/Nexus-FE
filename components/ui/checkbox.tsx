import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId } from "react";

import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  hasError?: boolean;
};

/**
 * 기본 체크박스. 브라우저 기본 스타일을 유지하되 accent-color로 토큰 반영.
 * 커스텀 SVG 체크박스는 후속 과제(디자인 시스템 v3)로 분리.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ id, label, hasError, className, ...rest }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "mt-0.5 size-4 shrink-0 rounded-sm border cursor-pointer",
            "accent-accent",
            hasError ? "border-priority-p1" : "border-border-default",
            className,
          )}
          aria-invalid={hasError || undefined}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className="text-sm text-fg-secondary leading-5 cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    );
  },
);
