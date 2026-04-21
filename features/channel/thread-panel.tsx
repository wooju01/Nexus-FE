import Link from "next/link";

import { MessagesIcon, XIcon } from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getUser } from "@/lib/mocks/users";
import type { Channel, Message } from "@/types/domain";

import { MessageBody } from "./message-body";
import { MessageComposer } from "./message-composer";
import { ReactionPill } from "./reaction-pill";

type ThreadPanelProps = {
  channel: Channel;
  root: Message;
  replies: ReadonlyArray<Message>;
  /** 닫기 시 돌아갈 URL. */
  closeHref: string;
};

/**
 * 채널 오른쪽에 붙는 스레드 드로어.
 * - 상단: 스레드 헤더 + 닫기
 * - 루트 메시지 + "N replies · 참여자 이름" 구분선 + 답글 리스트
 * - 하단: 스레드 컴포저
 */
export function ThreadPanel({
  channel,
  root,
  replies,
  closeHref,
}: ThreadPanelProps) {
  const rootAuthor = getUser(root.authorId);
  if (!rootAuthor) return null;

  const participants = (root.threadParticipantIds ?? [])
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const namedParticipants = participants.slice(0, 2).map((u) => u.name);
  const remaining = Math.max(participants.length - namedParticipants.length, 0);

  return (
    <aside
      aria-label="스레드"
      className="flex w-96 shrink-0 flex-col border-l border-border-subtle bg-surface-base"
    >
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <MessagesIcon className="size-4 text-fg-tertiary" />
          <div className="leading-tight">
            <h2 className="text-sm font-semibold text-fg-primary">Thread</h2>
            <p className="text-[11px] text-fg-tertiary">
              in #{channel.name}
            </p>
          </div>
        </div>
        <Link
          href={closeHref}
          aria-label="스레드 닫기"
          title="스레드 닫기"
          className="flex size-7 items-center justify-center rounded text-fg-tertiary hover:bg-surface-elevated hover:text-fg-primary"
        >
          <XIcon className="size-4" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* 루트 메시지 */}
        <div className="flex gap-3 px-4 py-3">
          <Avatar
            initials={rootAuthor.initials}
            color={rootAuthor.avatarColor}
            size="md"
            presence={rootAuthor.presence}
            name={rootAuthor.name}
          />
          <div className="min-w-0 flex-1">
            <header className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-fg-primary">
                {rootAuthor.name}
              </span>
              <time className="text-[11px] font-mono text-fg-tertiary">
                {root.timeLabel}
              </time>
            </header>
            <MessageBody body={root.body} />
          </div>
        </div>

        {/* N replies 구분선 */}
        <div className="flex items-center gap-3 border-y border-border-subtle bg-surface-subtle px-4 py-2">
          <span className="text-xs font-medium text-fg-secondary">
            {root.replyCount ?? replies.length} replies
          </span>
          {namedParticipants.length > 0 ? (
            <span className="truncate text-xs text-fg-tertiary">
              · {namedParticipants.join(", ")}
              {remaining > 0 ? `, +${remaining}` : ""}
            </span>
          ) : null}
        </div>

        {/* 답글들 */}
        <ul className="divide-y divide-border-subtle">
          {replies.map((reply) => {
            const author = getUser(reply.authorId);
            if (!author) return null;
            return (
              <li key={reply.id} className="flex gap-3 px-4 py-3">
                <Avatar
                  initials={author.initials}
                  color={author.avatarColor}
                  size="sm"
                  presence={author.presence}
                  name={author.name}
                />
                <div className="min-w-0 flex-1">
                  <header className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-fg-primary">
                      {author.name}
                    </span>
                    <time className="text-[11px] font-mono text-fg-tertiary">
                      {reply.timeLabel}
                    </time>
                  </header>
                  <MessageBody body={reply.body} />
                  {reply.reactions && reply.reactions.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {reply.reactions.map((r) => (
                        <ReactionPill key={r.emoji} reaction={r} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <MessageComposer placeholderTarget="thread" variant="thread" />
    </aside>
  );
}
