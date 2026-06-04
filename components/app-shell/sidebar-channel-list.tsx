"use client";

import { useState } from "react";
import Link from "next/link";

import { HashIcon } from "@/components/icons";
import { type Channel } from "@/lib/api/channel";
import { markChannelReadApi } from "@/lib/api/message";
import { getAccessToken } from "@/lib/auth/tokens";
import { isStarred, type StarredItem } from "@/lib/store/starred";
import { cn } from "@/lib/utils/cn";
import { UnreadBadge } from "./sidebar-badges";
import { StarButton } from "./sidebar-item-icon";
import { SidebarSection } from "./sidebar-nav";

type Props = {
  wsId: string;
  pathname: string;
  channels: Channel[];
  unreadCounts: Record<string, number>;
  onMarkRead: (channelId: string) => void;
  onToggleStar: (item: StarredItem) => void;
};

export function SidebarChannelList({ wsId, pathname, channels, unreadCounts, onMarkRead, onToggleStar }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
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
                    onMarkRead(c.id);
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
                {hoveredId === c.id || isStarred(wsId, c.id) ? (
                  <StarButton wsId={wsId} item={starItem} onToggle={onToggleStar} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </SidebarSection>
  );
}
