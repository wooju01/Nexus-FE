import Link from "next/link";

import { PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

import { CountPill } from "./sidebar-badges";

/**
 * 사이드바 내비게이션 구성요소.
 * - SidebarLink: 개인 섹션(Home/Inbox/My tasks 등) 링크/버튼 단일 행.
 *   · href 없거나 disabled면 `<button disabled>` 렌더 (준비 중 tooltip).
 *   · 활성 상태면 surface-overlay 배경으로 강조.
 *   · 숫자 뱃지는 호출측이 `> 0`만 넘기도록 기대.
 * - SidebarSection: 카테고리 그룹 (Projects/Channels/Direct Messages) 제목 + 액션 버튼 + 리스트 컨테이너.
 */

type SidebarLinkProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  badge?: number;
  badgeTone?: "default" | "accent";
  disabled?: boolean;
};

export function SidebarLink({
  label,
  icon,
  href,
  isActive,
  badge,
  badgeTone = "default",
  disabled,
}: SidebarLinkProps) {
  const hasBadge = typeof badge === "number" && badge > 0;

  const content = (
    <>
      <span className="flex items-center gap-2">
        <span className="text-fg-tertiary">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {hasBadge ? <CountPill count={badge} tone={badgeTone} /> : null}
    </>
  );

  const baseClass =
    "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors";

  if (!href || disabled) {
    return (
      <li>
        <button
          type="button"
          disabled
          title={`${label} — 준비 중`}
          className={cn(
            baseClass,
            "w-full text-fg-secondary disabled:cursor-not-allowed hover:bg-surface-elevated hover:text-fg-primary",
          )}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          baseClass,
          isActive
            ? "bg-surface-overlay text-fg-primary"
            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
        )}
      >
        {content}
      </Link>
    </li>
  );
}

type SidebarSectionProps = {
  title: string;
  actionLabel: string;
  onAction?: () => void;
  children: React.ReactNode;
};

export function SidebarSection({
  title,
  actionLabel,
  onAction,
  children,
}: SidebarSectionProps) {
  return (
    <section className="mb-4">
      <header className="flex items-center justify-between px-2 pb-1 pt-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
          {title}
        </h3>
        <button
          type="button"
          aria-label={actionLabel}
          title={onAction ? actionLabel : `${actionLabel} — 준비 중`}
          onClick={onAction}
          className="flex size-5 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </header>
      {children}
    </section>
  );
}
