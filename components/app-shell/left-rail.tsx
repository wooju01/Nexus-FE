"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { HomeIcon, InboxIcon, PeopleIcon } from "@/components/icons";
import { countUnreadApi } from "@/lib/api/notification";
import { useAppShell } from "./app-shell-context";
import { cn } from "@/lib/utils/cn";

export function LeftRail() {
  const pathname = usePathname();
  const { inboxUnreadCount, setInboxUnreadCount } = useAppShell();

  useEffect(() => {
    countUnreadApi()
      .then(({ count }) => setInboxUnreadCount(count))
      .catch(() => {});
  }, [setInboxUnreadCount]);

  return (
    <nav
      aria-label="글로벌 네비게이션"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border-subtle bg-surface-subtle py-3"
    >
      {/* Home */}
      <Link
        href="/dashboard"
        aria-label="Home"
        aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg transition-colors",
          pathname.startsWith("/dashboard")
            ? "bg-surface-overlay text-fg-primary"
            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
        )}
      >
        <HomeIcon />
      </Link>

      {/* Inbox */}
      <Link
        href="/inbox"
        aria-label="Inbox"
        aria-current={pathname.startsWith("/inbox") ? "page" : undefined}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg transition-colors",
          pathname.startsWith("/inbox")
            ? "bg-surface-overlay text-fg-primary"
            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
        )}
      >
        <InboxIcon />
        {inboxUnreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold leading-none text-white">
            {inboxUnreadCount > 9 ? "9+" : inboxUnreadCount}
          </span>
        )}
      </Link>

      {/* 친구 */}
      <Link
        href="/friends"
        aria-label="친구"
        aria-current={pathname.startsWith("/friends") ? "page" : undefined}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg transition-colors",
          pathname.startsWith("/friends")
            ? "bg-surface-overlay text-fg-primary"
            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
        )}
      >
        <PeopleIcon />
      </Link>
    </nav>
  );
}
