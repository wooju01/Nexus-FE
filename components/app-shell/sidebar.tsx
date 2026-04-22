"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CheckCircleIcon,
  HashIcon,
  HomeIcon,
  InboxIcon,
  LayersIcon,
  PeopleIcon,
  PlusIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { CHANNELS } from "@/lib/mocks/channels";
import { PROJECTS } from "@/lib/mocks/projects";
import { getTasksAssignedTo } from "@/lib/mocks/tasks";
import { CURRENT_USER_ID, USERS } from "@/lib/mocks/users";
import { cn } from "@/lib/utils/cn";

import type { ProjectColor } from "@/types/domain";

import { UnreadBadge } from "./sidebar-badges";
import { SidebarLink, SidebarSection } from "./sidebar-nav";

/**
 * 프로젝트 컬러 점(dot)에 쓰는 Tailwind bg 클래스 맵.
 * Tailwind v4에서 `bg-${color}-500`류 동적 클래스 purge 회피용.
 */
const PROJECT_DOT_CLASS: Record<ProjectColor, string> = {
  blue: "bg-sky-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  yellow: "bg-yellow-500",
};

/**
 * 현재 사용자 기준 사이드바 카운트.
 * Inbox "12"는 키스크린 재현용 고정값 — 실제론 서버의 unread 합으로 대체.
 * 순수 함수이므로 `use*` 대신 `get*` 접두사.
 */
function getMyCounts() {
  const myTasks = getTasksAssignedTo(CURRENT_USER_ID).length;
  const inboxUnread = 12;
  return { myTasks, inboxUnread };
}

/** DM 목록 더미 unread 맵 — 키스크린의 뱃지 수치를 따른다. */
const DM_UNREAD: Record<string, number> = {
  "u-sora": 2,
};

export function Sidebar() {
  const pathname = usePathname();
  const { myTasks, inboxUnread } = getMyCounts();

  // DM 목록은 현재 사용자 제외.
  const dmUsers = USERS.filter((u) => u.id !== CURRENT_USER_ID);

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
        {/* 개인 워크스페이스 */}
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
            badge={inboxUnread}
            badgeTone="accent"
            disabled
          />
          <SidebarLink
            label="My tasks"
            icon={<CheckCircleIcon className="size-4" />}
            badge={myTasks}
            disabled
          />
          <SidebarLink
            label="My week"
            icon={<LayersIcon className="size-4" />}
            disabled
          />
        </ul>

        {/* Projects */}
        <SidebarSection title="Projects" actionLabel="프로젝트 추가">
          <ul className="space-y-0.5">
            {PROJECTS.map((p) => {
              const href = `/projects/${p.slug}`;
              const isActive = pathname === href;
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
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        PROJECT_DOT_CLASS[p.color],
                      )}
                    />
                    <span className="truncate">{p.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {/* Channels */}
        <SidebarSection title="Channels" actionLabel="채널 추가">
          <ul className="space-y-0.5">
            {CHANNELS.map((c) => {
              const href = `/channels/${c.name}`;
              const isActive = pathname === href;
              const unread = c.unread ?? 0;
              return (
                <li key={c.id}>
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
                    <HashIcon className="size-4 shrink-0 text-fg-tertiary" />
                    <span className="flex-1 truncate text-left">{c.name}</span>
                    {unread > 0 ? <UnreadBadge count={unread} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {/* DMs */}
        <SidebarSection title="Direct Messages" actionLabel="DM 시작">
          <ul className="space-y-0.5">
            {dmUsers.map((u) => {
              const unread = DM_UNREAD[u.id] ?? 0;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    disabled
                    title="DM — 준비 중"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-secondary disabled:cursor-not-allowed hover:bg-surface-elevated hover:text-fg-primary"
                  >
                    <Avatar
                      initials={u.initials}
                      color={u.avatarColor}
                      presence={u.presence}
                      size="xs"
                      name={u.name}
                    />
                    <span className="flex-1 truncate text-left">{u.name}</span>
                    {unread > 0 ? <UnreadBadge count={unread} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </SidebarSection>
      </nav>

      {/* Invite teammates */}
      <div className="border-t border-border-subtle p-3">
        <button
          type="button"
          disabled
          title="초대 — 준비 중"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-secondary disabled:cursor-not-allowed hover:bg-surface-elevated hover:text-fg-primary"
        >
          <PeopleIcon className="size-4" />
          <span>Invite teammates</span>
        </button>
      </div>
    </aside>
  );
}
