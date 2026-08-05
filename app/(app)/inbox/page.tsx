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
import { acceptInvitation } from "@/lib/api/invitations";
import { getWorkspacesApi } from "@/lib/api/workspace";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { useAppShell } from "@/components/app-shell/app-shell-context";
import { getSocket } from "@/lib/ws/client";
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
  { label: "초대", value: "WORKSPACE_INVITED" },
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
  const { addWorkspace, switchWorkspace } = useWorkspace();
  const { setInboxUnreadCount } = useAppShell();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationType | "ALL">("ALL");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getNotificationsApi()
      .then((data) => {
        setNotifications(data.items);
        setInboxUnreadCount(data.items.filter((n) => !n.isRead).length);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [setInboxUnreadCount]);

  // 인박스 페이지가 열려있는 동안 실시간으로 새 알림을 목록 상단에 추가
  useEffect(() => {
    const socket = getSocket();
    function handleNew(notification: Notification) {
      setNotifications((prev) => [notification, ...prev]);
      // AppShellContext가 이미 뱃지 +1을 처리하므로 여기선 count를 건드리지 않음
    }
    socket.on("notification.created", handleNew);
    return () => {
      socket.off("notification.created", handleNew);
    };
  }, []);

  function updateNotifications(updated: Notification[]) {
    setNotifications(updated);
    setInboxUnreadCount(updated.filter((n) => !n.isRead).length);
  }

  async function handleClick(n: Notification) {
    if (!n.isRead) {
      await markAsReadApi(n.id).catch(console.error);
      window.dispatchEvent(new CustomEvent("nexus:notification-read", { detail: { id: n.id } }));
      updateNotifications(
        notifications.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
    }
    if (n.type === "DM_RECEIVED" && n.linkUrl) {
      const channelId = n.linkUrl.split("/channels/")[1];
      if (channelId) {
        window.dispatchEvent(new CustomEvent("nexus:dm-created", { detail: { dmId: channelId } }));
      }
    }
    if (n.linkUrl) router.push(n.linkUrl);
  }

  async function handleReadAll() {
    await markAllAsReadApi().catch(console.error);
    window.dispatchEvent(new CustomEvent("nexus:notification-read-all"));
    updateNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  }

  async function handleAccept(n: Notification) {
    const meta = n.metadata as { invitationToken?: string } | null;
    if (!meta?.invitationToken) return;

    setAcceptingIds((prev) => new Set(prev).add(n.id));
    try {
      const { workspaceId } = await acceptInvitation(meta.invitationToken);
      await markAsReadApi(n.id).catch(console.error);
      updateNotifications(
        notifications.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );

      const workspaces = await getWorkspacesApi("");
      const joined = workspaces.find((w) => w.id === workspaceId);
      if (joined) {
        addWorkspace(joined);
        switchWorkspace(joined);
      }
      router.push("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "수락 중 오류가 발생했습니다.");
    } finally {
      setAcceptingIds((prev) => {
        const next = new Set(prev);
        next.delete(n.id);
        return next;
      });
    }
  }

  async function handleDecline(n: Notification) {
    await markAsReadApi(n.id).catch(console.error);
    updateNotifications(
      notifications.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
    );
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
      <div className="mb-4 flex gap-1 border-b border-border-subtle">
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
              <div
                className={cn(
                  "flex gap-4 px-2 py-4 rounded-lg",
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

                  {/* 워크스페이스 초대 수락/거절 */}
                  {n.type === "WORKSPACE_INVITED" && !n.isRead && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(n)}
                        disabled={acceptingIds.has(n.id)}
                        className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-60 hover:opacity-90"
                      >
                        {acceptingIds.has(n.id) ? "처리 중..." : "수락"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(n)}
                        className="rounded-lg border border-border-subtle px-4 py-1.5 text-sm text-fg-secondary hover:bg-surface-elevated"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {/* 일반 알림 링크 */}
                  {n.type !== "WORKSPACE_INVITED" && n.linkUrl && (
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      바로 가기 →
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
