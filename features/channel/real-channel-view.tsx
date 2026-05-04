"use client";

import { useEffect, useRef, useState } from "react";

import { HashIcon } from "@/components/icons";
import { getAccessToken } from "@/lib/auth/tokens";
import { getChannelApi, type Channel } from "@/lib/api/channel";
import { getMessagesApi, sendMessageApi, type Message } from "@/lib/api/message";
import { getSocket } from "@/lib/ws/client";

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

export function RealChannelView({ channelId }: { channelId: string }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    getChannelApi(token, channelId).then(setChannel).catch(console.error);

    getMessagesApi(token, channelId)
      .then((msgs) => setMessages([...msgs].reverse()))
      .catch(console.error);
  }, [channelId]);

  // Socket.io 실시간 연결
  useEffect(() => {
    const socket = getSocket();

    socket.emit("channel.join", channelId);

    socket.on("message.created", (message: Message) => {
      setMessages((prev) => {
        // 내가 보낸 메시지는 REST 응답에서 이미 추가했으므로 중복 제거
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.emit("channel.leave", channelId);
      socket.off("message.created");
    };
  }, [channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim() || isSending) return;
    const token = getAccessToken();
    if (!token) return;

    const content = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: draft.trim() }],
        },
      ],
    };

    setIsSending(true);
    try {
      await sendMessageApi(token, channelId, content);
      setDraft("");
      // 소켓의 message.created 이벤트에서 메시지를 추가하므로 여기서는 생략
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const channelName = channel?.name ?? "...";

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-5 py-3">
        <HashIcon className="size-4 text-fg-tertiary" />
        <h1 className="font-semibold text-fg-primary">{channelName}</h1>
        {channel?.topic ? (
          <span className="ml-1 text-sm text-fg-tertiary">· {channel.topic}</span>
        ) : null}
      </header>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-sm text-fg-tertiary">
              아직 대화가 없어요. 먼저 한마디 남겨보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <article key={m.id} className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                  {m.author.name[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <header className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-fg-primary">
                      {m.author.name}
                    </span>
                    <time className="font-mono text-[11px] text-fg-tertiary">
                      {formatTime(m.createdAt)}
                    </time>
                  </header>
                  <p className="whitespace-pre-wrap text-sm text-fg-primary">
                    {tiptapToText(m.content)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="shrink-0 border-t border-border-subtle px-5 py-3">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={`Message #${channelName}... (Enter로 전송, Shift+Enter 줄바꿈)`}
            className="flex-1 resize-none rounded-lg border border-border-subtle bg-surface-subtle px-3 py-2 text-sm text-fg-primary placeholder:text-fg-tertiary focus:border-border-strong focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            className="rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
