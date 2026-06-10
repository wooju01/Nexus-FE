"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { EditIcon, HashIcon, ReplyIcon, SmileIcon, TrashIcon, XIcon } from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import { getProfileApi } from "@/lib/api/auth";
import { getChannelApi, type Channel } from "@/lib/api/channel";
import {
  getMessagesApi,
  sendMessageApi,
  updateMessageApi,
  deleteMessageApi,
  addReactionApi,
  removeReactionApi,
  type Message,
  type MessageAttachment,
} from "@/lib/api/message";
import { uploadFileApi } from "@/lib/api/upload";
import { getSocket } from "@/lib/ws/client";
import { cn } from "@/lib/utils/cn";

import { ThreadPanel } from "./thread-panel";

type PendingFile = {
  id: string;
  file: File;
  preview: string; // objectURL — 컴포넌트 언마운트 시 revoke 필요
  uploading: boolean;
  result: MessageAttachment | null;
  error: boolean;
};

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

function getDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (getDateKey(iso) === getDateKey(today.toISOString())) return "오늘";
  if (getDateKey(iso) === getDateKey(yesterday.toISOString())) return "어제";

  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
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

export function ChannelView({ channelId }: { channelId: string }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    getProfileApi(token).then((p) => setCurrentUserId(p.id)).catch(console.error);
    getChannelApi(token, channelId).then(setChannel).catch(console.error);
    getMessagesApi(token, channelId)
      .then((msgs) => setMessages([...msgs].reverse()))
      .catch(console.error);
  }, [channelId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("channel.join", channelId);

    // 소켓 재연결 시 채널 룸 재진입 (끊김→재연결 시 서버 룸에서 빠지기 때문)
    function onReconnect() {
      socket.emit("channel.join", channelId);
    }
    socket.on("connect", onReconnect);

    function onMessageCreated(message: Message) {
      if (message.parentId) {
        // 스레드 답글은 reply count만 업데이트
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.parentId
              ? { ...m, _count: { replies: (m._count?.replies ?? 0) + 1 } }
              : m,
          ),
        );
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function onReactionAdded({ messageId, userId, emoji }: ReactionPayload) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, reactions: [...(m.reactions ?? []), { emoji, userId }] }
            : m,
        ),
      );
    }

    function onReactionRemoved({ messageId, userId, emoji }: ReactionPayload) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
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

    function onMessageUpdated(message: Message) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, ...message } : m)),
      );
    }

    function onMessageDeleted({ messageId }: { messageId: string }) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }

    socket.on("message.created", onMessageCreated);
    socket.on("message.updated", onMessageUpdated);
    socket.on("message.deleted", onMessageDeleted);
    socket.on("reaction.added", onReactionAdded);
    socket.on("reaction.removed", onReactionRemoved);

    return () => {
      socket.emit("channel.leave", channelId);
      socket.off("connect", onReconnect);
      socket.off("message.created", onMessageCreated);
      socket.off("message.updated", onMessageUpdated);
      socket.off("message.deleted", onMessageDeleted);
      socket.off("reaction.added", onReactionAdded);
      socket.off("reaction.removed", onReactionRemoved);
    };
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // objectURL 메모리 누수 방지 — 파일이 제거될 때 revoke
  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const imageItems = Array.from(e.clipboardData.items).filter((item) =>
        item.type.startsWith("image/"),
      );
      if (imageItems.length === 0) return;

      e.preventDefault();

      const newFiles: PendingFile[] = imageItems
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null)
        .map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
          uploading: true,
          result: null,
          error: false,
        }));

      setPendingFiles((prev) => [...prev, ...newFiles]);

      // paste 즉시 업로드 — Discord/Slack 방식
      newFiles.forEach((pf) => {
        uploadFileApi(pf.file)
          .then((res) => {
            setPendingFiles((prev) =>
              prev.map((f) =>
                f.id === pf.id
                  ? {
                      ...f,
                      uploading: false,
                      result: {
                        id: pf.id,
                        fileUrl: res.url,
                        fileName: res.fileName,
                        mimeType: res.mimeType,
                        fileSize: res.fileSize,
                        thumbnailUrl: null,
                      },
                    }
                  : f,
              ),
            );
          })
          .catch(() => {
            setPendingFiles((prev) =>
              prev.map((f) => (f.id === pf.id ? { ...f, uploading: false, error: true } : f)),
            );
          });
      });
    },
    [],
  );

  function removePendingFile(id: string) {
    setPendingFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function handleSend() {
    const hasText = draft.trim().length > 0;
    const uploadedAttachments = pendingFiles
      .filter((f) => f.result !== null)
      .map((f) => f.result!);
    if ((!hasText && uploadedAttachments.length === 0) || isSending) return;

    // 아직 업로드 중인 파일이 있으면 대기
    if (pendingFiles.some((f) => f.uploading)) return;

    const token = getAccessToken();
    if (!token) return;

    const content = {
      type: "doc",
      content: hasText
        ? [{ type: "paragraph", content: [{ type: "text", text: draft.trim() }] }]
        : [{ type: "paragraph" }],
    };
    setIsSending(true);
    try {
      await sendMessageApi(
        token,
        channelId,
        content,
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      );
      setDraft("");
      setPendingFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  function startEdit(message: Message) {
    setEditingMessageId(message.id);
    setEditDraft(tiptapToText(message.content));
    setEmojiPickerFor(null);
  }

  async function handleEditSave(messageId: string) {
    if (!editDraft.trim()) return;
    const token = getAccessToken();
    if (!token) return;

    const content = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: editDraft.trim() }] }],
    };
    try {
      await updateMessageApi(token, messageId, content);
      setEditingMessageId(null);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(messageId: string) {
    const token = getAccessToken();
    if (!token) return;
    try {
      await deleteMessageApi(token, messageId);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReactionToggle(messageId: string, emoji: string) {
    const token = getAccessToken();
    if (!token) return;

    const message = messages.find((m) => m.id === messageId);
    const hasMine = (message?.reactions ?? []).some(
      (r) => r.emoji === emoji && r.userId === currentUserId,
    );

    try {
      if (hasMine) {
        await removeReactionApi(token, messageId, emoji);
      } else {
        await addReactionApi(token, messageId, emoji);
      }
    } catch (err) {
      console.error(err);
    }
    setEmojiPickerFor(null);
  }

  const channelName = channel?.name ?? "...";

  return (
    <div className="flex h-full" onClick={() => setEmojiPickerFor(null)}>
      {/* 메인 채널 영역 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-5 py-3">
          <HashIcon className="size-4 text-fg-tertiary" />
          <h1 className="font-semibold text-fg-primary">{channelName}</h1>
          {channel?.topic ? (
            <span className="ml-1 text-sm text-fg-tertiary">· {channel.topic}</span>
          ) : null}
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-fg-tertiary">
                아직 대화가 없어요. 먼저 한마디 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => {
                const grouped = groupReactions(m.reactions, currentUserId);
                const isActiveThread = activeThreadId === m.id;
                const replyCount = m._count?.replies ?? 0;
                const showDateDivider =
                  i === 0 || getDateKey(messages[i - 1]!.createdAt) !== getDateKey(m.createdAt);

                return (
                  <div key={m.id}>
                  {showDateDivider ? (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border-subtle" />
                      <span className="text-[11px] font-medium text-fg-tertiary">
                        {getDateLabel(m.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-border-subtle" />
                    </div>
                  ) : null}
                  <article
                    key={`msg-${m.id}`}
                    className={cn(
                      "group relative -mx-2 flex gap-3 rounded-md p-2 transition-colors",
                      isActiveThread
                        ? "bg-surface-elevated/50"
                        : "hover:bg-surface-elevated/30",
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                      {m.author.name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <header className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-fg-primary">
                          {m.author.name}
                        </span>
                        <time className="font-mono text-[11px] text-fg-tertiary">
                          {formatTime(m.createdAt)}
                        </time>
                      </header>
                      {editingMessageId === m.id ? (
                        <div className="mt-1 flex flex-col gap-1">
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleEditSave(m.id);
                              }
                              if (e.key === "Escape") setEditingMessageId(null);
                            }}
                            rows={2}
                            autoFocus
                            className="w-full resize-none rounded-md border border-border-strong bg-surface-subtle px-2 py-1 text-sm text-fg-primary focus:outline-none"
                          />
                          <div className="flex gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleEditSave(m.id)}
                              className="rounded bg-accent px-2 py-0.5 font-semibold text-white"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="rounded px-2 py-0.5 text-fg-secondary hover:text-fg-primary"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-sm text-fg-primary">
                            {tiptapToText(m.content)}
                            {m.editedAt ? (
                              <span className="ml-1 text-[10px] text-fg-tertiary">(수정됨)</span>
                            ) : null}
                          </p>
                          {m.attachments && m.attachments.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {m.attachments.map((att) =>
                                att.mimeType.startsWith("image/") ? (
                                  <a
                                    key={att.id}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={att.fileUrl}
                                      alt={att.fileName}
                                      className="max-h-72 max-w-xs rounded-lg border border-border-subtle object-contain hover:opacity-90"
                                    />
                                  </a>
                                ) : null,
                              )}
                            </div>
                          ) : null}
                        </>
                      )}

                      {grouped.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {grouped.map(({ emoji, count, mine }) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactionToggle(m.id, emoji);
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

                      {replyCount > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveThreadId((prev) => (prev === m.id ? null : m.id))
                          }
                          className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-subtle px-2 py-1 text-xs text-accent hover:border-border-default"
                        >
                          <span>{replyCount} replies</span>
                          <span className="text-fg-tertiary">· 클릭해서 보기</span>
                        </button>
                      ) : null}
                    </div>

                    {/* hover 액션 툴바 */}
                    <div className="pointer-events-none absolute -top-3 right-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                      <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-overlay p-0.5 shadow-lg">
                        <div className="relative">
                          <button
                            type="button"
                            title="반응 추가"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmojiPickerFor((prev) => (prev === m.id ? null : m.id));
                            }}
                            className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
                          >
                            <SmileIcon className="size-4" />
                          </button>
                          {emojiPickerFor === m.id ? (
                            <div
                              className="absolute right-0 top-8 z-20 flex gap-1 rounded-lg border border-border-subtle bg-surface-overlay p-1.5 shadow-xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {PRESET_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReactionToggle(m.id, emoji)}
                                  className="flex size-8 items-center justify-center rounded text-lg hover:bg-surface-elevated"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          title="스레드에서 답장"
                          onClick={() =>
                            setActiveThreadId((prev) => (prev === m.id ? null : m.id))
                          }
                          className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
                        >
                          <ReplyIcon className="size-4" />
                        </button>
                        {m.authorId === currentUserId ? (
                          <>
                            <button
                              type="button"
                              title="메시지 수정"
                              onClick={() => startEdit(m)}
                              className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
                            >
                              <EditIcon className="size-4" />
                            </button>
                            <button
                              type="button"
                              title="메시지 삭제"
                              onClick={() => handleDelete(m.id)}
                              className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-red-500"
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </article>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t border-border-subtle px-5 py-3">
          {/* 붙여넣기된 이미지 프리뷰 */}
          {pendingFiles.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingFiles.map((pf) => (
                <div key={pf.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pf.preview}
                    alt={pf.file.name}
                    className={cn(
                      "h-20 w-20 rounded-lg border border-border-subtle object-cover",
                      pf.error ? "opacity-40 grayscale" : "",
                    )}
                  />
                  {pf.uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                      <span className="text-[10px] font-medium text-white">업로드 중...</span>
                    </div>
                  ) : null}
                  {pf.error ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                      <span className="text-[10px] font-medium text-red-400">실패</span>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removePendingFile(pf.id)}
                    className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-surface-overlay text-fg-secondary hover:text-fg-primary"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onPaste={handlePaste}
              rows={2}
              placeholder={`Message #${channelName}... (Enter로 전송, Ctrl+V로 이미지 첨부)`}
              className="flex-1 resize-none rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:border-border-strong focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={
                (!draft.trim() && pendingFiles.filter((f) => f.result).length === 0) ||
                isSending ||
                pendingFiles.some((f) => f.uploading)
              }
              className="rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pendingFiles.some((f) => f.uploading) ? "업로드 중..." : "전송"}
            </button>
          </div>
        </div>
      </div>

      {/* 스레드 패널 */}
      {activeThreadId ? (
        <ThreadPanel
          messageId={activeThreadId}
          onClose={() => setActiveThreadId(null)}
        />
      ) : null}
    </div>
  );
}
