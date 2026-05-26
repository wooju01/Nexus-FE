"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BoardIcon,
  CalendarIcon,
  CheckCircleIcon,
  HashIcon,
  HomeIcon,
  InboxIcon,
  LayersIcon,
  PeopleIcon,
  PlusIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getAccessToken } from "@/lib/auth/tokens";
import { getProfileApi } from "@/lib/api/auth";
import { getChannelsApi, type Channel } from "@/lib/api/channel";
import { getDmsApi, type DmChannel } from "@/lib/api/dm";
import { getProjectsApi, type Project } from "@/lib/api/project";
import { getUnreadSummaryApi } from "@/lib/api/workspace";
import { markChannelReadApi } from "@/lib/api/message";
import { getSocket } from "@/lib/ws/socket";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { InviteModal } from "@/features/invitation/invite-modal";
import { DmStartModal } from "@/features/dm/dm-start-modal";
import { CreateProjectModal } from "@/features/project/create-project-modal";
import { cn } from "@/lib/utils/cn";

import { UnreadBadge } from "./sidebar-badges";
import { SidebarLink, SidebarSection } from "./sidebar-nav";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

/** pathname 기준으로 현재 어느 Rail 섹션인지 판별 */
function getActiveSection(pathname: string): "home" | "messages" | "boards" {
  if (pathname.startsWith("/channels") || pathname.startsWith("/dm")) return "messages";
  if (pathname.startsWith("/projects")) return "boards";
  return "home"; // /dashboard, /calendar 등
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const activeSection = getActiveSection(pathname);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [dms, setDms] = useState<DmChannel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getProfileApi(token).then((p) => setCurrentUserId(p.id)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;

    getChannelsApi(token, currentWorkspace.id).then(setChannels).catch(console.error);
    getDmsApi(token, currentWorkspace.id).then(setDms).catch(console.error);
    getProjectsApi(token, currentWorkspace.id).then(setProjects).catch(console.error);
  }, [currentWorkspace]);

  // 초기 unread 카운트 fetch + WebSocket 구독
  useEffect(() => {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;

    getUnreadSummaryApi(token, currentWorkspace.id)
      .then((items) => {
        const counts: Record<string, number> = {};
        items.forEach((item) => { counts[item.channelId] = item.unreadCount; });
        setUnreadCounts(counts);
      })
      .catch(() => {});

    const socket = getSocket(token);

    function onMessageCreated(msg: { channelId: string; authorId?: string }) {
      const currentChannelId = window.location.pathname.split("/channels/")[1];
      if (msg.channelId === currentChannelId) return;
      setUnreadCounts((prev) => ({
        ...prev,
        [msg.channelId]: (prev[msg.channelId] ?? 0) + 1,
      }));
    }

    socket.on("message.created", onMessageCreated);
    return () => { socket.off("message.created", onMessageCreated); };
  }, [currentWorkspace]);

  function refreshDms() {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;
    getDmsApi(token, currentWorkspace.id).then(setDms).catch(console.error);
  }

  // 총 unread 카운트 (Messages Rail 뱃지용)
  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);

  return (
    <aside
      aria-label="사이드바"
      className="flex w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-subtle"
    >
      {/* New 버튼 */}
      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border-subtle bg-surface-base px-3 py-2 text-sm font-medium text-fg-secondary hover:border-border-strong hover:text-fg-primary"
        >
          <span className="flex items-center gap-2">
            <PlusIcon className="size-4" />
            New...
          </span>
          <kbd className="rounded border border-border-subtle bg-surface-elevated px-1.5 py-0.5 text-[10px] text-fg-tertiary">
            ⌘ N
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">

        {/* ── HOME 섹션 ── */}
        {activeSection === "home" && (
          <ul className="mb-4 space-y-0.5">
            <SidebarLink
              href="/dashboard"
              label="Home"
              icon={<HomeIcon className="size-4" />}
              isActive={pathname === "/dashboard"}
            />
            <SidebarLink
              label="Inbox"
              icon={<InboxIcon className="size-4" />}
              disabled
            />
            <SidebarLink
              label="My tasks"
              icon={<CheckCircleIcon className="size-4" />}
              disabled
            />
            <SidebarLink
              href="/calendar"
              label="Calendar"
              icon={<CalendarIcon className="size-4" />}
              isActive={pathname.startsWith("/calendar")}
            />
            <SidebarLink
              label="My week"
              icon={<LayersIcon className="size-4" />}
              disabled
            />
          </ul>
        )}

        {/* ── MESSAGES 섹션 ── */}
        {activeSection === "messages" && (
          <>
            <SidebarSection title="Channels" actionLabel="채널 추가">
              <ul className="space-y-0.5">
                {channels.map((c) => {
                  const href = `/channels/${c.id}`;
                  const isActive = pathname === href;
                  const unread = unreadCounts[c.id] ?? 0;
                  return (
                    <li key={c.id}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => {
                          if (unread > 0) {
                            setUnreadCounts((prev) => ({ ...prev, [c.id]: 0 }));
                            const token = getAccessToken();
                            if (token) markChannelReadApi(token, c.id).catch(() => {});
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-surface-overlay text-fg-primary"
                            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                        )}
                      >
                        <HashIcon className="size-4 shrink-0 text-fg-tertiary" />
                        <span className="flex-1 truncate text-left">{c.name}</span>
                        {unread > 0 ? <UnreadBadge count={unread} /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SidebarSection>

            <SidebarSection
              title="Direct Messages"
              actionLabel="DM 시작"
              onAction={() => setIsDmModalOpen(true)}
            >
              <ul className="space-y-0.5">
                {dms.map((dm) => {
                  const other = dm.members[0]?.user;
                  if (!other) return null;
                  const href = `/channels/${dm.id}`;
                  const isActive = pathname === href;
                  const unread = unreadCounts[dm.id] ?? 0;
                  return (
                    <li key={dm.id}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => {
                          if (unread > 0) {
                            setUnreadCounts((prev) => ({ ...prev, [dm.id]: 0 }));
                            const token = getAccessToken();
                            if (token) markChannelReadApi(token, dm.id).catch(() => {});
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-surface-overlay text-fg-primary"
                            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                        )}
                      >
                        <Avatar
                          initials={other.name[0]?.toUpperCase() ?? "?"}
                          color="blue"
                          presence={STATUS_PRESENCE[other.status]}
                          size="xs"
                          name={other.name}
                        />
                        <span className="flex-1 truncate text-left">{other.name}</span>
                        {unread > 0 ? <UnreadBadge count={unread} /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SidebarSection>
          </>
        )}

        {/* ── BOARDS 섹션 ── */}
        {activeSection === "boards" && (
          <SidebarSection
            title="Projects"
            actionLabel="프로젝트 추가"
            onAction={() => setIsProjectModalOpen(true)}
          >
            <ul className="space-y-0.5">
              {projects.map((p) => {
                const href = `/projects/${p.id}`;
                const isActive = pathname.startsWith(href);
                return (
                  <li key={p.id}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-surface-overlay text-fg-primary"
                          : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                      )}
                    >
                      <BoardIcon className="size-4 shrink-0 text-fg-tertiary" />
                      <span className="flex-1 truncate">{p.name}</span>
                    </Link>
                  </li>
                );
              })}
              {projects.length === 0 && (
                <li className="px-2 py-2 text-xs text-fg-tertiary">
                  프로젝트가 없습니다
                </li>
              )}
            </ul>
          </SidebarSection>
        )}
      </nav>

      {/* 하단 — Invite (Messages 섹션에서만 표시) */}
      {activeSection === "messages" && (
        <div className="border-t border-border-subtle p-3">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <PeopleIcon className="size-4" />
            <span>Invite teammates</span>
          </button>
        </div>
      )}

      {currentWorkspace ? (
        <>
          <InviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            workspaceId={currentWorkspace.id}
          />
          <DmStartModal
            isOpen={isDmModalOpen}
            onClose={() => setIsDmModalOpen(false)}
            workspaceId={currentWorkspace.id}
            currentUserId={currentUserId}
            onDmCreated={refreshDms}
          />
          <CreateProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            workspaceId={currentWorkspace.id}
            onCreated={(project) => setProjects((prev) => [...prev, project])}
          />
        </>
      ) : null}
    </aside>
  );
}
