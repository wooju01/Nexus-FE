import { cn } from "@/lib/utils/cn";
import type { LabelColor } from "@/types/domain";

type LabelPillProps = {
  label: string;
  color: LabelColor;
  className?: string;
};

const LABEL_CLASSES: Record<LabelColor, string> = {
  purple: "bg-purple-500/20 text-purple-300",
  blue: "bg-sky-500/20 text-sky-300",
  green: "bg-emerald-500/20 text-emerald-300",
  red: "bg-red-500/20 text-red-300",
  yellow: "bg-amber-500/20 text-amber-300",
};

/**
 * Task 라벨 칩.
 * 컬러 매핑은 디자인 토큰 SSOT 규칙에 따라 이 파일에서만 정의한다.
 */
export function LabelPill({ label, color, className }: LabelPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        LABEL_CLASSES[color],
        className,
      )}
    >
      {label}
    </span>
  );
}
