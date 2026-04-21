import Link from "next/link";

import {
  DocsIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PinIcon,
  ReplyIcon,
  SmileIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { getUser } from "@/lib/mocks/users";
import type { Message } from "@/types/domain";

import { MessageBody } from "./message-body";
import { ReactionPill } from "./reaction-pill";

type MessageRowProps = {
  message: Message;
  /** 스레드가 열려있고 이 메시지가 열린 스레드 루트인지 여부. */
  isActiveThread?: boolean;
  /** 스레드 열기 URL — 없으면 "Reply in thread" 버튼만 렌더. */
  threadHref?: string;
};

/**
 * 채널 메시지 한 줄.
 * hover 시 오른쪽 상단에 액션 툴바가 뜬다.
 */
export function MessageRow({
  message,
  isActiveThread,
  threadHref,
}: MessageRowProps) {
  const author = getUser(message.authorId);
  if (!author) return null;

  const threadPreview =
    message.replyCount && message.replyCount > 0 ? message.replyCount : null;

  const participants = (message.threadParticipantIds ?? [])
    .map((id) => getUser(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .slice(0, 3);

  return (
    <article
      className={`group relative flex gap-3 px-5 py-2.5 transition-colors hover:bg-surface-elevated/60 ${
        isActiveThread ? "bg-surface-elevated/40" : ""
      }`}
    >
      <Avatar
        initials={author.initials}
        color={author.avatarColor}
        size="md"
        presence={author.presence}
        name={author.name}
      />

      <div className="min-w-0 flex-1">
        <header className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-fg-primary">
            {author.name}
          </span>
          <time className="text-[11px] font-mono text-fg-tertiary">
            {message.timeLabel}
          </time>
        </header>

        <MessageBody body={message.body} />

        {message.attachments && message.attachments.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {message.attachments.map((att) => (
              <div
                key={att.name}
                className="inline-flex max-w-md items-center gap-2 rounded-md border border-border-subtle bg-surface-subtle px-3 py-2"
              >
                <DocsIcon className="size-4 shrink-0 text-fg-tertiary" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-fg-primary">
                    {att.name}
                  </p>
                  {att.subtitle ? (
                    <p className="truncate text-[11px] text-fg-tertiary">
                      {att.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {message.reactions && message.reactions.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.reactions.map((r) => (
              <ReactionPill key={r.emoji} reaction={r} />
            ))}
            <button
              type="button"
              title="반응 추가 — 준비 중"
              className="inline-flex items-center rounded-md border border-dashed border-border-subtle px-1.5 py-0.5 text-xs text-fg-tertiary hover:text-fg-primary"
            >
              <SmileIcon className="size-3.5" />
            </button>
          </div>
        ) : null}

        {threadPreview ? (
          <ThreadPreview
            count={threadPreview}
            href={threadHref}
            previewAvatars={participants.map((u) => ({
              id: u.id,
              initials: u.initials,
              color: u.avatarColor,
              name: u.name,
            }))}
          />
        ) : null}
      </div>

      {/* hover action toolbar */}
      <div className="pointer-events-none absolute -top-3 right-6 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-overlay p-0.5 shadow-lg">
          <ToolbarButton title="반응 추가">
            <SmileIcon className="size-4" />
          </ToolbarButton>
          {threadHref ? (
            <Link
              href={threadHref}
              title="스레드에서 답장"
              className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
            >
              <ReplyIcon className="size-4" />
            </Link>
          ) : (
            <ToolbarButton title="스레드에서 답장">
              <ReplyIcon className="size-4" />
            </ToolbarButton>
          )}
          <ToolbarButton title="플래그">
            <MessageSquareIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton title="핀 고정">
            <PinIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton title="더 보기">
            <MoreHorizontalIcon className="size-4" />
          </ToolbarButton>
        </div>
      </div>
    </article>
  );
}

function ToolbarButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={`${title} — 준비 중`}
      className="flex size-7 items-center justify-center rounded text-fg-secondary hover:bg-surface-elevated hover:text-fg-primary"
    >
      {children}
    </button>
  );
}

type ThreadPreviewProps = {
  count: number;
  href?: string;
  previewAvatars: ReadonlyArray<{
    id: string;
    initials: string;
    color: React.ComponentProps<typeof Avatar>["color"];
    name: string;
  }>;
};

function ThreadPreview({ count, href, previewAvatars }: ThreadPreviewProps) {
  const inner = (
    <>
      <div className="flex -space-x-1">
        {previewAvatars.map((u) => (
          <Avatar
            key={u.id}
            initials={u.initials}
            color={u.color}
            size="xs"
            name={u.name}
            className="ring-2 ring-surface-base"
          />
        ))}
      </div>
      <span className="text-xs font-medium text-accent">
        {count} replies
      </span>
      <span className="text-xs text-fg-tertiary">· 마지막 답장 보기</span>
    </>
  );

  const className =
    "mt-2 inline-flex items-center gap-2 rounded-md border border-border-subtle bg-surface-subtle px-2 py-1 transition-colors hover:border-border-default";

  if (!href) {
    return (
      <button type="button" disabled className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
