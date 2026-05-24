import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

/**
 * 접근성을 위해 forwardRef 사용. 폼 라이브러리(react-hook-form) 도입 후 register를 바로 스프레드 가능.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hasError = false, className, type = "text", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full h-10 px-3 rounded-lg text-sm",
        "bg-surface-elevated text-fg-primary placeholder:text-fg-tertiary",
        "border transition-colors outline-none",
        hasError
          ? "border-priority-p1 focus:border-priority-p1"
          : "border-border-default focus:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  );
});
