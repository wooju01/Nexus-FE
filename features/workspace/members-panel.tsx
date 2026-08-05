"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { getMembersApi, type WorkspaceMember, type MemberRole } from "@/lib/api/member";
import { createDmApi } from "@/lib/api/dm";
import { sendFriendRequest, cancelFriendRequest, getSentFriendRequests, getFriends } from "@/lib/api/friend";
import { getAccessToken } from "@/lib/auth/tokens";
import { useWorkspace } from "@/features/workspace/workspace-provider";
import { useUser } from "@/features/auth/user-provider";
import { InviteModal } from "@/features/invitation/invite-modal";
import { cn } from "@/lib/utils/cn";
import { PeopleIcon, PlusIcon, XIcon } from "@/components/icons";

const ROLE_LABEL: Record<MemberRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  GUEST: "Guest",
};

const ROLE_STYLE: Record<MemberRole, string> = {
  OWNER: "bg-yellow-500/15 text-yellow-400",
  ADMIN: "bg-accent/15 text-accent",
  MEMBER: "bg-surface-elevated text-fg-tertiary",
  GUEST: "bg-surface-elevated text-fg-tertiary",
};

const STATUS_DOT: Record<string, string> = {
  ONLINE: "bg-green-400",
  AWAY: "bg-yellow-400",
  DND: "bg-red-400",
  OFFLINE: "bg-fg-tertiary/40",
};

type FriendState = "none" | "pending" | "friend";

type Props = {
  onClose: () => void;
};

