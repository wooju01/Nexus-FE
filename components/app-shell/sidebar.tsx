"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarIcon,
  CheckCircleIcon,
  HomeIcon,
  LayersIcon,
  PeopleIcon,
  PlusIcon,
} from "@/components/icons";


import { getAccessToken } from "@/lib/auth/tokens";
import { getProfileApi } from "@/lib/api/auth";
import { getChannelsApi, type Channel } from "@/lib/api/channel";
import { getDmsApi, type DmChannel } from "@/lib/api/dm";
import { getProjectsApi, type Project } from "@/lib/api/project";
import { getUnreadSummaryApi } from "@/lib/api/workspace";
import { getSocket } from "@/lib/ws/socket";
import { cn } from "@/lib/utils/cn";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { InviteModal } from "@/features/invitation/invite-modal";
import { DmStartModal } from "@/features/dm/dm-start-modal";
import { CreateWorkspaceModal } from "@/features/workspace/create-workspace-modal";
import { toggleStarred, getStarred, type StarredItem } from "@/lib/store/starred";
import { SidebarLink } from "./sidebar-nav";
import { SidebarStarredSection } from "./sidebar-starred-section";
import { SidebarChannelList } from "./sidebar-channel-list";
import { SidebarProjectList } from "./sidebar-project-list";
import { SidebarDmList } from "./sidebar-dm-list";

