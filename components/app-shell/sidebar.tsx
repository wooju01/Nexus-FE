"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  BoardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  HashIcon,
  HomeIcon,
  InboxIcon,
  LayersIcon,
  PeopleIcon,
  PlusIcon,
  StarIcon,
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
import {
  getStarred, toggleStarred, isStarred, type StarredItem,
} from "@/lib/store/starred";
import { getRecent, recordVisit, type RecentItem } from "@/lib/store/recent";

import { UnreadBadge } from "./sidebar-badges";
import { SidebarLink, SidebarSection } from "./sidebar-nav";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

/** 항목 타입에 맞는 아이콘 */
function ItemIcon({ type, name, dmUser }: {
  type: StarredItem["type"] | RecentItem["type"];
  name: string;
  dmUser?: { name: string; status: string };
}) {
  if (type === "channel") return <HashIcon className="size-4 shrink-0 text-fg-tertiary" />;
  if (type === "project") return <BoardIcon className="size-4 shrink-0 text-fg-tertiary" />;
  if (type === "dm" && dmUser) {
    return (
      <Avatar
        initials={dmUser.name[0]?.toUpperCase() ?? "?"}
        color="blue"
        presence={STATUS_PRESENCE[dmUser.status as keyof typeof STATUS_PRESENCE]}
        size="xs"
        name={dmUser.name}
      />
    );
  }
  return <HashIcon className="size-4 shrink-0 text-fg-tertiary" />;
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id ?? "";

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [dms, setDms] = useState<DmChannel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 즐겨찾기 & 최근 방문 상태
  const [starred, setStarred] = useState<StarredItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  // 호버 중인 항목 id (별 버튼 표시용)
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 드롭다운 열림 상태
  const [starredOpen, setStarredOpen] = useState(true);
  const [recentOpen, setRecentOpen] = useState(true);

  // 이름 조회용 맵
  const dmUserMap = useRef<Record<string, { name: string; status: string }>>({});

  // 워크스페이스 변경 시 starred/recent 로드
  useEffect(() => {
    if (!wsId) return;
    setStarred(getStarred(wsId));
    setRecent(getRecent(wsId));
  }, [wsId]);

  // pathname 변경 시 최근 방문 기록
  useEffect(() => {
    if (!wsId) return;

    let type: RecentItem["type"] | null = null;
    let id = "";
    let name = "";
    let href = pathname;

    const channelMatch = pathname.match(/^\/channels\/([^/]+)/);
    const projectMatch = pathname.match(/^\/projects\/([^/]+)/);

    if (channelMatch) {
      id = channelMatch[1];
      // DM인지 채널인지 판별
      const dmInfo = dmUserMap.current[id];
      if (dmInfo) {
        type = "dm";
        name = dmInfo.name;
      } else {
        type = "channel";
        name = channels.find((c) => c.id === id)?.name ?? "";
      }
    } else if (projectMatch) {
      id = projectMatch[1];
      type = "project";
      name = projects.find((p) => p.id === id)?.name ?? "";
    }

    if (type && id && name) {
      setRecent(recordVisit(wsId, { id, type, name, href }));
    }
  }, [pathname, wsId, channels, projects]);

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
    getDmsApi(token, currentWorkspace.id)
      .then((list) => {
        // DM 사용자 맵 갱신
        list.forEach((dm) => {
          const other = dm.members[0]?.user;
          if (other) dmUserMap.current[dm.id] = { name: other.name, status: other.status };
        });
        setDms(list);
      })
      .catch(console.error);
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
    function onMessageCreated(msg: { channelId: string }) {
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

  function handleToggleStar(item: StarredItem) {
    setStarred(toggleStarred(wsId, item));
  }

  /** 채널/DM/프로젝트 항목에 공통으로 붙는 별 버튼 */
  function StarButton({ item }: { item: StarredItem }) {
    const starred_ = isStarred(wsId, item.id);
    return (
      <button
        type="button"
        aria-label={starred_ ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleStar(item); }}
        className={cn(
          "ml-auto flex size-5 shrink-0 items-center justify-center rounded transition-colors",
          starred_
            ? "text-yellow-400 opacity-100"
            : "text-fg-tertiary opacity-0 group-hover:opacity-100 hover:text-yellow-400",
        )}
      >
        <StarIcon className={cn("size-3.5", starred_ && "fill-yellow-400")} />
      </button>
    );
  }

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
        {/* 개인 네비게이션 */}
        <ul className="mb-4 space-y-0.5">
          <SidebarLink href="/dashboard" label="Home" icon={<HomeIcon className="size-4" />} isActive={pathname === "/dashboard"} />
          <SidebarLink label="Inbox" icon={<InboxIcon className="size-4" />} disabled />
          <SidebarLink label="My tasks" icon={<CheckCircleIcon className="size-4" />} disabled />
          <SidebarLink href="/calendar" label="Calendar" icon={<CalendarIcon className="size-4" />} isActive={pathname.startsWith("/calendar")} />
          <SidebarLink label="My week" icon={<LayersIcon className="size-4" />} disabled />
        </ul>

        {/* ── 즐겨찾기 ── */}
        <section className="mb-4">
          <button
            type="button"
            onClick={() => setStarredOpen((o) => !o)}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 pt-2 hover:bg-surface-elevated"
          >
            <StarIcon className="size-3 fill-yellow-400 text-yellow-400" />
            <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
              Starred
            </span>
            <ChevronDownIcon className={cn("size-3 text-fg-tertiary transition-transform", !starredOpen && "-rotate-90")} />
          </button>
          {starredOpen && (
            starred.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-fg-tertiary">
                채널·DM·프로젝트에 마우스를 올려 ★을 눌러보세요
              </p>
            ) : (
              <ul className="mt-0.5 space-y-0.5">
                {starred.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const dmUser = item.type === "dm" ? dmUserMap.current[item.id] : undefined;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-surface-overlay text-fg-primary"
                            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                        )}
                      >
                        <ItemIcon type={item.type} name={item.name} dmUser={dmUser} />
                        <span className="flex-1 truncate">{item.name}</span>
                        <StarButton item={item} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </section>

        {/* ── 최근 방문 ── */}
        <section className="mb-4">
          <button
            type="button"
            onClick={() => setRecentOpen((o) => !o)}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 pt-2 hover:bg-surface-elevated"
          >
            <ClockIcon className="size-3 text-fg-tertiary" />
            <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
              Recent
            </span>
            <ChevronDownIcon className={cn("size-3 text-fg-tertiary transition-transform", !recentOpen && "-rotate-90")} />
          </button>
          {recentOpen && (
            recent.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-fg-tertiary">
                최근 방문한 항목이 없습니다
              </p>
            ) : (
              <ul className="mt-0.5 space-y-0.5">
                {recent.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const dmUser = item.type === "dm" ? dmUserMap.current[item.id] : undefined;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive
                            ? "bg-surface-overlay text-fg-primary"
                            : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                        )}
                      >
                        <ItemIcon type={item.type} name={item.name} dmUser={dmUser} />
                        <span className="flex-1 truncate">{item.name}</span>
                        <StarButton item={{ id: item.id, type: item.type, name: item.name, href: item.href }} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </section>

        {/* ── Channels ── */}
        <SidebarSection title="Channels" actionLabel="채널 추가">
          <ul className="space-y-0.5">
            {channels.map((c) => {
              const href = `/channels/${c.id}`;
              const isActive = pathname === href;
              const unread = unreadCounts[c.id] ?? 0;
              const starItem: StarredItem = { id: c.id, type: "channel", name: c.name ?? c.id, href };
              return (
                <li key={c.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHoveredId(c.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (unread > 0) {
                        setUnreadCounts((prev) => ({ ...prev, [c.id]: 0 }));
                        const token = getAccessToken();
                        if (token) markChannelReadApi(token, c.id).catch(() => {});
                      }
                    }}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-surface-overlay text-fg-primary"
                        : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                    )}
                  >
                    <HashIcon className="size-4 shrink-0 text-fg-tertiary" />
                    <span className="flex-1 truncate text-left">{c.name}</span>
                    {unread > 0 && hoveredId !== c.id ? <UnreadBadge count={unread} /> : null}
                    {hoveredId === c.id || isStarred(wsId, c.id) ? <StarButton item={starItem} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {/* ── Projects ── */}
        <SidebarSection title="Projects" actionLabel="프로젝트 추가" onAction={() => setIsProjectModalOpen(true)}>
          <ul className="space-y-0.5">
            {projects.map((p) => {
              const href = `/projects/${p.id}`;
              const isActive = pathname.startsWith(href);
              const starItem: StarredItem = { id: p.id, type: "project", name: p.name, href };
              return (
                <li key={p.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-surface-overlay text-fg-primary"
                        : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary",
                    )}
                  >
                    <BoardIcon className="size-4 shrink-0 text-fg-tertiary" />
                    <span className="flex-1 truncate">{p.name}</span>
                    {hoveredId === p.id || isStarred(wsId, p.id) ? <StarButton item={starItem} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {/* ── Direct Messages ── */}
        <SidebarSection title="Direct Messages" actionLabel="DM 시작" onAction={() => setIsDmModalOpen(true)}>
          <ul className="space-y-0.5">
            {dms.map((dm) => {
              const other = dm.members[0]?.user;
              if (!other) return null;
              const href = `/channels/${dm.id}`;
              const isActive = pathname === href;
              const unread = unreadCounts[dm.id] ?? 0;
              const starItem: StarredItem = { id: dm.id, type: "dm", name: other.name, href };
              return (
                <li key={dm.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setHoveredId(dm.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (unread > 0) {
                        setUnreadCounts((prev) => ({ ...prev, [dm.id]: 0 }));
                        const token = getAccessToken();
                        if (token) markChannelReadApi(token, dm.id).catch(() => {});
                      }
                    }}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
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
                    {unread > 0 && hoveredId !== dm.id ? <UnreadBadge count={unread} /> : null}
                    {hoveredId === dm.id || isStarred(wsId, dm.id) ? <StarButton item={starItem} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>
      </nav>

      {/* 하단 - Invite */}
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

      {currentWorkspace ? (
        <>
          <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} workspaceId={currentWorkspace.id} />
          <DmStartModal isOpen={isDmModalOpen} onClose={() => setIsDmModalOpen(false)} workspaceId={currentWorkspace.id} currentUserId={currentUserId} onDmCreated={refreshDms} />
          <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} workspaceId={currentWorkspace.id} onCreated={(project) => setProjects((prev) => [...prev, project])} />
        </>
      ) : null}
    </aside>
  );
}
