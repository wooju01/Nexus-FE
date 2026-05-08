"use client";

import { useEffect, useRef, useState } from "react";

import { EditIcon, MessagesIcon, SmileIcon, TrashIcon, XIcon } from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import { getProfileApi } from "@/lib/api/auth";
import {
  getRepliesApi,
  addReplyApi,
  updateMessageApi,
  deleteMessageApi,
  addReactionApi,
  removeReactionApi,
  type Message,
} from "@/lib/api/message";
import { getSocket } from "@/lib/ws/client";
import { cn } from "@/lib/utils/cn";

const PRESET_EMOJIS = ["👍", "❤️", "😂", "🎉", "🙏", "👀", "🚀", "✅"];

type ReactionPayload = { messageId: string; userId: string; emoji: string };

function tiptapToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; text?: string; content?: unknown[] };
  if (n.text) return n.text;
  if (Array.isArray(n.content)) {
    const parts = n.content.map(tiptapToText);
    return n.type === "doc" ? parts.join("\n") : parts.join("");
  }
  return "";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupReactions(
  reactions: { emoji: string; userId: string }[] | null | undefined,
  currentUserId: string,
) {
  const map = new Map<string, { count: number; mine: boolean }>();
  for (const r of reactions ?? []) {
    const existing = map.get(r.emoji) ?? { count: 0, mine: false };
    map.set(r.emoji, {
      count: existing.count + 1,
      mine: existing.mine || r.userId === currentUserId,
    });
  }
  return [...map.entries()].map(([emoji, { count, mine }]) => ({ emoji, count, mine }));
}

type ThreadPanelProps = {
  messageId: string;
  onClose: () => void;
};

