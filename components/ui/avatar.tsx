import { cn } from "@/lib/utils/cn";
import type { AvatarColor, Presence } from "@/types/domain";

type AvatarSize = "xs" | "sm" | "md" | "lg";

type AvatarProps = {
  initials: string;
  color: AvatarColor;
  size?: AvatarSize;
  presence?: Presence;
  className?: string;
  name?: string; // 접근성용 — aria-label에 사용
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-9 text-sm",
};

const COLOR_CLASSES: Record<AvatarColor, string> = {
  blue: "bg-sky-500 text-white",
  purple: "bg-purple-500 text-white",
  green: "bg-emerald-500 text-white",
  pink: "bg-pink-500 text-white",
  orange: "bg-orange-500 text-white",
  yellow: "bg-amber-500 text-black",
  teal: "bg-teal-500 text-white",
};

const PRESENCE_DOT_SIZE: Record<AvatarSize, string> = {
  xs: "size-1.5",
  sm: "size-2",
  md: "size-2.5",
  lg: "size-2.5",
};

const PRESENCE_DOT_COLOR: Partial<Record<Presence, string>> = {
  online: "bg-presence-online", // 초록
  away: "bg-amber-400", // 주황
  dnd: "bg-priority-p1", // 빨강
  // offline은 점 안 보임
};

/**
 * 이니셜 기반 아바타.
 * 이미지 업로드 도입 전까지는 컬러 + 이니셜만 사용.
 */
export function Avatar({
  initials,
  color,
  size = "md",
  presence,
  className,
  name,
}: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        role="img"
        aria-label={name ?? initials}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold",
          SIZE_CLASSES[size],
          COLOR_CLASSES[color],
        )}
      >
        {initials}
      </span>
      {presence && PRESENCE_DOT_COLOR[presence] ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface-base",
            PRESENCE_DOT_SIZE[size],
            PRESENCE_DOT_COLOR[presence],
          )}
        />
      ) : null}
    </span>
  );
}
