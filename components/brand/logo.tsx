import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
};

/**
 * Nexus Wordmark.
 * 정식 브랜드 아이덴티티 확정 전까지 타이포만 노출한다.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      aria-label="Nexus"
      className={cn(
        "text-lg font-semibold tracking-tight text-fg-primary",
        className,
      )}
    >
      Nexus
    </span>
  );
}
