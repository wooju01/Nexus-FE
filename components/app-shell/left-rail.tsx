"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import {
  BoardIcon,
  DocsIcon,
  HomeIcon,
  InboxIcon,
  MessagesIcon,
  PeopleIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

type RailItem = {
  label: string;
  href?: string; // 없으면 비활성(미구현)
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** 활성 여부를 판단하는 prefix. href가 없으면 무시. */
  activePrefix?: string;
};

const RAIL_ITEMS: ReadonlyArray<RailItem> = [
  {
    label: "Home",
    href: "/dashboard",
    icon: HomeIcon,
    activePrefix: "/dashboard",
  },
  { label: "Inbox", icon: InboxIcon },
  { label: "Messages", icon: MessagesIcon },
  {
    label: "Boards",
    href: "/projects/launch-q2",
    icon: BoardIcon,
    activePrefix: "/projects",
  },
  { label: "Docs", icon: DocsIcon },
  {
    label: "People",
    href: "/settings/profile",
    icon: PeopleIcon,
    activePrefix: "/settings",
  },
];

/**
 * 글로벌 네비게이션 레일 (좌측 최외곽).
 * 미구현 항목은 비활성 버튼으로 렌더 — 후속 구현 시 href만 주면 자동 링크화된다.
 */
export function LeftRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="글로벌 네비게이션"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-subtle bg-surface-subtle py-3"
    >
      {RAIL_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = Boolean(
          item.activePrefix && pathname.startsWith(item.activePrefix),
        );

        if (!item.href) {
          return (
            <button
              key={item.label}
              type="button"
              disabled
              aria-label={`${item.label} (준비 중)`}
              title={`${item.label} — 준비 중`}
              className="flex size-10 items-center justify-center rounded-lg text-fg-tertiary/60 disabled:cursor-not-allowed"
            >
              <IconComponent />
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-surface-overlay text-fg-primary"
                : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
            )}
          >
            <IconComponent />
          </Link>
        );
      })}
    </nav>
  );
}
