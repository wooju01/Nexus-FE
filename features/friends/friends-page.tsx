"use client";

import { useState, useEffect, useCallback } from "react";

import {
  getFriendsApi,
  getReceivedRequestsApi,
  sendFriendRequestApi,
  acceptFriendRequestApi,
  declineFriendRequestApi,
  removeFriendApi,
} from "@/lib/api/friends";
import type { Friend, FriendRequest } from "@/lib/api/friends";

type Tab = "online" | "all" | "requests" | "add";

const STATUS_DOT: Record<string, string> = {
  ONLINE: "bg-green-500",
  AWAY: "bg-yellow-400",
  DND: "bg-red-500",
  OFFLINE: "bg-fg-tertiary/40",
};

export function FriendsPage() {
  const [tab, setTab] = useState<Tab>("online");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [addUsername, setAddUsername] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const load = useCallback(async () => {
    const [f, r] = await Promise.all([
      getFriendsApi(""),
      getReceivedRequestsApi(""),
    ]);
    setFriends(f);
    setRequests(r);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequestApi("", requestId);
    load();
  };

  const handleDecline = async (requestId: string) => {
    await declineFriendRequestApi("", requestId);
    load();
  };

  const handleRemove = async (friendUserId: string) => {
    await removeFriendApi("", friendUserId);
    load();
  };

  const handleSendRequest = async () => {
    if (!addUsername.trim()) return;
    setIsSending(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      await sendFriendRequestApi("", addUsername.trim());
      setAddSuccess(true);
      setAddUsername("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const onlineFriends = friends.filter((f) => f.user.status === "ONLINE" || f.user.status === "AWAY");
  const displayedFriends = tab === "online" ? onlineFriends : friends;

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-1 border-b border-border-subtle px-4 py-2">
        <span className="mr-3 font-semibold text-fg-primary">친구</span>
        {(["online", "all", "requests"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              tab === t
                ? "bg-surface-overlay font-medium text-fg-primary"
                : "text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
            }`}
          >
            {t === "online" ? "온라인" : t === "all" ? "모두" : `요청`}
            {t === "requests" && requests.length > 0 ? (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {requests.length}
              </span>
            ) : null}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setTab("add")}
          className={`ml-1 rounded px-3 py-1 text-sm font-medium transition-colors ${
            tab === "add"
              ? "bg-green-600 text-white"
              : "bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white"
          }`}
        >
          친구 추가하기
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 친구 추가 탭 */}
        {tab === "add" && (
          <div className="max-w-lg">
            <p className="mb-1 font-semibold text-fg-primary">친구 추가</p>
            <p className="mb-4 text-sm text-fg-secondary">
              상대방의 username 태그로 친구 요청을 보내세요.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-fg-tertiary">#</span>
                <input
                  type="text"
                  placeholder="username"
                  value={addUsername}
                  onChange={(e) => {
                    setAddUsername(e.target.value.toLowerCase());
                    setAddError(null);
                    setAddSuccess(false);
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendRequest(); }}
                  className="w-full rounded-lg border border-border-subtle bg-surface-elevated py-2 pl-7 pr-3 text-sm text-fg-primary placeholder:text-fg-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isSending || !addUsername.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSending ? "전송 중..." : "친구 요청 보내기"}
              </button>
            </div>
            {addError ? (
              <p className="mt-2 text-sm text-red-400">{addError}</p>
            ) : null}
            {addSuccess ? (
              <p className="mt-2 text-sm text-green-400">친구 요청을 보냈습니다!</p>
            ) : null}
          </div>
        )}

        {/* 요청 목록 탭 */}
        {tab === "requests" && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
              받은 요청 — {requests.length}명
            </p>
            {requests.length === 0 ? (
              <p className="text-sm text-fg-tertiary">받은 친구 요청이 없습니다.</p>
            ) : null}
            {requests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-elevated">
                <div className="relative size-9 shrink-0 rounded-full bg-surface-overlay">
                  {req.sender?.avatar ? (
                    <img src={req.sender.avatar} alt="" className="size-full rounded-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-medium text-fg-secondary">
                      {req.sender?.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-fg-primary">{req.sender?.name}</p>
                  {req.sender?.username ? (
                    <p className="text-xs text-fg-tertiary">#{req.sender.username}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleAccept(req.id)}
                  className="rounded-full bg-green-600/20 p-1.5 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                  title="수락"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecline(req.id)}
                  className="rounded-full bg-surface-elevated p-1.5 text-fg-tertiary hover:bg-red-600/20 hover:text-red-400 transition-colors"
                  title="거절"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 온라인/모두 탭 */}
        {(tab === "online" || tab === "all") && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-tertiary">
              {tab === "online" ? "온라인" : "모두"} — {displayedFriends.length}명
            </p>
            {displayedFriends.length === 0 ? (
              <p className="text-sm text-fg-tertiary">
                {tab === "online" ? "온라인 친구가 없습니다." : "친구가 없습니다."}
              </p>
            ) : null}
            {displayedFriends.map(({ friendRequestId, user }) => (
              <div key={friendRequestId} className="group flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-surface-elevated">
                <div className="relative size-9 shrink-0 rounded-full bg-surface-overlay">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="size-full rounded-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-medium text-fg-secondary">
                      {user.name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-surface-base ${STATUS_DOT[user.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-fg-primary">{user.name}</p>
                  {user.username ? (
                    <p className="text-xs text-fg-tertiary">#{user.username}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(user.id)}
                  className="invisible rounded-full p-1.5 text-fg-tertiary hover:bg-red-600/20 hover:text-red-400 transition-colors group-hover:visible"
                  title="친구 삭제"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
