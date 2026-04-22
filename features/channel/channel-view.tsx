import { getProjectBySlug } from "@/lib/mocks/projects";
import { getThreadReplies } from "@/lib/mocks/messages";
import type { Channel, Message } from "@/types/domain";

import { ChannelHeader } from "./channel-header";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { ThreadPanel } from "./thread-panel";

type ChannelViewProps = {
  channel: Channel;
  messages: ReadonlyArray<Message>;
  /** 활성 스레드 루트 메시지. 없으면 스레드 패인 숨김. */
  activeThread?: Message;
};

/**
 * 채널 페이지 메인 레이아웃.
 * 왼쪽: 헤더 + 메시지 리스트 + 컴포저 / 오른쪽: (선택) 스레드 패인.
 */
export function ChannelView({
  channel,
  messages,
  activeThread,
}: ChannelViewProps) {
  const memberIds = resolveMemberIds(channel);

  const threadReplies = activeThread ? getThreadReplies(activeThread.id) : [];

  // 스레드를 열 때 URL: 채널 경로 유지 + ?thread=<id>
  // 닫기 URL: 채널 경로만.
  const channelPath = `/channels/${channel.name}`;
  const getThreadHref = (messageId: string) =>
    `${channelPath}?thread=${messageId}`;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col">
        <ChannelHeader channel={channel} memberPreviewIds={memberIds} />

        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            activeThreadId={activeThread?.id}
            getThreadHref={getThreadHref}
          />
        </div>

        <MessageComposer
          placeholderTarget={`#${channel.name}`}
          variant="channel"
        />
      </section>

      {activeThread ? (
        <ThreadPanel
          channel={channel}
          root={activeThread}
          replies={threadReplies}
          closeHref={channelPath}
        />
      ) : null}
    </div>
  );
}

/**
 * 채널 멤버 id 리스트를 찾는다.
 * - linkedBoardProjectSlug가 있으면 해당 프로젝트 멤버를 우선 사용.
 * - 아니면 헤더 아바타 스택이 비어 보이지 않게 fallback 없이 빈 배열.
 */
function resolveMemberIds(channel: Channel): ReadonlyArray<string> {
  if (channel.linkedBoardProjectSlug) {
    const project = getProjectBySlug(channel.linkedBoardProjectSlug);
    if (project) return project.memberIds;
  }
  return [];
}
