"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AtSignIcon,
  BellIcon,
  CheckCircleIcon,
  ReplyIcon,
} from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import {
  getNotificationsApi,
  markAsReadApi,
  type Notification,
  type NotificationType,
} from "@/lib/api/notification";
import { cn } from "@/lib/utils/cn";

type TabKey = "all" | "mention" | "assigned" | "other";

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "mention", label: "Mentions" },
  { key: "assigned", label: "Assigned" },
  { key: "other", label: "Other" },
];

const TYPE_LABEL: Record<NotificationType, string> = {
  MESSAGE_MENTION: "Mention",
  DM_RECEIVED: "DM",
  CHANNEL_INVITED: "Invited",
  WORKSPACE_INVITED: "Invited",
  TASK_ASSIGNED: "Assigned",
  TASK_DUE_SOON: "Due soon",
  TASK_COMMENTED: "Comment",
  EVENT_UPCOMING: "Event",
  EVENT_INVITED: "Invited",
};

function tabMatch(n: Notification, tab: TabKey): boolean {
  if (tab === "all") return true;
  if (tab === "mention") return n.type === "MESSAGE_MENTION";
  if (tab === "assigned") return n.type === "TASK_ASSIGNED";
  return !["MESSAGE_MENTION", "TASK_ASSIGNED"].includes(n.type);
}

function NotifIcon({ type }: { type: NotificationType }) {
  const cls = "size-3.5";
  switch (type) {
    case "MESSAGE_MENTION":
      return <AtSignIcon className={cls} />;
    case "TASK_ASSIGNED":
    case "TASK_DUE_SOON":
      return <CheckCircleIcon className={cls} />;
    case "DM_RECEIVED":
    case "TASK_COMMENTED":
      return <ReplyIcon className={cls} />;
    default:
      return <BellIcon className={cls} />;
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export function InboxList() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    getNotificationsApi()
      .then(({ items }) => setNotifications(items.filter((n) => !n.isRead)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 다른 패널/페이지에서 읽음 처리 시 동기화
  useEffect(() => {
    function onRead(e: Event) {
      const { id } = (e as CustomEvent<{ id: string }>).detail;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
    function onReadAll() {
      setNotifications([]);
    }
    window.addEventListener("nexus:notification-read", onRead);
    window.addEventListener("nexus:notification-read-all", onReadAll);
    return () => {
      window.removeEventListener("nexus:notification-read", onRead);
      window.removeEventListener("nexus:notification-read-all", onReadAll);
    };
  }, []);

  async function handleClick(n: Notification) {
    if (!n.isRead) {
      await markAsReadApi(n.id).catch(console.error);
      window.dispatchEvent(new CustomEvent("nexus:notification-read", { detail: { id: n.id } }));
      setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    }
    if (!n.linkUrl) return;
    if (n.type === "DM_RECEIVED") {
      const channelId = n.linkUrl.split("/channels/")[1];
      if (channelId) {
        window.dispatchEvent(new CustomEvent("nexus:dm-created", { detail: { dmId: channelId } }));
      }
    }
    router.push(n.linkUrl);
  }

  const items = notifications.filter((n) => tabMatch(n, tab));

  return (
    <section
      aria-label="인박스"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">Inbox</h2>
        <nav role="tablist" aria-label="인박스 필터" className="flex items-center gap-1">
          {TABS.map((t) => {
            const isActive = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-surface-overlay text-fg-primary"
                    : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-fg-tertiary">
          불러오는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-fg-tertiary">
          {tab === "all" ? "새 알림이 없어요." : "해당 필터에 해당하는 항목이 없어요."}
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {items.map((n) => (
            <li
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated",
                !n.isRead ? "bg-surface-subtle" : "bg-transparent",
              )}
            >
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-fg-tertiary">
                <NotifIcon type={n.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-fg-tertiary">
                  <span className="font-medium text-fg-secondary">
                    {TYPE_LABEL[n.type]}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time className="shrink-0">{relativeTime(n.createdAt)}</time>
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    !n.isRead ? "text-fg-primary" : "text-fg-secondary",
                  )}
                >
                  <span className="font-medium text-fg-primary">{n.title}</span>
                  {n.body ? (
                    <>
                      <span className="text-fg-tertiary"> · </span>
                      <span className="truncate">{n.body}</span>
                    </>
                  ) : null}
                </p>
              </div>

              {!n.isRead ? (
                <span
                  aria-label="읽지 않음"
                  className="mt-2 size-2 shrink-0 rounded-full bg-accent"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
