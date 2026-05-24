"use client";

import { useRouter } from "next/navigation";

import { getAccessToken } from "@/lib/auth/tokens";
import {
  markAsReadApi,
  markAllAsReadApi,
  type Notification,
} from "@/lib/api/notification";
import { cn } from "@/lib/utils/cn";

const TYPE_LABEL: Record<string, string> = {
  DM_RECEIVED: "DM",
  MESSAGE_MENTION: "멘션",
  TASK_ASSIGNED: "태스크",
  TASK_COMMENTED: "댓글",
  CHANNEL_INVITED: "채널 초대",
  WORKSPACE_INVITED: "워크스페이스 초대",
  EVENT_UPCOMING: "일정",
  EVENT_INVITED: "일정 초대",
  TASK_DUE_SOON: "마감 임박",
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

type NotificationPanelProps = {
  notifications: Notification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onClose: () => void;
};

export function NotificationPanel({
  notifications,
  onRead,
  onReadAll,
  onClose,
}: NotificationPanelProps) {
  const router = useRouter();

  async function handleClick(n: Notification) {
    if (!n.isRead) {
      const token = getAccessToken();
      if (token) {
        await markAsReadApi(token, n.id).catch(console.error);
        onRead(n.id);
      }
    }
    if (n.linkUrl) {
      router.push(n.linkUrl);
    }
    onClose();
  }

  async function handleReadAll() {
    const token = getAccessToken();
    if (token) {
      await markAllAsReadApi(token).catch(console.error);
      onReadAll();
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border-subtle bg-surface-base shadow-2xl">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">알림</h2>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleReadAll}
            className="text-xs text-accent hover:underline"
          >
            모두 읽음
          </button>
        ) : null}
      </div>

      <ul className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <li className="py-10 text-center text-sm text-fg-tertiary">
            알림이 없어요.
          </li>
        ) : (
          notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated",
                  !n.isRead && "bg-accent/5",
                )}
              >
                {!n.isRead ? (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                ) : (
                  <span className="mt-1.5 size-2 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-fg-primary">
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-fg-tertiary">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-fg-secondary">
                    {n.body}
                  </p>
                  <span className="mt-1 inline-block rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] text-fg-tertiary">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
