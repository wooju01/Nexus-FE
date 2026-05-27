"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  type Notification,
  type NotificationType,
} from "@/lib/api/notification";
import { getAccessToken } from "@/lib/auth/tokens";
import { cn } from "@/lib/utils/cn";

const TYPE_LABEL: Record<NotificationType, string> = {
  DM_RECEIVED: "DM",
  MESSAGE_MENTION: "멘션",
  TASK_ASSIGNED: "태스크 배정",
  TASK_COMMENTED: "태스크 댓글",
  TASK_DUE_SOON: "마감 임박",
  CHANNEL_INVITED: "채널 초대",
  WORKSPACE_INVITED: "워크스페이스 초대",
  EVENT_UPCOMING: "일정 알림",
  EVENT_INVITED: "일정 초대",
};

const FILTERS: { label: string; value: NotificationType | "ALL" }[] = [
  { label: "전체", value: "ALL" },
  { label: "멘션", value: "MESSAGE_MENTION" },
  { label: "DM", value: "DM_RECEIVED" },
  { label: "태스크", value: "TASK_ASSIGNED" },
  { label: "일정", value: "EVENT_UPCOMING" },
];

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function InboxPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | "ALL">("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getNotificationsApi(token)
      .then((data) => setNotifications(data.items))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleClick(n: Notification) {
    if (!n.isRead) {
      const token = getAccessToken();
      if (token) await markAsReadApi(token, n.id).catch(console.error);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
    }
    if (n.linkUrl) router.push(n.linkUrl);
  }

  async function handleReadAll() {
    const token = getAccessToken();
    if (token) await markAllAsReadApi(token).catch(console.error);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const filtered = notifications.filter((n) => {
    if (showUnreadOnly && n.isRead) return false;
    if (filter !== "ALL" && n.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-fg-primary">Inbox</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-fg-tertiary">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUnreadOnly((v) => !v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              showUnreadOnly
                ? "bg-accent/10 text-accent"
                : "text-fg-secondary hover:bg-surface-elevated",
            )}
          >
            미읽음만
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleReadAll}
              className="text-sm text-accent hover:underline"
            >
              모두 읽음
            </button>
          )}
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="mb-4 flex gap-1 border-b border-border-subtle pb-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              filter === f.value
                ? "border-b-2 border-accent text-accent"
                : "text-fg-tertiary hover:text-fg-primary",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 알림 목록 */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-fg-tertiary">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-fg-tertiary">알림이 없어요.</div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {filtered.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full gap-4 px-2 py-4 text-left transition-colors hover:bg-surface-elevated rounded-lg",
                  !n.isRead && "bg-accent/5",
                )}
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", !n.isRead ? "bg-accent" : "bg-transparent")} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-fg-primary">{n.title}</span>
                    <span className="shrink-0 text-xs text-fg-tertiary">{formatRelative(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-fg-secondary line-clamp-2">{n.body}</p>
                  <span className="mt-2 inline-block rounded-md bg-surface-elevated px-2 py-0.5 text-xs text-fg-tertiary">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
