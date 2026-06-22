"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/features/auth/user-provider";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { getAccessToken } from "@/lib/auth/tokens";
import { getMembersApi, type WorkspaceMember } from "@/lib/api/member";
import type { AvatarColor, Presence } from "@/types/domain";

const AVATAR_COLORS: AvatarColor[] = [
  "blue", "purple", "green", "pink", "orange", "yellow", "teal",
];

function getAvatarColor(userId: string): AvatarColor {
  const sum = [...userId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const STATUS_TO_PRESENCE: Record<WorkspaceMember["user"]["status"], Presence> =
  {
    ONLINE: "online",
    AWAY: "away",
    DND: "dnd",
    OFFLINE: "offline",
  };

const STATUS_LABEL: Record<WorkspaceMember["user"]["status"], string> = {
  ONLINE: "온라인",
  AWAY: "자리비움",
  DND: "방해금지",
  OFFLINE: "오프라인",
};

export function TeamPresence() {
  const { user: currentUser } = useUser();
  const { currentWorkspace } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || !currentWorkspace) return;

    getMembersApi(token, currentWorkspace.id)
      .then((all) => {
        const active = all.filter(
          (m) =>
            m.user.status !== "OFFLINE" && m.userId !== currentUser?.id,
        );
        setMembers(active);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWorkspace, currentUser?.id]);

  return (
    <section
      aria-label="팀 현황"
      className="rounded-lg border border-border-subtle bg-surface-subtle"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-fg-primary">Team presence</h2>
        <span className="text-xs text-fg-tertiary">
          {loading ? "..." : `${members.length} online`}
        </span>
      </header>

      {loading ? (
        <div className="px-4 py-6 text-center text-sm text-fg-tertiary">
          불러오는 중...
        </div>
      ) : members.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-fg-tertiary">
          현재 온라인인 팀원이 없어요.
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-elevated"
            >
              <Avatar
                initials={getInitials(m.user.name)}
                color={getAvatarColor(m.userId)}
                size="sm"
                presence={STATUS_TO_PRESENCE[m.user.status]}
                name={m.user.name}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg-primary">{m.user.name}</p>
                <p className="truncate text-xs text-fg-tertiary">
                  {STATUS_LABEL[m.user.status]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
