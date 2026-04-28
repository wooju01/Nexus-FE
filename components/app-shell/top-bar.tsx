"use client";
import Link from "next/link";

import {
  BellIcon,
  CalendarIcon,
  ChevronDownIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/features/auth/user-provider";
import type { Presence } from "@/types/domain";


/**
 * 상단 전역 바.
 * - 워크스페이스 스위처 (cosmetic)
 * - 검색 (⌘K) — 현재는 placeholder input
 * - AI / 알림 / 캘린더 / 현재 사용자
 */
const STATUS_MAP: Record<string, Presence> = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
};

export function TopBar() {
  const { user, isLoading } = useUser();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border-subtle bg-surface-base px-4">
      <Link
        href="/dashboard"
        aria-label="Nexus · Aether Labs 워크스페이스"
        className="flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        <span className="text-fg-primary">Nexus</span>
        <span aria-hidden="true" className="text-fg-tertiary">
          /
        </span>
        <span className="text-fg-primary">Aether Labs</span>
        <ChevronDownIcon className="size-3.5 text-fg-tertiary" />
      </Link>

      <div className="flex flex-1 justify-center">
        <label className="relative flex w-full max-w-xl items-center">
          <SearchIcon className="pointer-events-none absolute left-3 size-4 text-fg-tertiary" />
          <input
            type="search"
            placeholder="Search or jump to..."
            aria-label="검색"
            className="h-9 w-full rounded-lg border border-border-subtle bg-surface-elevated pl-9 pr-16 text-sm text-fg-primary placeholder:text-fg-tertiary outline-none focus:border-accent"
          />
          <kbd className="pointer-events-none absolute right-2 flex items-center gap-0.5 rounded border border-border-subtle bg-surface-overlay px-1.5 py-0.5 text-[10px] text-fg-tertiary">
            ⌘ K
          </kbd>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="AI 어시스트"
          className="flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <SparklesIcon />
        </button>
        <button
          type="button"
          aria-label="알림 3건"
          className="relative flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <BellIcon />
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-priority-p1 text-[10px] font-semibold text-white"
          >
            3
          </span>
        </button>
        <button
          type="button"
          aria-label="캘린더"
          className="flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <CalendarIcon />
        </button>

        <div className="ml-2 flex items-center gap-2 pl-2">
          <Avatar
            initials={user?.name?.slice(0, 2).toUpperCase() ?? "??"}
            color="blue"
            presence={user?.status ? STATUS_MAP[user.status] : undefined}
            size="md"
            name={user?.name ?? ""}
          />
          <span className="text-sm font-medium text-fg-primary">
            {isLoading ? "..." : (user?.name ?? "사용자")}
          </span>
        </div>
      </div>
    </header>
  );
}
