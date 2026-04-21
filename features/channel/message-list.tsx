import { Fragment } from "react";

import type { Message } from "@/types/domain";

import { MessageRow } from "./message-row";

type MessageListProps = {
  messages: ReadonlyArray<Message>;
  /** 현재 활성화된 스레드 루트 메시지 id (있으면 그 메시지는 하이라이트). */
  activeThreadId?: string;
  /** 특정 메시지의 스레드 URL 생성기 — 채널 뷰가 주입. */
  getThreadHref: (messageId: string) => string;
};

/**
 * 날짜 그룹별로 divider를 끼워 넣으며 메시지를 렌더.
 * 같은 사람의 연속 메시지는 현재 버전에서는 따로 묶지 않는다 (후속 작업).
 */
export function MessageList({
  messages,
  activeThreadId,
  getThreadHref,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12 text-center text-sm text-fg-tertiary">
        아직 대화가 없어요. 먼저 한마디 남겨보세요.
      </div>
    );
  }

  // dateGroupKey가 바뀔 때마다 divider 삽입.
  const elements: React.ReactNode[] = [];
  let lastGroupKey: string | undefined;

  for (const m of messages) {
    if (m.dateGroupKey !== lastGroupKey) {
      lastGroupKey = m.dateGroupKey;
      elements.push(
        <DateDivider key={`divider-${m.dateGroupKey}`} label={m.dateGroupLabel} />,
      );
    }

    elements.push(
      <Fragment key={m.id}>
        <MessageRow
          message={m}
          isActiveThread={m.id === activeThreadId}
          threadHref={
            m.replyCount && m.replyCount > 0 ? getThreadHref(m.id) : undefined
          }
        />
      </Fragment>,
    );
  }

  return <div className="flex flex-col py-3">{elements}</div>;
}

function DateDivider({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="relative my-2 flex items-center px-5"
    >
      <span className="h-px flex-1 bg-border-subtle" />
      <span className="mx-3 rounded-full border border-border-subtle bg-surface-subtle px-3 py-0.5 text-[11px] font-medium text-fg-secondary">
        {label}
      </span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
