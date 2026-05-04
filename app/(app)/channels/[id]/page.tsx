import { RealChannelView } from "@/features/channel/real-channel-view";

type ChannelPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;
  return <RealChannelView channelId={id} />;
}
