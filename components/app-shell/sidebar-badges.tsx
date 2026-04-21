import { cn } from "@/lib/utils/cn";

/**
 * 사이드바 뱃지 아톰.
 * - CountPill: Inbox/My tasks 같은 네비 항목의 수치 표시 (accent / default 톤).
 * - UnreadBadge: 채널·DM 미확인 수 강조 표시 (항상 accent 톤).
 *
 * 호출 측에서 `count > 0`을 먼저 판별해 넘긴다고 가정.
 */

type CountPillProps = {
  count: number;
  tone: "default" | "accent";
};

export function CountPill({ count, tone }: CountPillProps) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
        tone === "accent"
          ? "bg-accent/20 text-accent"
          : "bg-surface-overlay text-fg-secondary",
      )}
    >
      {count}
    </span>
  );
}

export function UnreadBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
      {count}
    </span>
  );
}
