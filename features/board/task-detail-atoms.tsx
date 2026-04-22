import { cn } from "@/lib/utils/cn";

/**
 * TaskDetailPane 내부 전용 작은 아톰들.
 * - Row: 속성 그리드의 (dt, dd) 한 줄.
 * - TabButton: 상세 탭 바의 단일 탭.
 * - PaneIconButton: 헤더 오른쪽 편집/더보기 등 아이콘 버튼 (placeholder).
 * 관심사: 레이아웃/스타일만. 상태·로직은 상위에서 주입.
 */

type RowProps = {
  label: string;
  children: React.ReactNode;
};

export function Row({ label, children }: RowProps) {
  return (
    <>
      <dt className="text-xs font-medium uppercase tracking-wide text-fg-tertiary">
        {label}
      </dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

type TabButtonProps = {
  children: React.ReactNode;
  active?: boolean;
};

export function TabButton({ children, active }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active ? "true" : "false"}
      className={cn(
        "relative py-2.5 text-sm transition-colors",
        active
          ? "font-semibold text-fg-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent"
          : "text-fg-secondary hover:text-fg-primary",
      )}
    >
      {children}
    </button>
  );
}

type PaneIconButtonProps = {
  children: React.ReactNode;
  title: string;
};

export function PaneIconButton({ children, title }: PaneIconButtonProps) {
  return (
    <button
      type="button"
      title={`${title} — 준비 중`}
      className="flex size-7 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
    >
      {children}
    </button>
  );
}
