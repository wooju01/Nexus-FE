"use client";

import { useEffect, useRef, useState } from "react";
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
import { getAccessToken } from "@/lib/auth/tokens";
import {
  getNotificationsApi,
  countUnreadApi,
  type Notification,
} from "@/lib/api/notification";
import { getSocket } from "@/lib/ws/client";
import { NotificationPanel } from "@/features/notification/notification-panel";
import type { Presence } from "@/types/domain";

const STATUS_MAP: Record<string, Presence> = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
};

export function TopBar() {
  const { user, isLoading } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 초기 미읽음 카운트 fetch
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    countUnreadApi(token)
      .then((r) => setUnreadCount(r.count))
      .catch(console.error);
  }, []);

  // 실시간 알림 수신
  useEffect(() => {
    const socket = getSocket();

    function onNotificationCreated(notification: Notification) {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    }

    socket.on("notification.created", onNotificationCreated);
    return () => {
      socket.off("notification.created", onNotificationCreated);
    };
  }, []);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !bellRef.current?.contains(e.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleBellClick() {
    if (!isPanelOpen && notifications.length === 0) {
      const token = getAccessToken();
      if (token) {
        const data = await getNotificationsApi(token).catch(() => null);
        if (data) setNotifications(data.items);
      }
    }
    setIsPanelOpen((prev) => !prev);
  }

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  function handleReadAll() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

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

        {/* 알림 벨 */}
        <div className="relative">
          <button
            ref={bellRef}
            type="button"
            aria-label={`알림${unreadCount > 0 ? ` ${unreadCount}건` : ""}`}
            onClick={handleBellClick}
            className="relative flex size-9 items-center justify-center rounded-lg text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-priority-p1 text-[10px] font-semibold text-white"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>

          {isPanelOpen ? (
            <div ref={panelRef}>
              <NotificationPanel
                notifications={notifications}
                onRead={handleRead}
                onReadAll={handleReadAll}
                onClose={() => setIsPanelOpen(false)}
              />
            </div>
          ) : null}
        </div>

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
