"use client";

import { useState } from "react";
import Link from "next/link";

import { ChevronDownIcon, ClockIcon } from "@/components/icons";
import { type StarredItem } from "@/lib/store/starred";
import { type RecentItem } from "@/lib/store/recent";
import { cn } from "@/lib/utils/cn";
import { ItemIcon, StarButton } from "./sidebar-item-icon";

type Props = {
  wsId: string;
  pathname: string;
  recent: RecentItem[];
  dmUserMap: Record<string, { name: string; status: string }>;
  onToggleStar: (item: StarredItem) => void;
};

export function SidebarRecentSection({ wsId, pathname, recent, dmUserMap, onToggleStar }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 pt-2 hover:bg-surface-elevated"
      >
        <ClockIcon className="size-3 text-fg-tertiary" />
        <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wide text-fg-tertiary">
          Recent
        </span>
        <ChevronDownIcon className={cn("size-3 text-fg-tertiary transition-transform", !isOpen && "-rotate-90")} />
      </button>

      {isOpen ? (
        recent.length === 0 ? (
          <p className="px-2 py-1.5 text-xs text-fg-tertiary">
            최근 방문한 항목이 없습니다
          </p>
        ) : (
          <ul className="mt-0.5 space-y-0.5">
            {recent.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const dmUser = item.type === "dm" ? dmUserMap[item.id] : undefined;
              const starItem: StarredItem = { id: item.id, type: item.type, name: item.name, href: item.href };
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
                    <ItemIcon type={item.type} dmUser={dmUser} />
                    <span className="flex-1 truncate">{item.name}</span>
                    <StarButton wsId={wsId} item={starItem} onToggle={onToggleStar} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )
      ) : null}
    </section>
  );
}
