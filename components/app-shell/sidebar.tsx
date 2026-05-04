"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
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
import { getChannelsApi, type Channel } from "@/lib/api/channel";
import { getDmsApi, type DmChannel } from "@/lib/api/dm";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { InviteModal } from "@/features/invitation/invite-modal";
import { cn } from "@/lib/utils/cn";

import { UnreadBadge } from "./sidebar-badges";
import { SidebarLink, SidebarSection } from "./sidebar-nav";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { currentWorkspace } = useWorkspace();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [dms, setDms] = useState<DmChannel[]>([]);

  useEffect(() => {
    if (!currentWorkspace) return;
    const token = getAccessToken();
    if (!token) return;

    getChannelsApi(token, currentWorkspace.id)
      .then(setChannels)
      .catch(console.error);

    getDmsApi(token, currentWorkspace.id)
      .then(setDms)
      .catch(console.error);
  }, [currentWorkspace]);

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

        {/* Channels */}
        <SidebarSection title="Channels" actionLabel="채널 추가">
          <ul className="space-y-0.5">
            {channels.map((c) => {
              const href = `/channels/${c.id}`;
              const isActive = pathname === href;
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </SidebarSection>

        {/* DMs */}
        <SidebarSection title="Direct Messages" actionLabel="DM 시작">
          <ul className="space-y-0.5">
            {dms.map((dm) => {
              const other = dm.members[0]?.user;
              if (!other) return null;
              const href = `/channels/${dm.id}`;
              const isActive = pathname === href;
              return (
                <li key={dm.id}>
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
                    <Avatar
                      initials={other.name[0]?.toUpperCase() ?? "?"}
                      color="blue"
                      presence={STATUS_PRESENCE[other.status]}
                      size="xs"
                      name={other.name}
                    />
                    <span className="flex-1 truncate text-left">{other.name}</span>
                  </Link>
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
          onClick={() => setIsInviteModalOpen(true)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <PeopleIcon className="size-4" />
          <span>Invite teammates</span>
        </button>
      </div>

      {currentWorkspace ? (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={currentWorkspace.id}
        />
      ) : null}
    </aside>
  );
}