function hiddenDmKey(userId: string) {
  return `nexus:hidden-dms:${userId}`;
}
function loadHiddenDms(userId: string): Set<string> {
  if (!userId || typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(hiddenDmKey(userId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function saveHiddenDm(userId: string, dmId: string) {
  if (!userId || typeof window === "undefined") return;
  const set = loadHiddenDms(userId);
  set.add(dmId);
  localStorage.setItem(hiddenDmKey(userId), JSON.stringify([...set]));
}
function removeHiddenDm(userId: string, dmId: string) {
  if (!userId || typeof window === "undefined") return;
  const set = loadHiddenDms(userId);
  set.delete(dmId);
  localStorage.setItem(hiddenDmKey(userId), JSON.stringify([...set]));
}

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const wsId = currentWorkspace?.id ?? "";

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDmModalOpen, setIsDmModalOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [dms, setDms] = useState<DmChannel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // starred는 localStorage에서 읽는 파생값 — 버전 카운터로 재계산 트리거
  const [starVersion, setStarVersion] = useState(0);
  const starred = useMemo(() => { void starVersion; return getStarred(wsId); }, [wsId, starVersion]);

  // dmUserMap: 렌더에 전달되므로 useState, effect 내부 읽기는 ref로 스냅샷
  const [dmUserMap, setDmUserMap] = useState<Record<string, { name: string; status: string }>>({});
  const dmUserMapRef = useRef<Record<string, { name: string; status: string }>>({});
  const dmsRef = useRef<DmChannel[]>([]);
  const hiddenDmIds = useRef<Set<string>>(new Set());
  useEffect(() => { dmsRef.current = dms; }, [dms]);
  useEffect(() => { dmUserMapRef.current = dmUserMap; }, [dmUserMap]);


  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getProfileApi(token)
      .then((p) => {
        setCurrentUserId(p.id);
        hiddenDmIds.current = loadHiddenDms(p.id);
        // 이미 로드된 DM이 있다면 hidden 필터 재적용
        setDms((prev) => prev.filter((d) => !hiddenDmIds.current.has(d.id)));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;

    getChannelsApi(token, currentWorkspace.id).then(setChannels).catch(console.error);
    getDmsApi(token)
      .then((list) => {
        const newMap: Record<string, { name: string; status: string }> = {};
        list.forEach((dm) => {
          const other = dm.members[0]?.user;
          if (other) newMap[dm.id] = { name: other.name, status: other.status };
        });
        setDmUserMap((prev) => ({ ...prev, ...newMap }));
        setDms(list.filter((dm) => !hiddenDmIds.current.has(dm.id)));
        const socket = getSocket(token);
        list.forEach((dm) => socket.emit("channel.join", dm.id));
      })
      .catch(console.error);
    getProjectsApi(currentWorkspace.id).then(setProjects).catch(console.error);
  }, [currentWorkspace]);

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
      setUnreadCounts((prev) => ({ ...prev, [msg.channelId]: (prev[msg.channelId] ?? 0) + 1 }));

      // 모르는 채널이거나 hidden 상태면 새 DM 도착 — DM 목록 즉시 갱신
      const known = dmsRef.current.some((dm) => dm.id === msg.channelId);
      const wasHidden = hiddenDmIds.current.has(msg.channelId);
      if (!known || wasHidden) {
        if (wasHidden) {
          hiddenDmIds.current.delete(msg.channelId);
          removeHiddenDm(currentUserId, msg.channelId);
        }
        getDmsApi(token!).then((list) => {
          const newMap: Record<string, { name: string; status: string }> = {};
          list.forEach((dm) => {
            const other = dm.members[0]?.user;
            if (other) newMap[dm.id] = { name: other.name, status: other.status };
          });
          setDmUserMap((prev) => ({ ...prev, ...newMap }));
          setDms(list.filter((dm) => !hiddenDmIds.current.has(dm.id)));
          // 새로 생긴 DM 룸도 join
          const s = getSocket(token!);
          list.forEach((dm) => s.emit("channel.join", dm.id));
        }).catch(console.error);
      }
    }
    socket.on("message.created", onMessageCreated);

    function onDmCreated(e: Event) {
      const dmId = (e as CustomEvent<{ dmId: string }>).detail.dmId;
      hiddenDmIds.current.delete(dmId);
      removeHiddenDm(currentUserId, dmId);
      getDmsApi(token!).then((list) => {
        const newMap: Record<string, { name: string; status: string }> = {};
        list.forEach((dm) => {
          const other = dm.members[0]?.user;
          if (other) newMap[dm.id] = { name: other.name, status: other.status };
        });
        setDmUserMap((prev) => ({ ...prev, ...newMap }));
        setDms(list.filter((dm) => !hiddenDmIds.current.has(dm.id)));
        const s = getSocket(token!);
        list.forEach((dm) => s.emit("channel.join", dm.id));
      }).catch(console.error);
    }
    window.addEventListener("nexus:dm-created", onDmCreated);

    return () => {
      socket.off("message.created", onMessageCreated);
      window.removeEventListener("nexus:dm-created", onDmCreated);
    };
  }, [currentWorkspace, currentUserId]);

  function handleToggleStar(item: StarredItem) {
    toggleStarred(wsId, item);
    setStarVersion((n) => n + 1);
  }

  function handleMarkRead(channelId: string) {
    setUnreadCounts((prev) => ({ ...prev, [channelId]: 0 }));
  }

  function refreshChannels() {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;
    getChannelsApi(token, currentWorkspace.id).then(setChannels).catch(console.error);
  }

  function refreshDms() {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;
    getDmsApi(token).then((list) => {
      const newMap: Record<string, { name: string; status: string }> = {};
      list.forEach((dm) => {
        const other = dm.members[0]?.user;
        if (other) newMap[dm.id] = { name: other.name, status: other.status };
      });
      setDmUserMap((prev) => ({ ...prev, ...newMap }));
      setDms(list.filter((d) => !hiddenDmIds.current.has(d.id)));
    }).catch(console.error);
  }

  return (
    <aside
      aria-label="사이드바"
      className="flex w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-subtle"
    >
      <div className="px-3 pb-2 pt-3">
        <button
          type="button"
          onClick={() => setIsCreateWorkspaceOpen(true)}
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
          <ul className="mb-4 space-y-0.5">
            <SidebarLink href="/dashboard" label="Home" icon={<HomeIcon className="size-4" />} isActive={pathname === "/dashboard"} />
            <SidebarLink href="/my-tasks" label="My tasks" icon={<CheckCircleIcon className="size-4" />} isActive={pathname === "/my-tasks"} />
            <SidebarLink href="/calendar" label="Calendar" icon={<CalendarIcon className="size-4" />} isActive={pathname.startsWith("/calendar")} />
            <SidebarLink href="/my-week" label="My week" icon={<LayersIcon className="size-4" />} isActive={pathname === "/my-week"} />
          </ul>

          <SidebarStarredSection
            wsId={wsId}
            pathname={pathname}
            starred={starred}
            dmUserMap={dmUserMap}
            onToggleStar={handleToggleStar}
          />

          <SidebarChannelList
            wsId={wsId}
            pathname={pathname}
            channels={channels}
            unreadCounts={unreadCounts}
            onMarkRead={handleMarkRead}
            onToggleStar={handleToggleStar}
          />

          <SidebarProjectList
            wsId={wsId}
            pathname={pathname}
            projects={projects}
            onProjectsChange={setProjects}
            onChannelsChange={refreshChannels}
            onRecentChange={() => {}}
          />

          <SidebarDmList
            wsId={wsId}
            pathname={pathname}
            dms={dms}
            unreadCounts={unreadCounts}
            onMarkRead={handleMarkRead}
            onToggleStar={handleToggleStar}
            onDmStart={() => setIsDmModalOpen(true)}
            onDmClose={(dmId) => {
              hiddenDmIds.current.add(dmId);
              saveHiddenDm(currentUserId, dmId);
              setDms((prev) => prev.filter((d) => d.id !== dmId));
            }}
          />
        </nav>

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

      <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
      {currentWorkspace ? (
        <>
          <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} workspaceId={currentWorkspace.id} />
          <DmStartModal isOpen={isDmModalOpen} onClose={() => setIsDmModalOpen(false)} workspaceId={currentWorkspace.id} currentUserId={currentUserId} onDmCreated={refreshDms} />
        </>
      ) : null}
    </aside>
  );
}
