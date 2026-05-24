import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-fg-secondary mb-1.5",
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