export function ThreadPanel({ messageId, onClose }: ThreadPanelProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getProfileApi(token).then((p) => setCurrentUserId(p.id)).catch(console.error);
    getRepliesApi(token, messageId)
      .then((r) => setReplies([...r].reverse()))
      .catch(console.error);
  }, [messageId]);

  useEffect(() => {
    const socket = getSocket();

    function onMessageCreated(message: Message) {
      if (message.parentId !== messageId) return;
      setReplies((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function onReactionAdded({ messageId: mid, userId, emoji }: ReactionPayload) {
      setReplies((prev) =>
        prev.map((m) =>
          m.id === mid
            ? { ...m, reactions: [...(m.reactions ?? []), { emoji, userId }] }
            : m,
        ),
      );
    }

    function onReactionRemoved({ messageId: mid, userId, emoji }: ReactionPayload) {
      setReplies((prev) =>
        prev.map((m) =>
          m.id === mid
            ? {
                ...m,
                reactions: (m.reactions ?? []).filter(
                  (r) => !(r.emoji === emoji && r.userId === userId),
                ),
              }
            : m,
        ),
      );
    }

    socket.on("message.created", onMessageCreated);
    socket.on("reaction.added", onReactionAdded);
    socket.on("reaction.removed", onReactionRemoved);

    return () => {
      socket.off("message.created", onMessageCreated);
      socket.off("reaction.added", onReactionAdded);
      socket.off("reaction.removed", onReactionRemoved);
    };
  }, [messageId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  async function handleSend() {
    if (!draft.trim() || isSending) return;
    const token = getAccessToken();
    if (!token) return;

    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: draft.trim() }] }],
    };
    setIsSending(true);
    try {
      await addReplyApi(token, messageId, content);
      setDraft("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  function startEdit(reply: Message) {
    setEditingId(reply.id);
    setEditDraft(tiptapToText(reply.content));
    setEmojiPickerFor(null);
  }

  async function handleEditSave(replyId: string) {
    if (!editDraft.trim()) return;
    const token = getAccessToken();
    if (!token) return;
    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: editDraft.trim() }] }],
    };
    try {
      await updateMessageApi(token, replyId, content);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(replyId: string) {
    const token = getAccessToken();
    if (!token) return;
    try {
      await deleteMessageApi(token, replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReactionToggle(replyId: string, emoji: string) {
    const token = getAccessToken();
    if (!token) return;

    const reply = replies.find((r) => r.id === replyId);
    const hasMine = (reply?.reactions ?? []).some(
      (r) => r.emoji === emoji && r.userId === currentUserId,
    );

    try {
      if (hasMine) {
        await removeReactionApi(token, replyId, emoji);
      } else {
        await addReactionApi(token, replyId, emoji);
      }
    } catch (err) {
      console.error(err);
    }
    setEmojiPickerFor(null);
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-border-subtle bg-surface-base"
      onClick={() => setEmojiPickerFor(null)}
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <MessagesIcon className="size-4 text-fg-tertiary" />
          <h2 className="text-sm font-semibold text-fg-primary">Thread</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="스레드 닫기"
          className="flex size-7 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <XIcon className="size-4" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {replies.length === 0 ? (
          <p className="text-center text-sm text-fg-tertiary">아직 답글이 없어요.</p>
        ) : (
          <div className="space-y-3">
            {replies.map((r) => {
              const grouped = groupReactions(r.reactions, currentUserId);
              return (
                <article key={r.id} className="group relative flex gap-2 rounded-md p-1 -mx-1 hover:bg-surface-elevated/30">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                    {r.author.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <header className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-fg-primary">
                        {r.author.name}
                      </span>
                      <time className="font-mono text-[11px] text-fg-tertiary">
                        {formatTime(r.createdAt)}
                      </time>
                    </header>
                    {editingId === r.id ? (
                      <div className="mt-1 flex flex-col gap-1">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(r.id); }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          rows={2}
                          autoFocus
                          className="w-full resize-none rounded-md border border-border-strong bg-surface-subtle px-2 py-1 text-sm text-fg-primary focus:outline-none"
                        />
                        <div className="flex gap-1 text-xs">
                          <button type="button" onClick={() => handleEditSave(r.id)} className="rounded bg-accent px-2 py-0.5 font-semibold text-white">저장</button>
                          <button type="button" onClick={() => setEditingId(null)} className="rounded px-2 py-0.5 text-fg-secondary hover:text-fg-primary">취소</button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-fg-primary">
                        {tiptapToText(r.content)}
                        {r.editedAt ? <span className="ml-1 text-[10px] text-fg-tertiary">(수정됨)</span> : null}
                      </p>
                    )}

                    {grouped.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {grouped.map(({ emoji, count, mine }) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactionToggle(r.id, emoji);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors",
                              mine
                                ? "border-accent/50 bg-accent/15 text-accent"
                                : "border-border-subtle bg-surface-elevated text-fg-secondary hover:border-border-default hover:text-fg-primary",
                            )}
                          >
                            <span className="text-sm leading-none">{emoji}</span>
                            <span className="font-medium">{count}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* hover 액션 툴바 */}
                  <div className="pointer-events-none absolute -top-2 right-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                    <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-overlay p-0.5 shadow-lg">
                      <div className="relative">
                        <button
                          type="button"
                          title="반응 추가"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmojiPickerFor((prev) => (prev === r.id ? null : r.id));
                          }}
                          className="flex size-6 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
                        >
                          <SmileIcon className="size-3.5" />
                        </button>
                        {emojiPickerFor === r.id ? (
                          <div
                            className="absolute right-0 top-7 z-20 flex gap-1 rounded-lg border border-border-subtle bg-surface-overlay p-1.5 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {PRESET_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReactionToggle(r.id, emoji)}
                                className="flex size-8 items-center justify-center rounded text-lg hover:bg-surface-elevated"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {r.authorId === currentUserId ? (
                        <>
                          <button
                            type="button"
                            title="메시지 수정"
                            onClick={() => startEdit(r)}
                            className="flex size-6 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
                          >
                            <EditIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="메시지 삭제"
                            onClick={() => handleDelete(r.id)}
                            className="flex size-6 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-red-500"
                          >
                            <TrashIcon className="size-3.5" />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-border-subtle px-4 py-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          placeholder="Reply to thread... (Enter로 전송)"
          className="w-full resize-none rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:border-border-strong focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </aside>
  );
}
