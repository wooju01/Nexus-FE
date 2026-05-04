import { ChannelView } from "@/features/channel/channel-view";

type ChannelPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;
  return <ChannelView channelId={id} />;
}
