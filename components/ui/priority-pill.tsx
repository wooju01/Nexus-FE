import { cn } from "@/lib/utils/cn";
import type { Priority } from "@/types/domain";

type PriorityPillProps = {
  priority: Priority;
  className?: string;
};

const PRIORITY_CLASSES: Record<Priority, string> = {
  // 좌측에 얇은 색 인디케이터만 표시하는 Linear-style 라벨.
  P1: "bg-priority-p1/15 text-priority-p1 before:bg-priority-p1",
  P2: "bg-priority-p2/15 text-priority-p2 before:bg-priority-p2",
  P3: "bg-priority-p3/15 text-priority-p3 before:bg-priority-p3",
};

export function PriorityPill({ priority, className }: PriorityPillProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        "before:content-[''] before:block before:h-3 before:w-0.5 before:rounded-full",
        PRIORITY_CLASSES[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
