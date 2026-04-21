import { notFound } from "next/navigation";

import { ChannelView } from "@/features/channel/channel-view";
import { getChannelByName } from "@/lib/mocks/channels";
import {
  getMessage,
  getRootMessagesForChannel,
} from "@/lib/mocks/messages";

type ChannelPageProps = {
  // Next.js 16: params/searchParams 모두 Promise.
  params: Promise<{ name: string }>;
  searchParams: Promise<{ thread?: string }>;
};

export default async function ChannelPage({
  params,
  searchParams,
}: ChannelPageProps) {
  const [{ name }, { thread }] = await Promise.all([params, searchParams]);

  const channel = getChannelByName(name);
  if (!channel) notFound();

  const messages = getRootMessagesForChannel(channel.id);

  const activeThread = thread ? getMessage(thread) : undefined;
  // 잘못된 thread id는 조용히 무시.
  const safeActiveThread =
    activeThread && activeThread.channelId === channel.id
      ? activeThread
      : undefined;

  return (
    <ChannelView
      channel={channel}
      messages={messages}
      activeThread={safeActiveThread}
    />
  );
}