export function MembersPanel({ onClose }: Props) {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const { user: me } = useUser();

  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loadedWorkspaceId, setLoadedWorkspaceId] = useState<string | null>(null);
  const isLoading = currentWorkspace ? loadedWorkspaceId !== currentWorkspace.id : true;
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [startingDmId, setStartingDmId] = useState<string | null>(null);

  // userId → { state, requestId? }
  const [friendMap, setFriendMap] = useState<Record<string, { state: FriendState; requestId?: string }>>({});
  const [friendActionId, setFriendActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentWorkspace) return;
    const workspaceId = currentWorkspace.id;

    Promise.all([
      getMembersApi(workspaceId),
      getSentFriendRequests().catch(() => []),
      getFriends().catch(() => []),
    ]).then(([memberList, sentRequests, friends]) => {
      setMembers(memberList);

      const map: Record<string, { state: FriendState; requestId?: string }> = {};
      for (const req of sentRequests) {
        if (req.receiver?.id) {
          map[req.receiver.id] = { state: "pending", requestId: req.id };
        }
      }
      for (const f of friends) {
        map[f.user.id] = { state: "friend" };
      }
      setFriendMap(map);
      setLoadedWorkspaceId(workspaceId);
    }).catch(console.error);
  }, [currentWorkspace]);

  async function handleStartDm(targetUserId: string) {
    const token = getAccessToken();
    if (!token || startingDmId) return;
    setStartingDmId(targetUserId);
    try {
      const dm = await createDmApi(token, targetUserId);
      window.dispatchEvent(new CustomEvent("nexus:dm-created", { detail: { dmId: dm.id } }));
      router.push(`/channels/${dm.id}`);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setStartingDmId(null);
    }
  }

  async function handleFriendAction(member: WorkspaceMember) {
    if (friendActionId) return;
    const current = friendMap[member.userId];
    setFriendActionId(member.userId);
    try {
      if (!current || current.state === "none") {
        const req = await sendFriendRequest(member.user.username);
        setFriendMap((prev) => ({
          ...prev,
          [member.userId]: { state: "pending", requestId: req.id },
        }));
      } else if (current.state === "pending" && current.requestId) {
        await cancelFriendRequest(current.requestId);
        setFriendMap((prev) => ({
          ...prev,
          [member.userId]: { state: "none" },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFriendActionId(null);
    }
  }

  const ownerAndAdmins = members.filter((m) => m.role === "OWNER" || m.role === "ADMIN");
  const regularMembers = members.filter((m) => m.role === "MEMBER" || m.role === "GUEST");

  return (
    <aside className="flex w-60 shrink-0 flex-col border-l border-border-subtle bg-surface-subtle">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <PeopleIcon className="size-4 text-fg-tertiary" />
          <span className="text-sm font-semibold text-fg-primary">멤버</span>
          {!isLoading && (
            <span className="text-xs text-fg-tertiary">{members.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            aria-label="멤버 초대"
            className="flex size-7 items-center justify-center rounded-md text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <PlusIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="패널 닫기"
            className="flex size-7 items-center justify-center rounded-md text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <p className="px-2 py-4 text-center text-xs text-fg-tertiary">불러오는 중…</p>
        ) : (
          <>
            {ownerAndAdmins.length > 0 && (
              <MemberGroup
                label="관리자"
                members={ownerAndAdmins}
                myId={me?.id}
                friendMap={friendMap}
                startingDmId={startingDmId}
                friendActionId={friendActionId}
                onStartDm={handleStartDm}
                onFriendAction={handleFriendAction}
              />
            )}
            {regularMembers.length > 0 && (
              <MemberGroup
                label="멤버"
                members={regularMembers}
                myId={me?.id}
                friendMap={friendMap}
                startingDmId={startingDmId}
                friendActionId={friendActionId}
                onStartDm={handleStartDm}
                onFriendAction={handleFriendAction}
              />
            )}
          </>
        )}
      </div>

      {currentWorkspace && (
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          workspaceId={currentWorkspace.id}
        />
      )}
    </aside>
  );
}

type GroupProps = {
  label: string;
  members: WorkspaceMember[];
  myId?: string;
  friendMap: Record<string, { state: FriendState; requestId?: string }>;
  startingDmId: string | null;
  friendActionId: string | null;
  onStartDm: (userId: string) => void;
  onFriendAction: (member: WorkspaceMember) => void;
};

function MemberGroup({ label, members, myId, friendMap, startingDmId, friendActionId, onStartDm, onFriendAction }: GroupProps) {
  return (
    <div className="mb-3">
      <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-fg-tertiary">
        {label} · {members.length}
      </p>
      <ul className="space-y-0.5">
        {members.map((m) => {
          const isMe = m.userId === myId;
          const friendInfo = friendMap[m.userId];
          const friendState: FriendState = friendInfo?.state ?? "none";

          return (
            <li key={m.userId} className="group flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-surface-elevated">
              {/* 클릭 → DM */}
              <button
                type="button"
                disabled={isMe || startingDmId !== null}
                onClick={() => !isMe && onStartDm(m.userId)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2.5 text-left",
                  isMe ? "cursor-default" : "cursor-pointer",
                  startingDmId === m.userId && "opacity-60",
                )}
              >
                {/* 아바타 + 상태 dot */}
                <div className="relative shrink-0">
                  <Avatar
                    initials={m.user.name.slice(0, 2).toUpperCase()}
                    color="blue"
                    size="sm"
                    name={m.user.name}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-surface-subtle",
                      STATUS_DOT[m.user.status] ?? STATUS_DOT.OFFLINE,
                    )}
                  />
                </div>

                {/* 이름 */}
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-fg-primary">
                    {m.user.name}
                    {isMe && <span className="ml-1 text-fg-tertiary">(나)</span>}
                  </span>
                  {m.user.jobTitle && (
                    <span className="block truncate text-[10px] text-fg-tertiary">{m.user.jobTitle}</span>
                  )}
                </div>
              </button>

              {/* 역할 + 친구 버튼 */}
              <div className="flex shrink-0 items-center gap-1">
                {!isMe && (
                  <FriendButton
                    state={friendState}
                    isLoading={friendActionId === m.userId}
                    onClick={() => onFriendAction(m)}
                  />
                )}
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", ROLE_STYLE[m.role])}>
                  {ROLE_LABEL[m.role]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FriendButton({ state, isLoading, onClick }: { state: FriendState; isLoading: boolean; onClick: () => void }) {
  if (state === "friend") {
    return (
      <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-green-500/15 text-green-400">
        친구
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={isLoading}
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-50",
        state === "pending"
          ? "bg-fg-tertiary/10 text-fg-tertiary hover:bg-priority-p1/10 hover:text-priority-p1"
          : "bg-accent/10 text-accent hover:bg-accent/20",
      )}
      title={state === "pending" ? "요청 취소" : "친구 추가"}
    >
      {isLoading ? "…" : state === "pending" ? "요청 중" : "+ 친구"}
    </button>
  );
}
