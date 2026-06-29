"use client";

import { useState } from "react";
import Link from "next/link";

import { XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { type DmChannel } from "@/lib/api/dm";
import { markChannelReadApi } from "@/lib/api/message";
import { getAccessToken } from "@/lib/auth/tokens";
import { isStarred, type StarredItem } from "@/lib/store/starred";
import { cn } from "@/lib/utils/cn";
import { UnreadBadge } from "./sidebar-badges";
import { StarButton } from "./sidebar-item-icon";
import { SidebarSection } from "./sidebar-nav";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

type Props = {
  wsId: string;
  pathname: string;
  dms: DmChannel[];
  unreadCounts: Record<string, number>;
  onMarkRead: (channelId: string) => void;
  onToggleStar: (item: StarredItem) => void;
  onDmStart: () => void;
  onDmClose: (dmId: string) => void;
};

export function SidebarDmList({ wsId, pathname, dms, unreadCounts, onMarkRead, onToggleStar, onDmStart, onDmClose }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <SidebarSection title="Direct Messages" actionLabel="DM 시작" onAction={onDmStart}>
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
                    onMarkRead(dm.id);
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
                  presence={STATUS_PRESENCE[other.status as keyof typeof STATUS_PRESENCE]}
                  size="xs"
                  name={other.name}
                />
                <span className="flex-1 truncate text-left">{other.name}</span>
                {unread > 0 && hoveredId !== dm.id ? <UnreadBadge count={unread} /> : null}
                {hoveredId === dm.id || isStarred(wsId, dm.id) ? (
                  <StarButton wsId={wsId} item={starItem} onToggle={onToggleStar} />
                ) : null}
                {hoveredId === dm.id ? (
                  <button
                    type="button"
                    aria-label={`${other.name} DM 닫기`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDmClose(dm.id);
                    }}
                    className="flex size-4 shrink-0 items-center justify-center rounded text-fg-tertiary hover:text-fg-primary"
                  >
                    <XIcon className="size-3" />
                  </button>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </SidebarSection>
  );
}
