"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getAccessToken } from "@/lib/auth/tokens";
import { getMembersApi, type WorkspaceMember } from "@/lib/api/member";
import { createDmApi } from "@/lib/api/dm";

const STATUS_PRESENCE = {
  ONLINE: "online",
  AWAY: "away",
  DND: "dnd",
  OFFLINE: "offline",
} as const;

type DmStartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  currentUserId: string;
  onDmCreated?: () => void;
};

export function DmStartModal({
  isOpen,
  onClose,
  workspaceId,
  currentUserId,
  onDmCreated,
}: DmStartModalProps) {
  const router = useRouter();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [query, setQuery] = useState("");
  const [isCreating, setIsCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const token = getAccessToken();
    if (!token) return;
    getMembersApi(token, workspaceId).then(setMembers).catch(console.error);
    setQuery("");
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  const others = members.filter(
    (m) =>
      m.userId !== currentUserId &&
      m.user.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleSelect(targetUserId: string) {
    if (isCreating) return;
    const token = getAccessToken();
    if (!token) return;

    setIsCreating(targetUserId);
    try {
      const dm = await createDmApi(token, workspaceId, targetUserId);
      onDmCreated?.();
      onClose();
      router.push(`/channels/${dm.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-96 rounded-xl border border-border-subtle bg-surface-base shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <h2 className="text-sm font-semibold text-fg-primary">새 다이렉트 메시지</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름으로 검색..."
            autoFocus
            className="w-full rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:border-border-strong focus:outline-none"
          />
        </div>

        <ul className="max-h-72 overflow-y-auto px-2 pb-3">
          {others.length === 0 ? (
            <li className="py-6 text-center text-sm text-fg-tertiary">
              {query ? "검색 결과가 없어요." : "다른 멤버가 없어요."}
            </li>
          ) : (
            others.map((m) => (
              <li key={m.userId}>
                <button
                  type="button"
                  onClick={() => handleSelect(m.userId)}
                  disabled={isCreating === m.userId}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-elevated disabled:opacity-50"
                >
                  <Avatar
                    initials={m.user.name[0]?.toUpperCase() ?? "?"}
                    color="blue"
                    presence={STATUS_PRESENCE[m.user.status]}
                    size="sm"
                    name={m.user.name}
                  />
                  <span className="text-sm font-medium text-fg-primary">
                    {m.user.name}
                  </span>
                  {isCreating === m.userId ? (
                    <span className="ml-auto text-xs text-fg-tertiary">열기...</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
