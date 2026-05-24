"use client";

import { useState } from "react";

import {
  AtSignIcon,
  CheckCircleIcon,
  CheckIcon,
  ReplyIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { INBOX_ITEMS } from "@/lib/mocks/inbox";
import { getUser } from "@/lib/mocks/users";
import { cn } from "@/lib/utils/cn";
import type { InboxItem, InboxItemKind } from "@/types/domain";

type TabKey = "all" | "mention" | "assigned" | "approval";

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "mention", label: "Mentions" },
  { key: "assigned", label: "Assigned" },
  { key: "approval", label: "Approvals" },
];

const KIND_LABEL: Record<InboxItemKind, string> = {
  mention: "Mention",
  reply: "Reply",
  assigned: "Assigned",
  approval: "Approval",
};

function KindIcon({ kind }: { kind: InboxItemKind }) {
  const className = "size-3.5";
  switch (kind) {
    case "mention":
      return <AtSignIcon className={className} />;
    case "reply":
      return <ReplyIcon className={className} />;
    case "assigned":
      return <CheckCircleIcon className={className} />;
    case "approval":
      return <CheckIcon className={className} />;
  }
}

function matchTab(item: InboxItem, tab: TabKey): boolean {
  if (tab === "all") return true;
  return item.kind === tab;
}

export function InboxList() {
  const [tab, setTab] = useState<TabKey>("all");
  const items = INBOX_ITEMS.filter((i) => matchTab(i, tab));

  return (
    <section
      aria-label="인박스"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">Inbox</h2>
        <nav
          role="tablist"
          aria-label="인박스 필터"
          className="flex items-center gap-1"
        >
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

      {items.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-fg-tertiary">
          해당 필터에 해당하는 항목이 없어요.
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {items.map((item) => (
            <InboxRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

function InboxRow({ item }: { item: InboxItem }) {
  const author = getUser(item.authorId);
  if (!author) return null;

  return (
    <li
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated",
        item.isUnread ? "bg-surface-subtle" : "bg-transparent",
      )}
    >
      <Avatar
        initials={author.initials}
        color={author.avatarColor}
        size="sm"
        presence={author.presence}
        name={author.name}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-fg-tertiary">
          <KindIcon kind={item.kind} />
          <span className="font-medium text-fg-secondary">
            {KIND_LABEL[item.kind]}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{item.sourceLabel}</span>
          <span aria-hidden="true">·</span>
          <time className="shrink-0">{item.relativeTime}</time>
        </div>
        <p
          className={cn(
            "mt-1 truncate text-sm",
            item.isUnread ? "text-fg-primary" : "text-fg-secondary",
          )}
        >
          <span className="font-medium text-fg-primary">{author.name}</span>
          <span className="text-fg-tertiary"> · </span>
          {item.body}
        </p>
      </div>

      {item.dueBadge ? (
        <span className="shrink-0 rounded-md bg-priority-p1/15 px-2 py-0.5 text-[10px] font-semibold text-priority-p1">
          {item.dueBadge}
        </span>
      ) : null}
      {item.isUnread ? (
        <span
          aria-label="읽지 않음"
          className="mt-2 size-2 shrink-0 rounded-full bg-accent"
        />
      ) : null}
    </li>
  );
}
